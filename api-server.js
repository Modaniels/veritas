const express = require('express');
const cors = require('cors');
const {
  TokenMintTransaction,
  PrivateKey,
  Hbar
} = require("@hashgraph/sdk");
const { initializeClient, closeClient } = require("./hedera-setup/scripts/initializeHedera");
require("dotenv").config();

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Veritas API Server is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Test Hedera connection endpoint
 */
app.get('/test-hedera', async (req, res) => {
  try {
    console.log("🔗 Testing Hedera connection...");
    const client = await initializeClient();
    console.log("✅ Hedera connection successful");
    await closeClient(client);
    
    res.json({
      status: 'success',
      message: 'Hedera connection successful',
      network: process.env.HEDERA_NETWORK || 'testnet'
    });
  } catch (error) {
    console.error("❌ Hedera connection failed:", error);
    res.status(500).json({
      status: 'error',
      message: 'Hedera connection failed',
      error: error.message
    });
  }
});

/**
 * Mint NFT endpoint - called by ledger-hub
 */
app.post('/api/mint-nft', async (req, res) => {
  let client;
  try {
    console.log('\n🚀 API: Minting NFT request received');
    console.log('📦 Request data:', req.body);

    const { nfcSerialId, ipfsCID, productData } = req.body;

    if (!nfcSerialId || !ipfsCID) {
      return res.status(400).json({
        error: 'Missing required fields: nfcSerialId and ipfsCID are required'
      });
    }

    // Initialize Hedera client
    client = await initializeClient();

    // Get credentials
    const treasuryKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
    const nftTokenId = process.env.NFT_TOKEN_ID;

    if (!nftTokenId) {
      throw new Error("NFT_TOKEN_ID not found. Run deployTokens.js first.");
    }

    console.log(`🔨 Minting NFT on Hedera...`);
    console.log(`   Token ID: ${nftTokenId}`);
    console.log(`   NFC Serial ID: ${nfcSerialId}`);
    console.log(`   IPFS CID: ${ipfsCID}`);

    // Create compact metadata for Hedera NFT
    // Format: NFC_ID:IPFS_HASH (under 100 bytes)
    const compactMetadata = `${nfcSerialId}:${ipfsCID}`;
    const metadataBytes = Buffer.from(compactMetadata);

    // Mint NFT
    const mintTx = await new TokenMintTransaction()
      .setTokenId(nftTokenId)
      .setMetadata([metadataBytes])
      .setMaxTransactionFee(new Hbar(20))
      .freezeWith(client);

    const signedTx = await mintTx.sign(treasuryKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    const serialNumber = receipt.serials[0].toString();
    const transactionId = txResponse.transactionId.toString();

    const result = {
      success: true,
      serialNumber,
      transactionId,
      metadataCID: ipfsCID,
      nfcSerialId,
      tokenId: nftTokenId,
      timestamp: new Date().toISOString(),
      network: 'testnet',
      ipfsUrl: `https://jade-known-chimpanzee-227.mypinata.cloud/ipfs/${ipfsCID}`,
      hashscanUrl: `https://hashscan.io/testnet/token/${nftTokenId}/${serialNumber}`,
      blockchainMetadata: compactMetadata
    };

    console.log(`\n✅ NFT Minted Successfully!`);
    console.log(`   Serial Number: ${serialNumber}`);
    console.log(`   Transaction ID: ${transactionId}`);
    console.log(`   View on HashScan: ${result.hashscanUrl}`);

    res.json(result);

  } catch (error) {
    console.error('\n❌ API: Minting failed:', error.message);
    res.status(500).json({
      error: 'Failed to mint NFT',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    if (client) {
      await closeClient(client);
    }
  }
});

/**
 * Get NFT info endpoint
 */
app.get('/api/nft/:tokenId/:serialNumber', async (req, res) => {
  try {
    const { tokenId, serialNumber } = req.params;
    
    // Query Mirror Node for NFT info
    const mirrorNodeUrl = `https://testnet.mirrornode.hedera.com/api/v1/tokens/${tokenId}/nfts/${serialNumber}`;
    const response = await fetch(mirrorNodeUrl);
    
    if (!response.ok) {
      throw new Error(`Mirror Node returned ${response.status}`);
    }
    
    const nftData = await response.json();
    res.json(nftData);
    
  } catch (error) {
    console.error('Error fetching NFT info:', error);
    res.status(500).json({
      error: 'Failed to fetch NFT info',
      message: error.message
    });
  }
});

// Start the server
console.log("🚀 Starting Veritas API Server...");

const server = app.listen(PORT, () => {
  console.log(`\n✅ Veritas API Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test Hedera: http://localhost:${PORT}/test-hedera`);
  console.log(`🔨 Mint endpoint: POST http://localhost:${PORT}/api/mint-nft`);
  console.log(`📦 NFT info: GET http://localhost:${PORT}/api/nft/:tokenId/:serialNumber`);
  console.log(`\n💡 Server is ready for requests!`);
  console.log(`🔥 Keep this terminal open to maintain the server\n`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️ Shutting down server...');
  server.close(() => {
    console.log('🔒 Server closed');
    process.exit(0);
  });
});

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('\n⚠️ Received SIGTERM. Shutting down...');
  server.close(() => {
    console.log('🔒 Server closed');
    process.exit(0);
  });
});

// Prevent the process from exiting
process.stdin.resume();