/**
 * IMPORTANT: Hedera SDK cannot run in browser!
 * This is a mock implementation for demo purposes.
 * In production, all Hedera operations MUST go through a backend API.
 */

/**
 * Mock Hedera Client for browser
 * In production: Create a backend API endpoint
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
 * Mint a new NFT for a product
 * MOCK IMPLEMENTATION - In production, call your backend API
 */
export async function mintProductNFT(client, tokenId, supplyKey, metadataCID) {
  try {
    console.log("🔨 Minting new product NFT (MOCK)...");
    console.warn("⚠️ This is a simulation. In production, call your backend API.");

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock serial number
    const mockSerial = Date.now().toString().slice(-6);

    const result = {
      success: true,
      serialNumber: mockSerial,
      transactionId: `0.0.${client.operatorId}@${Date.now()}.000000000`,
      metadataCID: metadataCID,
      tokenId: tokenId,
      isMock: true
    };

    console.log("✅ NFT minted successfully (MOCK):", result);
    return result;

  } catch (error) {
    console.error("❌ Error minting NFT:", error);
    throw error;
  }
}

/**
 * Associate NFT metadata with NFC Serial ID
 * Store in localStorage AND sessionStorage for cross-origin demo
 */
export function associateNFCSerial(nftSerialNumber, nfcSerialId, productDetails) {
  const mapping = {
    nftSerialNumber,
    nfcSerialId,
    productDetails,
    tokenId: process.env.REACT_APP_NFT_TOKEN_ID,
    timestamp: new Date().toISOString(),
    status: "minted"
  };

  console.log("🔗 NFT-NFC Association created:", mapping);
  
  // Store in both localStorage and sessionStorage
  try {
    const existingMappings = JSON.parse(localStorage.getItem('veritasProducts') || '{}');
    existingMappings[nfcSerialId] = mapping;
    const mappingsStr = JSON.stringify(existingMappings);
    
    localStorage.setItem('veritasProducts', mappingsStr);
    sessionStorage.setItem('veritasProducts', mappingsStr);
    
    // Also save individual product for easy access
    localStorage.setItem(`veritas_${nfcSerialId}`, JSON.stringify(mapping));
    
    console.log("💾 Saved to localStorage and sessionStorage");
    console.log("💾 Total products stored:", Object.keys(existingMappings).length);
  } catch (error) {
    console.warn("Could not save to storage:", error);
  }
  
  return mapping;
}
