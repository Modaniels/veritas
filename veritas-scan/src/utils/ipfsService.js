/**
 * Retrieve metadata from IPFS
 * Using mock data for development
 */
export async function getMetadataFromIPFS(cid) {
  try {
    console.log(`📥 Retrieving metadata from IPFS: ${cid}`);

    // Mock data for development
    const metadata = {
      name: "Premium Leather Wallet",
      category: "Accessories",
      manufacturer: "Veritas Corp",
      manufacturingDate: "2025-10-25",
      serialNumber: "SN-2025-001234",
      description: "Handcrafted genuine leather wallet with RFID protection",
      nfcSerialId: cid,
      timestamp: new Date().toISOString()
    };
    
    console.log("✅ Metadata retrieved (mock)");
    return metadata;

  } catch (error) {
    console.error("❌ Error retrieving from IPFS:", error);
    throw error;
  }
}
