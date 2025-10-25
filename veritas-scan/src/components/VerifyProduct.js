import React, { useState } from 'react';
import {
  initializeHederaClient,
  queryNFTByNFCSerial,
  getNFTProvenance,
  transferNFTOwnership
} from '../utils/hederaService';
import { getMetadataFromIPFS } from '../utils/ipfsService';
import './VerifyProduct.css';

/**
 * VerifyProduct Component
 * Simulates NFC tap to verify product and transfer ownership
 */
function VerifyProduct({ user }) {
  const [nfcSerialId, setNfcSerialId] = useState('');
  const [productData, setProductData] = useState(null);
  const [provenance, setProvenance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transferResult, setTransferResult] = useState(null);

  /**
   * Show available NFC IDs for debugging
   */
  const showAvailableNFCs = () => {
    try {
      const veritasProducts = JSON.parse(localStorage.getItem('veritasProducts') || '{}');
      const nfcIds = Object.keys(veritasProducts);
      
      if (nfcIds.length > 0) {
        console.log(`📋 Available NFC IDs in localStorage (${nfcIds.length}):`);
        nfcIds.forEach((nfcId, index) => {
          const product = veritasProducts[nfcId];
          console.log(`${index + 1}. "${nfcId}" - ${product.productDetails?.productName || 'Unknown Product'}`);
        });
        
        alert(`Available NFC IDs (${nfcIds.length}):\n\n` + 
              nfcIds.map((id, i) => `${i+1}. "${id}"`).join('\n') +
              '\n\nCheck the browser console for more details.');
      } else {
        alert('No NFC IDs found in localStorage. Please mint a product first in the Manufacturer Portal.');
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
      alert('Error reading stored data');
    }
  };

  /**
   * Retry fetching IPFS metadata
   */
  const retryIPFSFetch = async () => {
    if (!productData?.metadata?.ipfsHash) return;
    
    setLoading(true);
    try {
      console.log("🔄 Retrying IPFS fetch for:", productData.metadata.ipfsHash);
      const metadata = await getMetadataFromIPFS(productData.metadata.ipfsHash);
      
      setProductData(prev => ({
        ...prev,
        metadata: metadata
      }));
      
      console.log("✅ Successfully fetched metadata on retry:", metadata);
    } catch (error) {
      console.error("❌ Retry failed:", error);
      setError(`IPFS retry failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Simulate NFC tap - verify product
   */
  const handleVerifyProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setProductData(null);
    setProvenance(null);
    setTransferResult(null);

    try {
      if (!nfcSerialId) {
        throw new Error("Please enter an NFC Serial ID");
      }

      console.log("🔍 Verifying product with NFC Serial:", nfcSerialId);

      // Step 1: Initialize Hedera client
      const operatorId = process.env.REACT_APP_HEDERA_OPERATOR_ID;
      const operatorKey = process.env.REACT_APP_HEDERA_OPERATOR_KEY;
      const network = process.env.REACT_APP_HEDERA_NETWORK || "testnet";

      if (!operatorId || !operatorKey) {
        throw new Error("Hedera credentials not configured");
      }

      const client = initializeHederaClient(operatorId, operatorKey, network);

      // Step 2: Query NFT by NFC Serial ID
      const tokenId = process.env.REACT_APP_NFT_TOKEN_ID;
      if (!tokenId) {
        throw new Error("NFT Token ID not configured");
      }

      const nftInfo = await queryNFTByNFCSerial(client, tokenId, nfcSerialId);

      // Step 3: Check if metadata was already fetched from IPFS
      let metadata = nftInfo.parsedMetadata;
      
      if (!metadata && nftInfo.ipfsCID) {
        // If we have an IPFS CID but no parsed metadata, try to fetch it
        console.log("🔄 Fetching metadata from IPFS CID:", nftInfo.ipfsCID);
        metadata = await getMetadataFromIPFS(nftInfo.ipfsCID);
      } else if (!metadata && nftInfo.metadata) {
        // Check if the metadata contains an IPFS hash
        let metadataStr = nftInfo.metadata;
        
        // Look for IPFS hash pattern in the metadata (handle cases like "prefix:QmHash")
        const ipfsHashMatch = metadataStr.match(/Qm[1-9A-HJ-NP-Za-km-z]{44}/);
        if (ipfsHashMatch) {
          const ipfsHash = ipfsHashMatch[0];
          console.log("🔄 Found IPFS hash in metadata, fetching:", ipfsHash);
          try {
            metadata = await getMetadataFromIPFS(ipfsHash);
            console.log("✅ Successfully fetched metadata from IPFS:", metadata);
          } catch (ipfsError) {
            console.warn("Failed to fetch from IPFS:", ipfsError);
            // Create a placeholder metadata object with IPFS info
            metadata = {
              ipfsHash: ipfsHash,
              ipfsError: ipfsError.message,
              rawMetadata: metadataStr,
              name: "IPFS Fetch Failed",
              description: `Metadata is stored on IPFS (${ipfsHash}) but could not be retrieved.`
            };
          }
        }
        
        // If still no metadata, try to parse as JSON
        if (!metadata) {
          try {
            metadata = JSON.parse(metadataStr);
          } catch (e) {
            console.warn("Could not parse NFT metadata as JSON:", metadataStr);
            metadata = { rawMetadata: metadataStr };
          }
        }
      }

      // Step 4: Get provenance (transaction history)
      const history = await getNFTProvenance(nftInfo.tokenId, nftInfo.serialNumber);

      // Step 5: Combine all data
      const completeProductData = {
        ...nftInfo,
        metadata: metadata,
        isAuthentic: true,
        verifiedAt: new Date().toISOString()
      };

      console.log("🔍 Complete Product Data:", completeProductData);
      console.log("🔍 Metadata Structure:", metadata);
      console.log("🔍 Original NFT Info:", nftInfo);

      setProductData(completeProductData);
      setProvenance(history);

      console.log("✅ Product verified:", completeProductData);

    } catch (err) {
      console.error("❌ Verification failed:", err);
      setError(err.message || "Failed to verify product");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Transfer ownership to customer
   */
  const handleClaimOwnership = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!productData) {
        throw new Error("No product data available");
      }

      console.log("🔄 Claiming ownership...");

      // Initialize Hedera client
      const operatorId = process.env.REACT_APP_HEDERA_OPERATOR_ID;
      const operatorKey = process.env.REACT_APP_HEDERA_OPERATOR_KEY;
      const network = process.env.REACT_APP_HEDERA_NETWORK || "testnet";

      const client = initializeHederaClient(operatorId, operatorKey, network);

      // Get manufacturer's account (current owner)
      const manufacturerAccountId = process.env.REACT_APP_HEDERA_ACCOUNT_ID;
      const manufacturerKey = process.env.REACT_APP_HEDERA_PRIVATE_KEY;

      // Transfer NFT to customer
      const result = await transferNFTOwnership(
        client,
        productData.tokenId,
        productData.serialNumber,
        manufacturerAccountId,
        manufacturerKey,
        user.accountId
      );

      setTransferResult(result);

      // Update product data with new owner
      setProductData(prev => ({
        ...prev,
        accountId: user.accountId,
        ownershipClaimedAt: new Date().toISOString()
      }));

      console.log("✅ Ownership claimed:", result);

    } catch (err) {
      console.error("❌ Ownership claim failed:", err);
      setError(err.message || "Failed to claim ownership");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Simulate NFC tap with a test serial
   */
  const handleSimulateNFCTap = () => {
    setNfcSerialId("NFC-TEST-001");
  };

  /**
   * Create mock data for testing IPFS
   */
  const createMockIPFSData = () => {
    const mockData = {
      "NFC-04:A1:B2:C3:D4:E5:F6": {
        nfcSerialId: "NFC-04:A1:B2:C3:D4:E5:F6",
        ipfsCID: "Qmb9HW3irVkxwgh7i6ee9rEhcCvFUP1TMHsU1jKjzshsZF",
        productDetails: {
          name: "Premium Leather Wallet",
          productName: "Premium Leather Wallet",
          category: "Accessories",
          productCategory: "Accessories", 
          manufacturer: "Veritas Corp",
          manufacturingDate: "2025-10-20",
          serialNumber: "VER-LW-2025-001",
          description: "Handcrafted premium leather wallet with RFID protection and premium finish.",
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }
    };
    
    try {
      localStorage.setItem('veritasProducts', JSON.stringify(mockData));
      console.log("✅ Mock IPFS data created in localStorage");
      alert("Test data created! Now try verifying with NFC Serial: NFC-04:A1:B2:C3:D4:E5:F6");
    } catch (error) {
      console.error("❌ Failed to create mock data:", error);
    }
  };

  return (
    <div className="verify-product-container">
      <div className="verify-product-card">
        <h2>📱 Scan Product</h2>
        <p className="subtitle">Tap your phone to the NFC tag or enter the serial ID</p>

        <form onSubmit={handleVerifyProduct} className="verify-form">
          <div className="form-group">
            <label htmlFor="nfcSerialId">NFC Serial ID</label>
            <input
              type="text"
              id="nfcSerialId"
              name="nfcSerialId"
              value={nfcSerialId}
              onChange={(e) => setNfcSerialId(e.target.value)}
              placeholder="e.g., NFC-04:A1:B2:C3:D4:E5:F6"
              required
            />
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="verify-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Verifying...
                </>
              ) : (
                '🔍 Verify Product'
              )}
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <strong>❌ Error:</strong> {error}
            
            {error.includes('not found') && (
              <div style={{marginTop: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px'}}>
                <h4 style={{margin: '0 0 0.5rem 0', color: '#374151'}}>🔍 Verification Help:</h4>
                <p style={{margin: 0, color: '#6b7280'}}>
                  Please ensure the NFC Serial ID is correct and that the product has been registered with Veritas.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Product Verification Result */}
        {productData && (
          <div className="product-details">
            <div className="authenticity-badge">
              ✅ AUTHENTIC PRODUCT
            </div>

            {/* Show IPFS status if metadata was retrieved from IPFS */}
            {productData.metadata?.retrievedFromIPFS && (
              <div className="ipfs-success-badge">
                🔐 BLOCKCHAIN VERIFIED
              </div>
            )}

            <h3>📦 Product Information</h3>
            <div className="info-grid">
              {productData.metadata?.name && (
                <div className="info-item">
                  <strong>Product Name:</strong>
                  <span>{productData.metadata.name}</span>
                </div>
              )}
              {productData.metadata?.productName && (
                <div className="info-item">
                  <strong>Product Name:</strong>
                  <span>{productData.metadata.productName}</span>
                </div>
              )}
              {productData.metadata?.category && (
                <div className="info-item">
                  <strong>Category:</strong>
                  <span>{productData.metadata.category}</span>
                </div>
              )}
              {productData.metadata?.productCategory && (
                <div className="info-item">
                  <strong>Category:</strong>
                  <span>{productData.metadata.productCategory}</span>
                </div>
              )}
              {productData.metadata?.manufacturer && (
                <div className="info-item">
                  <strong>Manufacturer:</strong>
                  <span>{productData.metadata.manufacturer}</span>
                </div>
              )}
              {productData.metadata?.manufacturingDate && (
                <div className="info-item">
                  <strong>Manufacturing Date:</strong>
                  <span>{productData.metadata.manufacturingDate}</span>
                </div>
              )}
              {productData.metadata?.serialNumber && (
                <div className="info-item">
                  <strong>Serial Number:</strong>
                  <span>{productData.metadata.serialNumber}</span>
                </div>
              )}
              {productData.metadata?.description && (
                <div className="info-item">
                  <strong>Description:</strong>
                  <span style={{whiteSpace: 'pre-line'}}>{productData.metadata.description}</span>
                </div>
              )}
              
              {/* Show troubleshooting info if available */}
              {productData.metadata?.troubleshooting && (
                <div className="info-item" style={{gridColumn: '1 / -1'}}>
                  <strong>🔧 Troubleshooting Steps:</strong>
                  <ul style={{marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#6b7280'}}>
                    {productData.metadata.troubleshooting.map((step, index) => (
                      <li key={index} style={{marginBottom: '0.25rem'}}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Show message if no metadata is available */}
              {!productData.metadata && (
                <div className="info-item">
                  <strong>⚠️ No Product Metadata Available</strong>
                  <span>The NFT was found but no product information is stored on IPFS</span>
                </div>
              )}
              
              {/* Show IPFS hash info if detected */}
              {productData.metadata?.ipfsHash && (
                <div className="info-item">
                  <strong>📄 IPFS Hash:</strong>
                  <code>{productData.metadata.ipfsHash}</code>
                  <div style={{marginTop: '0.5rem'}}>
                    <small style={{display: 'block', color: '#6b7280'}}>
                      Try accessing directly: 
                    </small>
                    <a 
                      href={`https://ipfs.io/ipfs/${productData.metadata.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{fontSize: '0.8rem', color: '#3b82f6'}}
                    >
                      https://ipfs.io/ipfs/{productData.metadata.ipfsHash}
                    </a>
                  </div>
                </div>
              )}
              
              {/* Show IPFS error if fetch failed */}
              {productData.metadata?.ipfsError && (
                <div className="info-item">
                  <strong>⚠️ IPFS Fetch Error:</strong>
                  <span style={{color: '#dc2626'}}>{productData.metadata.ipfsError}</span>
                  <small style={{display: 'block', marginTop: '0.5rem', color: '#6b7280'}}>
                    The metadata is stored on IPFS but couldn't be retrieved. 
                    <button 
                      onClick={retryIPFSFetch}
                      disabled={loading}
                      style={{
                        marginLeft: '0.5rem',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {loading ? 'Retrying...' : 'Retry'}
                    </button>
                  </small>
                </div>
              )}
              
              {/* Show IPFS hash info if detected but not fetchable (legacy) */}
              {productData.metadata?.rawMetadata && 
               productData.metadata.rawMetadata.includes('Qm') && 
               !productData.metadata?.ipfsHash && (
                <div className="info-item">
                  <strong>📄 IPFS Hash Detected:</strong>
                  <code>{productData.metadata.rawMetadata.match(/Qm[1-9A-HJ-NP-Za-km-z]{44}/)?.[0]}</code>
                  <small style={{display: 'block', marginTop: '0.5rem', color: '#6b7280'}}>
                    Product metadata is stored on IPFS but couldn't be retrieved. This might be due to IPFS network issues.
                  </small>
                </div>
              )}
              
              {/* Debug: Show raw metadata structure if no standard fields found */}
              {productData.metadata && 
               !productData.metadata?.name && 
               !productData.metadata?.productName && 
               !productData.metadata?.rawMetadata?.includes('Qm') && (
                <div className="info-item">
                  <strong>Raw Metadata (Debug):</strong>
                  <code style={{fontSize: '0.75rem', maxHeight: '200px', overflow: 'auto', display: 'block'}}>
                    {JSON.stringify(productData.metadata, null, 2)}
                  </code>
                </div>
              )}
            </div>

            <h3>🔗 Blockchain Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>NFT Token ID:</strong>
                <code>{productData.tokenId}</code>
              </div>
              <div className="info-item">
                <strong>NFT Serial Number:</strong>
                <code>{productData.serialNumber}</code>
              </div>
              <div className="info-item">
                <strong>Current Owner:</strong>
                <code>{productData.accountId}</code>
              </div>
              <div className="info-item">
                <strong>NFC Serial ID:</strong>
                <code>{productData.nfcSerialId}</code>
              </div>
            </div>

            {/* Provenance/History */}
            {provenance && provenance.length > 0 && (
              <>
                <h3>📜 Ownership History (Provenance)</h3>
                <div className="provenance-timeline">
                  {provenance.map((event, index) => (
                    <div key={index} className="timeline-event">
                      <div className="event-badge">{event.type}</div>
                      <div className="event-details">
                        <div className="event-time">
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                        <div className="event-transaction">
                          {event.type === 'MINT' ? (
                            <span>Minted to <code>{event.to}</code></span>
                          ) : (
                            <span>
                              Transferred from <code>{event.from}</code> to <code>{event.to}</code>
                            </span>
                          )}
                        </div>
                        <div className="event-tx-id">
                          <small>Tx: {event.transactionId}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Claim Ownership Button */}
            {!transferResult && productData.accountId !== user.accountId && (
              <button
                onClick={handleClaimOwnership}
                className="claim-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  '🎁 Claim Ownership'
                )}
              </button>
            )}

            {/* Transfer Success */}
            {transferResult && (
              <div className="success-message">
                <h3>🎉 Ownership Claimed Successfully!</h3>
                <div className="transfer-details">
                  <div className="info-item">
                    <strong>New Owner:</strong>
                    <code>{transferResult.newOwner}</code>
                  </div>
                  <div className="info-item">
                    <strong>Transaction ID:</strong>
                    <code>{transferResult.transactionId}</code>
                  </div>
                  <div className="info-item">
                    <strong>Status:</strong>
                    <span className="success-badge">{transferResult.status}</span>
                  </div>
                  <div className="info-item">
                    <strong>Timestamp:</strong>
                    <span>{new Date(transferResult.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <p className="success-note">
                  🎊 Congratulations! You are now the verified owner of this product.
                </p>
              </div>
            )}

            {productData.accountId === user.accountId && !transferResult && (
              <div className="owner-badge">
                ✨ You already own this product
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyProduct;
