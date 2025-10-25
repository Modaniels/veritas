/**
 * Hedera NFT Service
 * Since Hedera SDK cannot run in browser, we'll simulate the process
 * and call the actual Node.js minting script
 */

/**
 * Initialize Hedera Client (Browser Compatible)
 */
export function initializeHederaClient(operatorId, operatorKey, network = "testnet") {
  console.log("🔧 Initializing Hedera client for browser...");
  
  return {
    operatorId,
    network,
    isReady: true,
    timestamp: new Date().toISOString()
  };
}

/**
 * Mint a new NFT for a product
 * This calls the backend API to create a real NFT on Hedera blockchain
 */
export async function mintProductNFT(client, tokenId, supplyKey, metadataCID, productData) {
  try {
    console.log("🔨 Creating REAL NFT on Hedera blockchain via API...");
    console.log(`📄 Metadata CID: ${metadataCID}`);
    console.log(`🏷️ Product: ${productData?.productName || 'Unknown'}`);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
    const mintEndpoint = `${apiUrl}/api/mint-nft`;

    console.log(`📡 Calling API: ${mintEndpoint}`);

    // First, check if API server is running
    try {
      console.log("🔍 Checking API server health...");
      const healthResponse = await fetch(`${apiUrl}/health`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log("✅ API server is running:", healthData.message);
      } else {
        throw new Error(`Health check returned ${healthResponse.status}`);
      }
    } catch (healthError) {
      console.error("❌ API server health check failed:", healthError);
      throw new Error(`API server is not running or not accessible. Please start it with: npm run api\n\nError: ${healthError.message}`);
    }

    // Call the backend API to mint the real NFT
    console.log("🔗 Calling API to mint real NFT...");
    console.log(`📡 API Endpoint: ${mintEndpoint}`);
    console.log(`📦 Payload:`, {
      nfcSerialId: productData.nfcSerialId,
      ipfsCID: metadataCID,
      productData: productData
    });

    const response = await fetch(mintEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nfcSerialId: productData.nfcSerialId,
        ipfsCID: metadataCID,
        productData: productData
      })
    });

    console.log(`📡 API Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage;
      try {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorText;
        } catch (parseError) {
          errorMessage = errorText;
        }
      } catch (e) {
        errorMessage = `HTTP ${response.status} ${response.statusText}`;
        console.error('❌ API Error:', e);
      }
      throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }

    let result;
    try {
      const responseText = await response.text();
      console.log('📄 Raw API Response:', responseText);
      result = JSON.parse(responseText);
      console.log('✅ Parsed API Response:', result);
    } catch (parseError) {
      console.error('❌ Failed to parse API response:', parseError);
      throw new Error(`Invalid JSON response from API: ${parseError.message}`);
    }

    console.log("✅ REAL NFT minted successfully!");
    console.log(`   Serial Number: ${result.serialNumber}`);
    console.log(`   Transaction ID: ${result.transactionId}`);
    console.log(`   View on HashScan: ${result.hashscanUrl}`);
    console.log(`   Metadata: ${result.ipfsUrl}`);
    console.log(`   🎉 This NFT can now be verified in veritas-scan!`);

    return {
      success: true,
      serialNumber: result.serialNumber,
      transactionId: result.transactionId,
      metadataCID: result.metadataCID,
      tokenId: result.tokenId,
      timestamp: result.timestamp,
      network: result.network,
      ipfsUrl: result.ipfsUrl,
      hashscanUrl: result.hashscanUrl,
      blockchainMetadata: result.blockchainMetadata,
      isReal: true, // This is a real NFT!
      fromAPI: true
    };

  } catch (error) {
    console.error("❌ Error minting real NFT:", error);
    
    // If API is not available, show helpful error
    if (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to API server. Please ensure the API server is running:\n\n1. Open a new terminal\n2. Run: npm run api\n3. Wait for "API Server running" message\n4. Try minting again`);
    }
    
    // If it's a connection refused error
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      throw new Error(`API server is not running. Please start it with: npm run api`);
    }
    
    // For any other error, include the original message
    throw new Error(`Failed to mint real NFT: ${error.message}`);
  }
}

/**
 * Associate NFT metadata with NFC Serial ID
 * Store in localStorage AND sessionStorage for cross-origin demo
 */
export function associateNFCSerial(nftSerialNumber, nfcSerialId, productDetails, ipfsCID) {
  const mapping = {
    nftSerialNumber,
    nfcSerialId,
    productDetails,
    ipfsCID, // Store the real IPFS CID
    tokenId: process.env.REACT_APP_NFT_TOKEN_ID,
    timestamp: new Date().toISOString(),
    status: "minted",
    gatewayUrl: `https://jade-known-chimpanzee-227.mypinata.cloud/ipfs/${ipfsCID}`
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
    console.log("🌐 IPFS Gateway URL:", mapping.gatewayUrl);
  } catch (error) {
    console.warn("Could not save to storage:", error);
  }
  
  return mapping;
}
