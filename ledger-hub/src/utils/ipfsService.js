/**
 * Upload product metadata to IPFS using Pinata API
 */
export async function uploadMetadataToIPFS(productData) {
  try {
    console.log("📤 Uploading metadata to Pinata IPFS...");

    const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY || "7ca24e5db34c1a42bdf4";
    const PINATA_API_SECRET = process.env.REACT_APP_PINATA_API_SECRET;

    // Prepare metadata JSON
    const metadata = {
      ...productData,
      timestamp: new Date().toISOString(),
      uploadedToPinata: true
    };

    try {
      // Pin JSON to Pinata
      const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
      
      const body = {
        pinataContent: metadata,
        pinataMetadata: {
          name: `veritas-product-${productData.nfcSerialId || Date.now()}.json`,
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          ...(PINATA_API_SECRET && { 'pinata_secret_api_key': PINATA_API_SECRET })
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        const realCID = data.IpfsHash;
        console.log(`✅ Metadata uploaded to Pinata: ${realCID}`);
        console.log(`🌐 Gateway URL: https://jade-known-chimpanzee-227.mypinata.cloud/ipfs/${realCID}`);
        return realCID;
      } else {
        const errorText = await response.text();
        console.warn(`⚠️ Pinata API returned ${response.status}: ${errorText}`);
        throw new Error(`Pinata upload failed: ${response.status}`);
      }
    } catch (pinataError) {
      console.warn("Could not upload to Pinata, using fallback:", pinataError);
      
      // Fallback to mock CID
      const mockCID = `QmMock${Date.now()}${Math.random().toString(36).substring(7)}`;
      console.log(`⚠️ Using mock CID (Pinata unavailable): ${mockCID}`);
      return mockCID;
    }

  } catch (error) {
    console.error("❌ Error uploading to IPFS:", error);
    throw error;
  }
}

/**
 * Retrieve metadata from IPFS using Pinata gateway
 */
export async function getMetadataFromIPFS(cid) {
  try {
    console.log(`📥 Retrieving metadata from IPFS: ${cid}`);

    // Use your Pinata gateway
    const gatewayUrl = `https://jade-known-chimpanzee-227.mypinata.cloud/ipfs/${cid}`;
    console.log(`🌐 Fetching from: ${gatewayUrl}`);

    try {
      const response = await fetch(gatewayUrl);
      
      if (response.ok) {
        const metadata = await response.json();
        console.log("✅ Metadata retrieved from Pinata");
        return metadata;
      }
    } catch (fetchError) {
      console.warn("Could not fetch from Pinata:", fetchError);
    }

    // Fallback mock data
    console.warn("⚠️ Using mock metadata");
    return {
      name: "Product Metadata",
      category: "General",
      manufacturer: "Veritas Corp",
      manufacturingDate: new Date().toISOString().split('T')[0],
      serialNumber: cid,
      description: "Mock metadata - IPFS retrieval failed",
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("❌ Error retrieving from IPFS:", error);
    throw error;
  }
}
