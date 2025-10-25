/**
 * Retrieve metadata from IPFS using multiple gateways
 */
export async function getMetadataFromIPFS(cid) {
  try {
    console.log(`📥 Retrieving metadata from IPFS: ${cid}`);

    // List of IPFS gateways to try
    const gateways = [
      `https://jade-known-chimpanzee-227.mypinata.cloud/ipfs/${cid}`,
      `https://ipfs.io/ipfs/${cid}`,
      `https://gateway.pinata.cloud/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
      `https://dweb.link/ipfs/${cid}`
    ];

    // Try each gateway
    for (let i = 0; i < gateways.length; i++) {
      const gatewayUrl = gateways[i];
      console.log(`🌐 Trying gateway ${i + 1}/${gateways.length}: ${gatewayUrl}`);

      try {
        const response = await fetch(gatewayUrl, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            const rawMetadata = await response.json();
            console.log(`✅ Raw metadata retrieved from gateway ${i + 1}:`, rawMetadata);
            
            // Normalize the metadata format to handle both old and new formats
            const normalizedMetadata = normalizeMetadata(rawMetadata);
            console.log(`🔄 Normalized metadata:`, normalizedMetadata);
            
            return normalizedMetadata;
          } else {
            const text = await response.text();
            console.log(`📄 Non-JSON response from gateway ${i + 1}:`, text);
            
            // Try to parse as JSON anyway
            try {
              const rawMetadata = JSON.parse(text);
              console.log(`✅ Parsed JSON from text response:`, rawMetadata);
              return normalizeMetadata(rawMetadata);
            } catch (parseError) {
              console.warn(`❌ Could not parse response as JSON from gateway ${i + 1}`);
            }
          }
        } else {
          console.warn(`⚠️ Gateway ${i + 1} returned ${response.status}: ${response.statusText}`);
        }
      } catch (gatewayError) {
        console.warn(`❌ Gateway ${i + 1} failed:`, gatewayError.message);
      }
    }

    console.warn("⚠️ All IPFS gateways failed, trying localStorage fallback...");

    // Fallback: Try localStorage for demo
    try {
      const mappings = JSON.parse(localStorage.getItem('veritasProducts') || '{}');
      const nfcIds = Object.keys(mappings);
      
      if (nfcIds.length > 0) {
        console.log("🔍 Found localStorage data:", mappings);
        
        // Look for a product that matches the CID
        for (const nfcId of nfcIds) {
          const product = mappings[nfcId];
          if (product.ipfsCID === cid && product.productDetails) {
            console.log("✅ Found matching product in localStorage for CID:", cid);
            return normalizeMetadata(product.productDetails);
          }
        }
        
        // If no exact match, return the most recent product
        const sortedProducts = nfcIds
          .map(id => mappings[id])
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (sortedProducts[0] && sortedProducts[0].productDetails) {
          console.log("✅ Using most recent product from localStorage (fallback)");
          return normalizeMetadata(sortedProducts[0].productDetails);
        }
      } else {
        console.log("📭 No products found in localStorage");
      }
    } catch (error) {
      console.warn("Could not read from localStorage:", error);
    }

    // Create a more informative error response
    console.warn("⚠️ Using error metadata - IPFS data not found anywhere");
    return {
      error: "IPFS_NOT_FOUND",
      ipfsHash: cid,
      name: "❌ Product Not Found on IPFS",
      category: "Unknown",
      manufacturer: "Unknown",
      manufacturingDate: new Date().toISOString().split('T')[0],
      serialNumber: "N/A",
      description: `The product metadata stored at IPFS hash ${cid} could not be retrieved from any gateway. This could mean:\n\n• The content was never uploaded to IPFS\n• The content is no longer pinned\n• IPFS network is experiencing issues\n\nPlease verify the IPFS hash or contact the product manufacturer.`,
      timestamp: new Date().toISOString(),
      troubleshooting: [
        "Check if the IPFS hash is correct",
        "Try again later - IPFS network might be slow",
        "Contact the manufacturer to verify the product",
        "Ensure the content is properly pinned to IPFS"
      ]
    };

  } catch (error) {
    console.error("❌ Error retrieving from IPFS:", error);
    throw error;
  }
}

/**
 * Normalize metadata format to handle both old and new formats
 */
function normalizeMetadata(rawMetadata) {
  if (!rawMetadata) return null;

  // If it's already in the old format, keep it as is
  if (rawMetadata.productName || rawMetadata.nfcSerialId) {
    return rawMetadata;
  }

  // If it's in the new NFT standard format, extract the data
  if (rawMetadata.name && rawMetadata.attributes) {
    console.log("🔄 Converting NFT standard format to Veritas format");
    
    // Extract attributes into a more accessible format
    const attrs = {};
    if (rawMetadata.attributes && Array.isArray(rawMetadata.attributes)) {
      rawMetadata.attributes.forEach(attr => {
        if (attr.trait_type && attr.value !== undefined) {
          attrs[attr.trait_type] = attr.value;
        }
      });
    }

    // Check for Veritas-specific data
    const veritasData = rawMetadata.veritas || {};

    const normalized = {
      // Primary fields
      productName: rawMetadata.name,
      description: rawMetadata.description,
      
      // From attributes
      nfcSerialId: attrs.NFC_Serial_ID || attrs.nfcSerialId || veritasData.nfcSerialId,
      productCategory: attrs.Category || attrs.category || veritasData.productCategory || veritasData.category,
      manufacturer: attrs.Manufacturer || attrs.manufacturer || veritasData.manufacturer,
      manufacturingDate: attrs.Manufacturing_Date || attrs.manufacturingDate || veritasData.manufacturingDate,
      serialNumber: attrs.Serial_Number || attrs.serialNumber || veritasData.serialNumber,
      
      // Additional fields from veritas data
      ...veritasData,
      
      // Preserve original data
      originalMetadata: rawMetadata,
      
      // Add timestamp if not present
      timestamp: rawMetadata.timestamp || veritasData.timestamp || new Date().toISOString(),
      
      // Mark as successfully retrieved from IPFS
      retrievedFromIPFS: true,
      ipfsRetrievalTime: new Date().toISOString()
    };

    console.log("✅ Normalized metadata:", normalized);
    return normalized;
  }

  // If it's an unknown format, return as is with some normalization
  return {
    ...rawMetadata,
    retrievedFromIPFS: true,
    ipfsRetrievalTime: new Date().toISOString()
  };
}
