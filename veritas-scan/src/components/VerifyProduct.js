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

      // Step 3: Retrieve metadata from IPFS
      const metadata = await getMetadataFromIPFS(nftInfo.metadata);

      // Step 4: Get provenance (transaction history)
      const history = await getNFTProvenance(nftInfo.tokenId, nftInfo.serialNumber);

      // Step 5: Combine all data
      const completeProductData = {
        ...nftInfo,
        metadata: metadata,
        isAuthentic: true,
        verifiedAt: new Date().toISOString()
      };

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

            <button
              type="button"
              onClick={handleSimulateNFCTap}
              className="simulate-button"
              disabled={loading}
            >
              📲 Simulate NFC Tap
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {/* Product Verification Result */}
        {productData && (
          <div className="product-details">
            <div className="authenticity-badge">
              ✅ AUTHENTIC PRODUCT
            </div>

            <h3>📦 Product Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>Product Name:</strong>
                <span>{productData.metadata.name}</span>
              </div>
              <div className="info-item">
                <strong>Category:</strong>
                <span>{productData.metadata.category}</span>
              </div>
              <div className="info-item">
                <strong>Manufacturer:</strong>
                <span>{productData.metadata.manufacturer}</span>
              </div>
              <div className="info-item">
                <strong>Manufacturing Date:</strong>
                <span>{productData.metadata.manufacturingDate}</span>
              </div>
              <div className="info-item">
                <strong>Serial Number:</strong>
                <span>{productData.metadata.serialNumber}</span>
              </div>
              <div className="info-item">
                <strong>Description:</strong>
                <span>{productData.metadata.description}</span>
              </div>
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
