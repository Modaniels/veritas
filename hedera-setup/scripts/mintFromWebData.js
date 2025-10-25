const {
  TokenMintTransaction,
  PrivateKey,
  Hbar
} = require("@hashgraph/sdk");
const { initializeClient, closeClient } = require("./initializeHedera");
const axios = require("axios");
require("dotenv").config({ path: "../.env" });

/**
 * Upload product metadata to Pinata IPFS (using existing CID)
 */
async function useExistingPinataData(ipfsCID) {
  try {
    console.log(`📦 Using existing Pinata data: ${ipfsCID}`);
    console.log(`   Gateway URL: https://jade-known-chimpanzee-227.mypinata.cloud/ipfs/${ipfsCID}`);
    return ipfsCID;
  } catch (error) {
    console.error("❌ Error with existing Pinata data:", error);
    throw error;
  }
}

/**
 * Mint NFT using data from web interface
 */
async function mintFromWebData(nfcSerialId, ipfsCID) {
  let client;
  try {
    console.log("\n🚀 Starting Real NFT Minting from Web Data...\n");

    // Initialize Hedera client
    client = await initializeClient();

    // Get credentials
    const treasuryKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
    const nftTokenId = process.env.NFT_TOKEN_ID;

    if (!nftTokenId) {
      throw new Error("NFT_TOKEN_ID not found. Run deployTokens.js first.");
    }

    console.log(`🏷️  NFC Serial ID: ${nfcSerialId}`);
    console.log(`📦 IPFS CID: ${ipfsCID}`);

    // Create compact metadata for Hedera NFT
    // Format: NFC_ID:IPFS_HASH (under 100 bytes)
    const compactMetadata = `${nfcSerialId}:${ipfsCID}`;
    const metadataBytes = Buffer.from(compactMetadata);

    console.log(`\n🔨 Minting NFT on Hedera...`);
    console.log(`   Token ID: ${nftTokenId}`);
    console.log(`   Metadata: ${compactMetadata}`);

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

    console.log(`\n✅ NFT Minted Successfully!`);
    console.log(`   Serial Number: ${serialNumber}`);
    console.log(`   Transaction ID: ${transactionId}`);
    console.log(`   IPFS CID: ${ipfsCID}`);
    console.log(`   NFC Serial ID: ${nfcSerialId}`);
    console.log(`\n🔍 View on HashScan:`);
    console.log(`   https://hashscan.io/testnet/token/${nftTokenId}/${serialNumber}`);
    console.log(`\n📄 View Metadata:`);
    console.log(`   https://jade-known-chimpanzee-227.mypinata.cloud/ipfs/${ipfsCID}`);
    console.log(`\n✅ This NFT can now be verified in the veritas-scan app!`);

    return {
      success: true,
      serialNumber,
      transactionId,
      ipfsHash: ipfsCID,
      nfcSerialId: nfcSerialId
    };

  } catch (error) {
    console.error("\n❌ Minting failed:", error.message);
    throw error;
  } finally {
    if (client) {
      await closeClient(client);
    }
  }
}

// Command line usage: node mintFromWebData.js [nfcSerialId] [ipfsCID]
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.log("\n📝 Usage: node mintFromWebData.js <nfcSerialId> <ipfsCID>");
    console.log("\nExample:");
    console.log("   node mintFromWebData.js fgthbnm QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    console.log("\n💡 Get the IPFS CID from the ledger-hub success message");
    process.exit(1);
  }

  const [nfcSerialId, ipfsCID] = args;
  
  console.log(`\n🎯 Creating real NFT for data from web interface:`);
  console.log(`   NFC Serial ID: ${nfcSerialId}`);
  console.log(`   IPFS CID: ${ipfsCID}`);

  mintFromWebData(nfcSerialId, ipfsCID)
    .then(() => {
      console.log("\n🎉 Success! You can now verify this product in veritas-scan.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed:", error);
      process.exit(1);
    });
}

module.exports = { mintFromWebData };