const {
  Client,
  PrivateKey,
  AccountId,
  TokenNftInfoQuery,
  TransferTransaction,
  TokenId,
  NftId,
  Hbar
} = require("@hashgraph/sdk");

/**
 * Initialize Hedera Client (Browser-compatible version)
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
 * Query NFT information by NFC Serial ID
 * In production, this would query a database to map NFC Serial to NFT Serial
 */
export async function queryNFTByNFCSerial(client, tokenId, nfcSerialId) {
  try {
    console.log(`🔍 Querying NFT for NFC Serial: ${nfcSerialId}`);

    // In a real implementation, query your database to get the NFT serial number
    // For demo purposes, we'll simulate this
    const mockMapping = {
      "NFC-04:A1:B2:C3:D4:E5:F6": "1",
      "NFC-TEST-001": "1"
    };

    const nftSerialNumber = mockMapping[nfcSerialId] || "1";

    // Query the NFT info from Hedera
    const nftInfo = await new TokenNftInfoQuery()
      .setNftId(new NftId(TokenId.fromString(tokenId), nftSerialNumber))
      .execute(client);

    const result = {
      tokenId: tokenId,
      serialNumber: nftSerialNumber,
      accountId: nftInfo.accountId.toString(),
      metadata: Buffer.from(nftInfo.metadata).toString(),
      createdAt: nftInfo.creationTime,
      nfcSerialId: nfcSerialId
    };

    console.log("✅ NFT found:", result);
    return result;

  } catch (error) {
    console.error("❌ Error querying NFT:", error);
    throw new Error("NFT not found for this NFC Serial ID");
  }
}

/**
 * Get NFT provenance (transaction history)
 * This provides the verifiable history of ownership transfers
 */
export async function getNFTProvenance(tokenId, serialNumber) {
  try {
    console.log(`📜 Fetching provenance for NFT ${tokenId}/${serialNumber}`);

    // In production, query Hedera Mirror Node API for transaction history
    // For demo, return mock data
    const mockProvenance = [
      {
        type: "MINT",
        timestamp: "2025-10-01T10:00:00Z",
        from: null,
        to: "0.0.123456",
        transactionId: "0.0.123456@1696156800.000000000"
      },
      {
        type: "TRANSFER",
        timestamp: "2025-10-15T14:30:00Z",
        from: "0.0.123456",
        to: "0.0.789012",
        transactionId: "0.0.123456@1697378200.000000000"
      }
    ];

    console.log("✅ Provenance retrieved");
    return mockProvenance;

  } catch (error) {
    console.error("❌ Error fetching provenance:", error);
    return [];
  }
}

/**
 * Transfer NFT ownership from manufacturer to customer
 * @param {Client} client - Hedera client
 * @param {string} tokenId - NFT Token ID
 * @param {string} serialNumber - NFT Serial Number
 * @param {string} fromAccountId - Current owner (manufacturer)
 * @param {string} fromPrivateKey - Current owner's private key
 * @param {string} toAccountId - New owner (customer)
 * @returns {Promise<Object>} Transfer result
 */
export async function transferNFTOwnership(
  client,
  tokenId,
  serialNumber,
  fromAccountId,
  fromPrivateKey,
  toAccountId
) {
  try {
    console.log(`🔄 Transferring NFT ownership...`);
    console.log(`   From: ${fromAccountId}`);
    console.log(`   To: ${toAccountId}`);

    const nftId = new NftId(
      TokenId.fromString(tokenId),
      parseInt(serialNumber)
    );

    // Create transfer transaction
    const transferTx = await new TransferTransaction()
      .addNftTransfer(nftId, AccountId.fromString(fromAccountId), AccountId.fromString(toAccountId))
      .setTransactionMemo(`Veritas ownership transfer - NFC verified`)
      .freezeWith(client);

    // Sign with current owner's key
    const signedTx = await transferTx.sign(PrivateKey.fromString(fromPrivateKey));
    
    // Execute transaction
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    const result = {
      success: true,
      transactionId: txResponse.transactionId.toString(),
      status: receipt.status.toString(),
      newOwner: toAccountId,
      timestamp: new Date().toISOString()
    };

    console.log("✅ NFT transferred successfully:", result);
    return result;

  } catch (error) {
    console.error("❌ Error transferring NFT:", error);
    throw error;
  }
}
