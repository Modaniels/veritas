import React, { useState } from 'react';
import { mintProductNFT, initializeHederaClient, associateNFCSerial } from '../utils/hederaService';
import { uploadMetadataToIPFS } from '../utils/ipfsService';
import './MintProduct.css';

/**
 * MintProduct Component
 * Allows manufacturers to mint new NFTs for physical products
 */
function MintProduct() {
  const [formData, setFormData] = useState({
    productName: '',
    productCategory: '',
    manufacturer: '',
    manufacturingDate: '',
    serialNumber: '',
    description: '',
    nfcSerialId: ''
  });

  const [mintResult, setMintResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Main minting function
   * 1. Validates input
   * 2. Uploads metadata to IPFS
   * 3. Mints NFT on Hedera
   * 4. Associates with NFC serial ID
   */
  const handleMintProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMintResult(null);

    try {
      // Validate required fields
      if (!formData.productName || !formData.nfcSerialId) {
        throw new Error("Product name and NFC Serial ID are required");
      }

      console.log("🚀 Starting product minting process...");

      // Step 1: Prepare metadata
      const productMetadata = {
        name: formData.productName,
        category: formData.productCategory,
        manufacturer: formData.manufacturer,
        manufacturingDate: formData.manufacturingDate,
        serialNumber: formData.serialNumber,
        description: formData.description,
        nfcSerialId: formData.nfcSerialId,
        timestamp: new Date().toISOString(),
        version: "1.0"
      };

      // Step 2: Upload metadata to IPFS
      const metadataCID = await uploadMetadataToIPFS(productMetadata);

      // Step 3: Initialize Hedera client
      // ⚠️ WARNING: In production, NEVER expose private keys in frontend!
      // Use a backend API to handle this securely
      const operatorId = process.env.REACT_APP_HEDERA_OPERATOR_ID;
      const operatorKey = process.env.REACT_APP_HEDERA_OPERATOR_KEY;
      const network = process.env.REACT_APP_HEDERA_NETWORK || "testnet";

      if (!operatorId || !operatorKey) {
        throw new Error("Hedera credentials not configured. Please set up environment variables.");
      }

      const client = initializeHederaClient(operatorId, operatorKey, network);

      // Step 4: Mint NFT on Hedera
      const tokenId = process.env.REACT_APP_NFT_TOKEN_ID;
      const supplyKey = process.env.REACT_APP_HEDERA_PRIVATE_KEY;

      if (!tokenId) {
        throw new Error("NFT Token ID not configured. Please run the deployment script first.");
      }

      const mintingResult = await mintProductNFT(
        client,
        tokenId,
        supplyKey,
        metadataCID
      );

      // Step 5: Associate NFT with NFC Serial ID
      const association = associateNFCSerial(
        mintingResult.serialNumber,
        formData.nfcSerialId,
        productMetadata
      );

      // Step 6: Display success result
      const result = {
        ...mintingResult,
        association,
        ipfsUrl: `https://ipfs.io/ipfs/${metadataCID}`
      };

      setMintResult(result);
      console.log("✅ Product minted successfully:", result);

      // Reset form
      setFormData({
        productName: '',
        productCategory: '',
        manufacturer: '',
        manufacturingDate: '',
        serialNumber: '',
        description: '',
        nfcSerialId: ''
      });

    } catch (err) {
      console.error("❌ Minting failed:", err);
      setError(err.message || "Failed to mint product NFT");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mint-product-container">
      <div className="mint-product-card">
        <h2>🔨 Mint New Product NFT</h2>
        <p className="subtitle">Create a unique NFT for a physical product and link it to an NFC tag</p>

        <form onSubmit={handleMintProduct} className="mint-form">
          <div className="form-group">
            <label htmlFor="productName">Product Name *</label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="e.g., Premium Leather Wallet"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="productCategory">Category</label>
            <input
              type="text"
              id="productCategory"
              name="productCategory"
              value={formData.productCategory}
              onChange={handleInputChange}
              placeholder="e.g., Accessories, Electronics, Fashion"
            />
          </div>

          <div className="form-group">
            <label htmlFor="manufacturer">Manufacturer</label>
            <input
              type="text"
              id="manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleInputChange}
              placeholder="e.g., Veritas Corp"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="manufacturingDate">Manufacturing Date</label>
              <input
                type="date"
                id="manufacturingDate"
                name="manufacturingDate"
                value={formData.manufacturingDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="serialNumber">Serial Number</label>
              <input
                type="text"
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                placeholder="e.g., SN-2025-001234"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nfcSerialId">NFC Serial ID *</label>
            <input
              type="text"
              id="nfcSerialId"
              name="nfcSerialId"
              value={formData.nfcSerialId}
              onChange={handleInputChange}
              placeholder="e.g., NFC-04:A1:B2:C3:D4:E5:F6"
              required
            />
            <small>The unique identifier from the embedded NFC tag</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Additional product details, specifications, or notes..."
              rows="4"
            />
          </div>

          <button 
            type="submit" 
            className="mint-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Minting...
              </>
            ) : (
              '🔨 Mint Product NFT'
            )}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {/* Success Result Display */}
        {mintResult && (
          <div className="success-message">
            <h3>✅ Product NFT Minted Successfully!</h3>
            <div className="result-details">
              <div className="result-item">
                <strong>NFT Serial Number:</strong>
                <code>{mintResult.serialNumber}</code>
              </div>
              <div className="result-item">
                <strong>Token ID:</strong>
                <code>{mintResult.tokenId}</code>
              </div>
              <div className="result-item">
                <strong>Transaction ID:</strong>
                <code>{mintResult.transactionId}</code>
              </div>
              <div className="result-item">
                <strong>NFC Serial ID:</strong>
                <code>{mintResult.association.nfcSerialId}</code>
              </div>
              <div className="result-item">
                <strong>Metadata CID:</strong>
                <code>{mintResult.metadataCID}</code>
              </div>
              <div className="result-item">
                <strong>IPFS URL:</strong>
                <a href={mintResult.ipfsUrl} target="_blank" rel="noopener noreferrer">
                  {mintResult.ipfsUrl}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MintProduct;
