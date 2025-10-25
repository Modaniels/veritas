/**
 * Backend script to mint NFTs with product metadata
 * Uploads full metadata to Pinata IPFS and stores compact reference on Hedera
 * 
 * Usage: node mintNFT.js <nfcSerialId> <productName> <category> [description]
 * Example: node mintNFT.js "NFC-001" "Premium Headphones" "Electronics" "High quality wireless"
 */

require('dotenv').config({ path: '../.env' });
const {
  Client,
  PrivateKey,
  TokenMintTransaction,
  TokenId,
  AccountId
} = require("@hashgraph/sdk");
const axios = require("axios");

/**
 * Upload product metadata to Pinata IPFS
 */
async function uploadToPinata(productData) {
  try {
    console.log("📤 Uploading metadata to Pinata...");
    
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      throw new Error("PINATA_JWT not configured in .env");
    }

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      productData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      }
    );

    const cid = response.data.IpfsHash;
    console.log(`✅ Uploaded to Pinata: ${cid}`);
    console.log(`   Gateway URL: https://${process.env.IPFS_GATEWAY_URL}/ipfs/${cid}`);
    
    return cid;
  } catch (error) {
    console.error("❌ Error uploading to Pinata:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Mint NFT with product metadata
 */
async function mintProductNFT(nfcSerialId, productName, category, description = "") {
  try {
    console.log("\n🚀 Starting Product NFT Minting Process...\n");
    console.log(`📦 Product: ${productName}`);
    console.log(`🏷️  Category: ${category}`);
    console.log(`🔖 NFC ID: ${nfcSerialId}`);

    // Step 1: Create product metadata
    const productData = {
      nfcSerialId: nfcSerialId,
      name: productName,
      category: category,
      description: description,
      manufacturer: "Veritas Corp",
      manufacturingDate: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      version: "1.0"
    };

    console.log("\n📄 Product Metadata:");
    console.log(JSON.stringify(productData, null, 2));

    // Step 2: Upload to Pinata
    const ipfsCID = await uploadToPinata(productData);

    // Step 3: Create compact metadata for Hedera (must be < 100 bytes)
    const compactMetadata = JSON.stringify({
      nfc: nfcSerialId,
      cid: ipfsCID
    });

    const metadataBytes = Buffer.from(compactMetadata, 'utf-8');
    console.log(`\n📏 Hedera Metadata (${metadataBytes.length} bytes): ${compactMetadata}`);
    
    if (metadataBytes.length > 100) {
      throw new Error(`Metadata too long (${metadataBytes.length} bytes, max 100).`);
    }

    // Step 4: Initialize Hedera client
    const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const operatorKey = PrivateKey.fromStringDer(process.env.HEDERA_PRIVATE_KEY);
    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);

    console.log(`\n🔗 Connected to Hedera Testnet as ${operatorId}`);

    const nftTokenId = TokenId.fromString(process.env.NFT_TOKEN_ID);
    console.log(`🎨 NFT Token: ${nftTokenId}`);

    // Step 5: Mint NFT on Hedera
    console.log("\n🔨 Minting NFT on Hedera...");
    
    const mintTx = await new TokenMintTransaction()
      .setTokenId(nftTokenId)
      .setMetadata([metadataBytes])
      .freezeWith(client);

    const signedTx = await mintTx.sign(operatorKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    const serialNumber = receipt.serials[0].toString();

    console.log("\n🎉 NFT Minted Successfully!");
    console.log("═".repeat(60));
    console.log(`NFT Serial Number: ${serialNumber}`);
    console.log(`Token ID: ${nftTokenId}`);
    console.log(`Transaction ID: ${txResponse.transactionId.toString()}`);
    console.log(`NFC Serial ID: ${nfcSerialId}`);
    console.log(`IPFS CID: ${ipfsCID}`);
    console.log(`\n🔍 View on HashScan:`);
    console.log(`https://hashscan.io/testnet/token/${nftTokenId}/${serialNumber}`);
    console.log(`\n📄 View Metadata on IPFS:`);
    console.log(`https://${process.env.IPFS_GATEWAY_URL}/ipfs/${ipfsCID}`);
    console.log("═".repeat(60));

    client.close();

    return {
      success: true,
      serialNumber,
      tokenId: nftTokenId.toString(),
      transactionId: txResponse.transactionId.toString(),
      nfcSerialId,
      ipfsCID
    };

  } catch (error) {
    console.error("\n❌ Minting failed:", error.message);
    throw error;
  }
}

// Run if executed directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log("\n📖 Usage: node mintNFT.js <NFC_SERIAL_ID> <PRODUCT_NAME> <CATEGORY> [DESCRIPTION]");
    console.log("\n📝 Examples:");
    console.log('   node mintNFT.js "NFC-001" "Premium Headphones" "Electronics" "High quality wireless"');
    console.log('   node mintNFT.js "NFC-002" "Leather Wallet" "Accessories"\n');
    process.exit(1);
  }

  const [nfcId, name, category, description] = args;
  
  mintProductNFT(nfcId, name, category, description || "")
    .then((result) => {
      console.log("\n✅ Process completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Process failed:", error);
      process.exit(1);
    });
}

module.exports = { mintProductNFT, uploadToPinata };
