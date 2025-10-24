/**
 * IMPORTANT: Hedera SDK cannot run in browser!
 * This is a mock implementation for demo purposes.
 * In production, all Hedera operations MUST go through a backend API.
 */

/**
 * Initialize Hedera Client (Mock for browser)
 */
export function initializeHederaClient(operatorId, operatorKey, network = "testnet") {
  console.warn("⚠️ Using mock Hedera client - SDK cannot run in browser!");
  console.warn("⚠️ In production, use a backend API for all Hedera operations");
  
  return {
    operatorId,
    network,
    isMock: true
  };
}

/**
 * Query NFT information by NFC Serial ID (MOCK)
 * In production, query your database to map NFC Serial to NFT Serial
 */
export async function queryNFTByNFCSerial(client, tokenId, nfcSerialId) {
  try {
    console.log(`🔍 Querying NFT for NFC Serial: ${nfcSerialId} (MOCK)`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock NFT data
    const result = {
      tokenId: tokenId,
      serialNumber: "348452", // Mock serial from earlier mint
      accountId: "0.0.5770350", // Your manufacturer account
      metadata: "QmMock" + nfcSerialId.replace(/[^a-zA-Z0-9]/g, ''),
      createdAt: new Date().toISOString(),
      nfcSerialId: nfcSerialId,
      isMock: true
    };

    console.log("✅ NFT found (MOCK):", result);
    return result;

  } catch (error) {
    console.error("❌ Error querying NFT:", error);
    throw new Error("NFT not found for this NFC Serial ID");
  }
}

/**
 * Get NFT provenance (transaction history) - MOCK
 */
export async function getNFTProvenance(tokenId, serialNumber) {
  try {
    console.log(`📜 Fetching provenance for NFT ${tokenId}/${serialNumber} (MOCK)`);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockProvenance = [
      {
        type: "MINT",
        timestamp: "2025-10-25T10:00:00Z",
        from: null,
        to: "0.0.5770350",
        transactionId: "0.0.5770350@1761348452.000000000"
      },
      {
        type: "TRANSFER",
        timestamp: "2025-10-25T14:30:00Z",
        from: "0.0.5770350",
        to: "0.0.789012",
        transactionId: "0.0.5770350@1761364200.000000000"
      }
    ];

    console.log("✅ Provenance retrieved (MOCK)");
    return mockProvenance;

  } catch (error) {
    console.error("❌ Error fetching provenance:", error);
    return [];
  }
}

/**
 * Transfer NFT ownership - MOCK
 * In production: Call backend API to execute transfer
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
    console.log(`🔄 Transferring NFT ownership (MOCK)...`);
    console.log(`   From: ${fromAccountId}`);
    console.log(`   To: ${toAccountId}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = {
      success: true,
      transactionId: `0.0.${fromAccountId}@${Date.now()}.000000000`,
      status: "SUCCESS",
      newOwner: toAccountId,
      timestamp: new Date().toISOString(),
      isMock: true
    };

    console.log("✅ NFT transferred successfully (MOCK):", result);
    return result;

  } catch (error) {
    console.error("❌ Error transferring NFT:", error);
    throw error;
  }
}
