/**
 * Upload product metadata to IPFS using Pinata API
 */
export async function uploadMetadataToIPFS(productData) {
  try {
    console.log("📤 Uploading metadata to Pinata IPFS...");

    const PINATA_JWT = process.env.REACT_APP_PINATA_JWT || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5YmU2YzFiMi1iZTA4LTRmMzctYjBjZC1lYjU5ODBjYzJkMTgiLCJlbWFpbCI6Im1vZGFuaWVsczUwN0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNzBiZTM0MDFmNGY1YzUxYjE3NmIiLCJzY29wZWRLZXlTZWNyZXQiOiJlZjJiMDhlMTdjMjRhODI2ZGE4OTFkZmIxNTcwZWU2ZjgxNDI2ODRhMmY3ZDFmY2EwNjg0MDRkODE0N2Y5MjkwIiwiZXhwIjoxNzkyODg3MTc4fQ.zt12nhZnDLrt41LuuTlYUNrA2tKzQP8M2ViFIXnc4JM";

    if (!PINATA_JWT) {
      throw new Error("PINATA_JWT not configured in environment variables");
    }

    // Prepare metadata JSON in NFT standard format
    const metadata = {
      name: productData.productName || productData.name,
      description: productData.description || `Veritas authenticated product: ${productData.productName || productData.name}`,
      image: productData.image || "",
      attributes: [
        { trait_type: "NFC_Serial_ID", value: productData.nfcSerialId },
        { trait_type: "Category", value: productData.productCategory || productData.category || "General" },
        { trait_type: "Manufacturer", value: productData.manufacturer || "Veritas Corp" },
        { trait_type: "Manufacturing_Date", value: productData.manufacturingDate || new Date().toISOString().split('T')[0] },
        { trait_type: "Serial_Number", value: productData.serialNumber || `VER-${Date.now()}` },
        { trait_type: "Timestamp", value: new Date().toISOString() }
      ],
      // Additional Veritas-specific metadata
      veritas: {
        ...productData,
        timestamp: new Date().toISOString(),
        uploadedToPinata: true,
        version: "1.0"
      }
    };

    console.log("📋 Metadata prepared:", metadata);

    // Pin JSON to Pinata using JWT authentication
    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    
    const body = {
      pinataContent: metadata,
      pinataMetadata: {
        name: `Veritas-${productData.nfcSerialId || Date.now()}.json`,
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Pinata API error ${response.status}:`, errorText);
      throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const realCID = data.IpfsHash;
    
    console.log(`✅ Metadata uploaded to Pinata successfully!`);
    console.log(`📄 IPFS Hash: ${realCID}`);
    console.log(`🌐 Gateway URL: https://jade-known-chimpanzee-227.mypinata.cloud/ipfs/${realCID}`);
    
    return realCID;

  } catch (error) {
    console.error("❌ Error uploading to IPFS:", error);
    throw new Error(`Failed to upload metadata to Pinata: ${error.message}`);
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
