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
 * Query NFT information by NFC Serial ID
 * Uses Hedera Mirror Node API to query real blockchain data
 */
export async function queryNFTByNFCSerial(client, tokenId, nfcSerialId) {
  try {
    console.log(`🔍 Querying NFT for NFC Serial: ${nfcSerialId}`);
    console.log(`📡 Token ID: ${tokenId}`);

    // Query Hedera Mirror Node API for ALL NFTs in this token
    const mirrorNodeUrl = `https://testnet.mirrornode.hedera.com/api/v1/tokens/${tokenId}/nfts`;
    console.log(`📡 Querying Hedera Mirror Node: ${mirrorNodeUrl}`);
    
    const response = await fetch(mirrorNodeUrl);
    
    if (!response.ok) {
      throw new Error(`Mirror Node API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ Found ${data.nfts?.length || 0} total NFTs for token ${tokenId}`);
    
    if (!data.nfts || data.nfts.length === 0) {
      throw new Error(`No NFTs found for token ${tokenId}. Please mint products first in the Manufacturer Portal.`);
    }
    
    // Find NFT matching the NFC Serial ID
    let matchedNFT = null;
    
    for (const nft of data.nfts) {
      // Decode metadata from base64
      let metadataString = "";
      let metadataObject = null;
      
      if (nft.metadata) {
        try {
          // Metadata is base64 encoded
          const decodedBytes = atob(nft.metadata);
          metadataString = decodedBytes;
          
          // Try to parse as JSON
          try {
            metadataObject = JSON.parse(decodedBytes);
            console.log(`NFT #${nft.serial_number} metadata:`, metadataObject);
            
            // Check if this NFT matches the NFC Serial ID
            // Support both formats: {nfcSerialId: "..."} and {nfc: "..."}
            const nftNfcId = metadataObject.nfcSerialId || metadataObject.nfc;
            if (nftNfcId === nfcSerialId) {
              console.log(`✅ FOUND MATCH! NFT #${nft.serial_number} matches NFC ID ${nfcSerialId}`);
              matchedNFT = nft;
              matchedNFT.decodedMetadata = metadataString;
              matchedNFT.parsedMetadata = metadataObject;
              break; // Found the match!
            }
          } catch (jsonError) {
            // Metadata might be IPFS CID instead of JSON
            console.log(`NFT #${nft.serial_number} metadata (non-JSON): ${decodedBytes}`);
          }
        } catch (e) {
          metadataString = nft.metadata;
          console.warn(`Could not decode metadata for NFT #${nft.serial_number}`);
        }
      }
    }
    
    if (!matchedNFT) {
      // No exact match found - maybe show the most recent NFT as fallback
      console.warn(`⚠️ No NFT found with NFC Serial ID: ${nfcSerialId}`);
      console.log(`Available NFTs: ${data.nfts.length}`);
      
      // Try to show what NFTs exist
      data.nfts.forEach((nft, i) => {
        console.log(`  NFT #${nft.serial_number}: ${nft.metadata ? '(has metadata)' : '(no metadata)'}`);
      });
      
      throw new Error(`NFT with NFC Serial ${nfcSerialId} not found in token ${tokenId}. ${data.nfts.length} NFT(s) exist but none match this NFC ID.`);
    }
    
    console.log("✅ Found matching NFT on Hedera blockchain:", matchedNFT);
    
    const result = {
      tokenId: tokenId,
      serialNumber: matchedNFT.serial_number.toString(),
      accountId: matchedNFT.account_id,
      metadata: matchedNFT.decodedMetadata,
      metadataObject: matchedNFT.parsedMetadata,
      createdAt: matchedNFT.created_timestamp,
      nfcSerialId: nfcSerialId,
      isReal: true, // Real blockchain data!
      fromMirrorNode: true
    };

    console.log("✅ NFT verified on blockchain:", result);
    return result;

  } catch (error) {
    console.error("❌ Error querying NFT from Mirror Node:", error);
    
    // Fallback: Try localStorage for demo purposes
    console.log("⚠️ Falling back to localStorage...");
    try {
      const individualProduct = localStorage.getItem(`veritas_${nfcSerialId}`);
      if (individualProduct) {
        const productData = JSON.parse(individualProduct);
        console.log("✅ Found product in localStorage (fallback)");
        
        return {
          tokenId: productData.tokenId || tokenId,
          serialNumber: productData.nftSerialNumber,
          accountId: "0.0.5770350",
          metadata: productData.metadata || "QmMock" + nfcSerialId.replace(/[^a-zA-Z0-9]/g, ''),
          createdAt: productData.timestamp,
          nfcSerialId: nfcSerialId,
          productDetails: productData.productDetails,
          isMock: true
        };
      }
    } catch (storageError) {
      console.warn("Could not read from localStorage:", storageError);
    }
    
    throw new Error(`NFT not found. Error: ${error.message}`);
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
