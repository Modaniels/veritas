/**
 * Retrieve metadata from IPFS using Pinata gateway
 */
export async function getMetadataFromIPFS(cid) {
  try {
    console.log(`📥 Retrieving metadata from IPFS: ${cid}`);

    // Use your Pinata gateway
    const gatewayUrl = `https://jade-known-chimpanzee-227.mypinata.cloud/ipfs/${cid}`;
    console.log(`🌐 Fetching from Pinata: ${gatewayUrl}`);

    try {
      const response = await fetch(gatewayUrl);
      
      if (response.ok) {
        const metadata = await response.json();
        console.log("✅ Metadata retrieved from Pinata IPFS:", metadata);
        return metadata;
      } else {
        console.warn(`⚠️ Pinata returned ${response.status}, trying fallback...`);
      }
    } catch (ipfsError) {
      console.warn("Could not fetch from Pinata:", ipfsError);
    }

    // Fallback: Try localStorage for demo
    try {
      const mappings = JSON.parse(localStorage.getItem('veritasProducts') || '{}');
      const nfcIds = Object.keys(mappings);
      
      if (nfcIds.length > 0) {
        const sortedProducts = nfcIds
          .map(id => mappings[id])
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (sortedProducts[0] && sortedProducts[0].productDetails) {
          console.log("✅ Metadata retrieved from localStorage (fallback)");
          return sortedProducts[0].productDetails;
        }
      }
    } catch (error) {
      console.warn("Could not read from localStorage:", error);
    }

    // Final fallback
    console.warn("⚠️ Using mock metadata - IPFS data not found");
    return {
      name: "Product not found in IPFS",
      category: "Unknown",
      manufacturer: "Unknown",
      manufacturingDate: new Date().toISOString().split('T')[0],
      serialNumber: "N/A",
      description: "Metadata not found. The CID may be invalid or not yet pinned to IPFS.",
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("❌ Error retrieving from IPFS:", error);
    throw error;
  }
}
