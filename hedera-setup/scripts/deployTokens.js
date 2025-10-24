const {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  PrivateKey,
  AccountId,
  TokenInfoQuery,
  Hbar
} = require("@hashgraph/sdk");
const { initializeClient, closeClient } = require("./initializeHedera");
require("dotenv").config({ path: "../.env" });
const fs = require("fs");
const path = require("path");

/**
 * Create a Fungible Utility Token
 * This token can be used for transaction fees or rewards within the Veritas ecosystem
 */
async function createUtilityToken(client, treasuryId, treasuryKey) {
  try {
    console.log("\n💰 Creating Utility Token (Fungible)...");

    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName("Veritas Utility Token")
      .setTokenSymbol("VUT")
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(2)
      .setInitialSupply(1000000) // 1,000,000.00 VUT
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setAdminKey(treasuryKey.publicKey)
      .setSupplyKey(treasuryKey.publicKey)
      .setFreezeKey(treasuryKey.publicKey)
      .setWipeKey(treasuryKey.publicKey)
      .freezeWith(client);

    const signedTx = await tokenCreateTx.sign(treasuryKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const tokenId = receipt.tokenId;

    console.log(`✅ Utility Token created with ID: ${tokenId}`);
    
    // Query token info
    const tokenInfo = await new TokenInfoQuery()
      .setTokenId(tokenId)
      .execute(client);
    
    console.log(`   Name: ${tokenInfo.name}`);
    console.log(`   Symbol: ${tokenInfo.symbol}`);
    console.log(`   Total Supply: ${tokenInfo.totalSupply}`);

    return tokenId;
  } catch (error) {
    console.error("❌ Error creating utility token:", error);
    throw error;
  }
}

/**
 * Create the NFT Token Type for Veritas Products
 * Each NFT represents a unique physical product
 */
async function createProductNFT(client, treasuryId, treasuryKey) {
  try {
    console.log("\n🎨 Creating Product NFT Token Type...");

    const nftCreateTx = await new TokenCreateTransaction()
      .setTokenName("Veritas Product NFT")
      .setTokenSymbol("VPNFT")
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setAdminKey(treasuryKey.publicKey)
      .setSupplyKey(treasuryKey.publicKey)
      .setWipeKey(treasuryKey.publicKey)
      .setMaxTransactionFee(new Hbar(30))
      .freezeWith(client);

    const signedTx = await nftCreateTx.sign(treasuryKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const tokenId = receipt.tokenId;

    console.log(`✅ Product NFT Token created with ID: ${tokenId}`);
    
    // Query token info
    const tokenInfo = await new TokenInfoQuery()
      .setTokenId(tokenId)
      .execute(client);
    
    console.log(`   Name: ${tokenInfo.name}`);
    console.log(`   Symbol: ${tokenInfo.symbol}`);
    console.log(`   Total Supply: ${tokenInfo.totalSupply}`);

    return tokenId;
  } catch (error) {
    console.error("❌ Error creating NFT token:", error);
    throw error;
  }
}

/**
 * Mint a test NFT with sample IPFS metadata
 */
async function mintTestNFT(client, tokenId, supplyKey, ipfsCID) {
  try {
    console.log("\n🔨 Minting test NFT...");

    // Convert IPFS CID to bytes
    const metadata = Buffer.from(ipfsCID);

    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([metadata])
      .setMaxTransactionFee(new Hbar(20))
      .freezeWith(client);

    const signedTx = await mintTx.sign(supplyKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    console.log(`✅ Test NFT minted successfully`);
    console.log(`   Serial Number: ${receipt.serials[0]}`);
    console.log(`   Metadata CID: ${ipfsCID}`);

    return receipt.serials[0];
  } catch (error) {
    console.error("❌ Error minting test NFT:", error);
    throw error;
  }
}

/**
 * Update .env file with token IDs
 */
function updateEnvFile(utilityTokenId, nftTokenId) {
  try {
    const envPath = path.join(__dirname, "../../.env");
    let envContent = fs.readFileSync(envPath, "utf8");

    // Update or add token IDs
    if (envContent.includes("UTILITY_TOKEN_ID=")) {
      envContent = envContent.replace(
        /UTILITY_TOKEN_ID=.*/,
        `UTILITY_TOKEN_ID=${utilityTokenId}`
      );
    } else {
      envContent += `\nUTILITY_TOKEN_ID=${utilityTokenId}`;
    }

    if (envContent.includes("NFT_TOKEN_ID=")) {
      envContent = envContent.replace(
        /NFT_TOKEN_ID=.*/,
        `NFT_TOKEN_ID=${nftTokenId}`
      );
    } else {
      envContent += `\nNFT_TOKEN_ID=${nftTokenId}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log("\n✅ Updated .env file with token IDs");
  } catch (error) {
    console.error("⚠️ Warning: Could not update .env file:", error.message);
  }
}

/**
 * Main deployment script
 */
async function deployTokens() {
  let client;
  try {
    console.log("🚀 Starting Veritas Token Deployment...\n");

    // Initialize client
    client = await initializeClient();

    // Get treasury account credentials
    const treasuryId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const treasuryKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);

    // Create utility token
    const utilityTokenId = await createUtilityToken(
      client,
      treasuryId,
      treasuryKey
    );

    // Create NFT token
    const nftTokenId = await createProductNFT(
      client,
      treasuryId,
      treasuryKey
    );

    // Mint test NFT with sample IPFS CID
    const sampleIPFSCID = "QmSampleTestMetadataHashForVeritasProduct123";
    const serialNumber = await mintTestNFT(
      client,
      nftTokenId,
      treasuryKey,
      sampleIPFSCID
    );

    // Update .env file
    updateEnvFile(utilityTokenId, nftTokenId);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`   Utility Token ID: ${utilityTokenId}`);
    console.log(`   NFT Token ID: ${nftTokenId}`);
    console.log(`   Test NFT Serial: ${serialNumber}`);
    console.log(`\n⚠️ Important: Save these token IDs securely!`);

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  } finally {
    if (client) {
      await closeClient(client);
    }
  }
}

// Run deployment if executed directly
if (require.main === module) {
  deployTokens();
}

module.exports = {
  createUtilityToken,
  createProductNFT,
  mintTestNFT
};
