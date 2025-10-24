const {
  Client,
  PrivateKey,
  AccountId,
  TokenMintTransaction,
  Hbar
} = require("@hashgraph/sdk");

/**
 * Initialize Hedera Client (Browser-compatible version)
 * Note: In production, use a backend API to handle private keys securely
 */
export function initializeHederaClient(operatorId, operatorKey, network = "testnet") {
  try {
    let client;
    if (network === "mainnet") {
      client = Client.forMainnet();
    } else {
      client = Client.forTestnet();
    }

    client.setOperator(
      AccountId.fromString(operatorId),
      PrivateKey.fromString(operatorKey)
    );

    client.setDefaultMaxTransactionFee(new Hbar(100));
    client.setDefaultMaxQueryPayment(new Hbar(50));

    return client;
  } catch (error) {
    console.error("Error initializing Hedera client:", error);
    throw error;
  }
}

/**
 * Mint a new NFT for a product
 * @param {Client} client - Hedera client instance
 * @param {string} tokenId - NFT Token ID
 * @param {string} supplyKey - Private key with supply authority
 * @param {string} metadataCID - IPFS CID for product metadata
 * @returns {Promise<Object>} Minting result with serial number and transaction ID
 */
export async function mintProductNFT(client, tokenId, supplyKey, metadataCID) {
  try {
    console.log("🔨 Minting new product NFT...");

    // Convert IPFS CID to bytes for metadata
    const metadata = Buffer.from(metadataCID);

    // Create and execute mint transaction
    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([metadata])
      .setMaxTransactionFee(new Hbar(20))
      .freezeWith(client);

    const signedTx = await mintTx.sign(PrivateKey.fromString(supplyKey));
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    const result = {
      success: true,
      serialNumber: receipt.serials[0].toString(),
      transactionId: txResponse.transactionId.toString(),
      metadataCID: metadataCID,
      tokenId: tokenId
    };

    console.log("✅ NFT minted successfully:", result);
    return result;

  } catch (error) {
    console.error("❌ Error minting NFT:", error);
    throw error;
  }
}

/**
 * Associate NFT metadata with NFC Serial ID
 * In a real implementation, this would store the mapping in a database
 */
export function associateNFCSerial(nftSerialNumber, nfcSerialId, productDetails) {
  const mapping = {
    nftSerialNumber,
    nfcSerialId,
    productDetails,
    timestamp: new Date().toISOString(),
    status: "minted"
  };

  console.log("🔗 NFT-NFC Association created:", mapping);
  
  // TODO: Store in database (e.g., MongoDB, PostgreSQL)
  // For now, we'll just log it
  
  return mapping;
}
