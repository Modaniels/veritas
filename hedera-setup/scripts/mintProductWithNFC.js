const {
  TokenMintTransaction,
  PrivateKey,
  Hbar
} = require("@hashgraph/sdk");
const { initializeClient, closeClient } = require("./initializeHedera");
const axios = require("axios");
require("dotenv").config({ path: "../.env" });

/**
 * Upload product metadata to Pinata IPFS
 */
async function uploadToPinata(productData) {
  try {
    console.log("📤 Uploading metadata to Pinata...");

    const pinataJWT = process.env.PINATA_JWT;
    if (!pinataJWT) {
      throw new Error("PINATA_JWT not configured in .env file");
    }

    const metadata = {
      name: productData.name,
      description: productData.description,
      image: productData.image || "",
      attributes: [
        { trait_type: "NFC_Serial_ID", value: productData.nfcSerialId },
        { trait_type: "Category", value: productData.category },
        { trait_type: "Manufacturer", value: productData.manufacturer },
        { trait_type: "Manufacturing_Date", value: productData.manufacturingDate },
        { trait_type: "Serial_Number", value: productData.serialNumber }
      ]
    };

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        pinataContent: metadata,
        pinataMetadata: {
          name: `Veritas-${productData.nfcSerialId}.json`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${pinataJWT}`,
          "Content-Type": "application/json"
        }
      }
    );

    const ipfsHash = response.data.IpfsHash;
    console.log(`✅ Metadata uploaded to Pinata: ${ipfsHash}`);
    console.log(`   Gateway URL: https://jade-known-chimpanzee-227.mypinata.cloud/ipfs/${ipfsHash}`);

    return ipfsHash;
  } catch (error) {
    console.error("❌ Error uploading to Pinata:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Mint NFT with embedded NFC Serial ID
 */
async function mintProductNFT(productData) {
  let client;
  try {
    console.log("\n🚀 Starting Product NFT Minting with NFC ID...\n");

    // Initialize Hedera client
    client = await initializeClient();

    // Get credentials
    const treasuryKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
    const nftTokenId = process.env.NFT_TOKEN_ID;

    if (!nftTokenId) {
      throw new Error("NFT_TOKEN_ID not found. Run deployTokens.js first.");
    }

    console.log(`📦 Product: ${productData.name}`);
    console.log(`🏷️  NFC Serial ID: ${productData.nfcSerialId}`);

    // Step 1: Upload metadata to Pinata
    const ipfsHash = await uploadToPinata(productData);

    // Step 2: Create compact metadata for Hedera NFT
    // Format: NFC_ID:IPFS_HASH (under 100 bytes)
    const compactMetadata = `${productData.nfcSerialId}:${ipfsHash}`;
    const metadataBytes = Buffer.from(compactMetadata);

    console.log(`\n🔨 Minting NFT on Hedera...`);
    console.log(`   Token ID: ${nftTokenId}`);
    console.log(`   Metadata: ${compactMetadata}`);

    // Step 3: Mint NFT
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
    console.log(`   IPFS CID: ${ipfsHash}`);
    console.log(`   NFC Serial ID: ${productData.nfcSerialId}`);
    console.log(`\n🔍 View on HashScan:`);
    console.log(`   https://hashscan.io/testnet/token/${nftTokenId}/${serialNumber}`);
    console.log(`\n📄 View Metadata:`);
    console.log(`   https://jade-known-chimpanzee-227.mypinata.cloud/ipfs/${ipfsHash}`);

    return {
      success: true,
      serialNumber,
      transactionId,
      ipfsHash,
      nfcSerialId: productData.nfcSerialId
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

// Example usage
if (require.main === module) {
  const exampleProduct = {
    name: "Premium Leather Wallet",
    description: "Handcrafted premium leather wallet with RFID protection",
    category: "Accessories",
    manufacturer: "Veritas Corp",
    manufacturingDate: "2025-10-25",
    serialNumber: "SN-2025-WL-002",
    nfcSerialId: "fgthbnm", // The NFC ID you want to verify
    image: "https://example.com/wallet-image.jpg" // Optional
  };

  mintProductNFT(exampleProduct)
    .then(() => {
      console.log("\n🎉 Complete! You can now verify this product in the customer app.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed:", error);
      process.exit(1);
    });
}

module.exports = { mintProductNFT, uploadToPinata };
