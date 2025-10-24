# Veritas Ledger Hub - Manufacturer Portal

The Manufacturer Portal is a React application that enables manufacturers to mint NFTs for physical products and link them to NFC tags.

## 🎯 Features

- **Product NFT Minting**: Create unique NFTs for each product
- **IPFS Integration**: Store product metadata on IPFS
- **NFC Linking**: Associate NFTs with physical NFC tags
- **Real-time Feedback**: See minting status and results
- **Hedera Integration**: Direct connection to Hedera network

## 🚀 Quick Start

### Prerequisites

- Completed Hedera Setup (tokens deployed)
- Updated `.env` file with token IDs

### Installation

```bash
npm install
```

### Configuration

Create a `.env.local` file in the `ledger-hub` directory:

```env
# Copy from root .env
REACT_APP_HEDERA_NETWORK=testnet
REACT_APP_HEDERA_OPERATOR_ID=0.0.YOUR_OPERATOR_ID
REACT_APP_HEDERA_OPERATOR_KEY=YOUR_OPERATOR_KEY
REACT_APP_HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
REACT_APP_HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY

# From hedera-setup deployment
REACT_APP_NFT_TOKEN_ID=0.0.YOUR_NFT_TOKEN_ID

# IPFS (Optional)
REACT_APP_IPFS_PROJECT_ID=YOUR_INFURA_PROJECT_ID
REACT_APP_IPFS_PROJECT_SECRET=YOUR_INFURA_SECRET
```

### Run the Application

```bash
npm start
```

Access at: **http://localhost:3000**

## 📱 Using the Portal

### Step 1: Fill Product Details

Enter the following information:

- **Product Name** (Required): Name of your product
- **Category**: Product category (e.g., Electronics, Fashion)
- **Manufacturer**: Your company name
- **Manufacturing Date**: When the product was made
- **Serial Number**: Internal product serial number
- **NFC Serial ID** (Required): The unique ID from the embedded NFC tag
- **Description**: Additional product details

### Step 2: Mint NFT

1. Click "Mint Product NFT"
2. The system will:
   - Upload metadata to IPFS
   - Mint an NFT on Hedera
   - Link the NFT to the NFC Serial ID
3. Wait for confirmation (usually 3-5 seconds)

### Step 3: Record Results

After successful minting, you'll see:
- **NFT Serial Number**: The unique serial of your minted NFT
- **Token ID**: The NFT token type ID
- **Transaction ID**: Hedera transaction ID for verification
- **NFC Serial ID**: Confirmation of the linked NFC tag
- **Metadata CID**: IPFS content identifier
- **IPFS URL**: Direct link to view metadata

**Important**: Save these details for your records!

## 🔧 Component Overview

### MintProduct Component

Main component for minting NFTs.

**Location**: `src/components/MintProduct.js`

**Key Functions**:
```javascript
handleMintProduct(e)     // Main minting function
handleInputChange(e)      // Form input handler
```

**Process Flow**:
1. Validate input data
2. Prepare metadata object
3. Upload metadata to IPFS
4. Initialize Hedera client
5. Mint NFT with metadata CID
6. Associate NFT with NFC Serial ID
7. Display results

## 🛠️ Service Utilities

### Hedera Service

**Location**: `src/utils/hederaService.js`

**Functions**:
```javascript
// Initialize Hedera client
initializeHederaClient(operatorId, operatorKey, network)

// Mint new product NFT
mintProductNFT(client, tokenId, supplyKey, metadataCID)
  -> Returns: { serialNumber, transactionId, metadataCID, tokenId }

// Associate NFT with NFC serial
associateNFCSerial(nftSerialNumber, nfcSerialId, productDetails)
  -> Returns: mapping object
```

### IPFS Service

**Location**: `src/utils/ipfsService.js`

**Functions**:
```javascript
// Initialize IPFS client
initializeIPFS()

// Upload metadata to IPFS
uploadMetadataToIPFS(productData)
  -> Returns: IPFS CID string

// Get metadata from IPFS
getMetadataFromIPFS(cid)
  -> Returns: metadata object
```

## 📊 Metadata Structure

The metadata uploaded to IPFS follows this structure:

```json
{
  "name": "Premium Leather Wallet",
  "category": "Accessories",
  "manufacturer": "Veritas Corp",
  "manufacturingDate": "2025-10-25",
  "serialNumber": "SN-2025-001234",
  "description": "Handcrafted genuine leather wallet",
  "nfcSerialId": "NFC-04:A1:B2:C3:D4:E5:F6",
  "timestamp": "2025-10-25T10:30:00.000Z",
  "version": "1.0"
}
```

## ⚠️ Security Considerations

### Production Deployment

**DO NOT** use this frontend implementation in production as-is!

**Why?**
- Private keys are exposed in environment variables
- No backend authentication
- Direct blockchain transactions from browser

**Recommended Production Architecture**:

```
React Frontend → Backend API → Hedera Network
                      ↓
                  Database
```

### Secure Backend Implementation

Create a Node.js/Express backend:

```javascript
// backend/routes/mint.js
router.post('/mint-product', authenticate, async (req, res) => {
  // 1. Validate user permissions
  // 2. Sanitize input data
  // 3. Upload to IPFS
  // 4. Mint NFT using server-side keys
  // 5. Store mapping in database
  // 6. Return result to frontend
});
```

### Database Integration

Store NFC-to-NFT mappings securely:

```sql
INSERT INTO products (
  nft_token_id,
  nft_serial_number,
  nfc_serial_id,
  metadata_cid,
  minted_by,
  minted_at
) VALUES (?, ?, ?, ?, ?, NOW());
```

## 🧪 Testing

### Test with Mock Data

1. Start the application: `npm start`
2. Fill in the form with test data:
   - Product Name: "Test Product"
   - NFC Serial ID: "NFC-TEST-001"
3. Click "Mint Product NFT"
4. Verify the results

### Verify on HashScan

After minting:
1. Copy the Transaction ID
2. Go to https://hashscan.io/testnet
3. Search for your transaction
4. Verify NFT details

### Check IPFS Metadata

1. Copy the IPFS URL from results
2. Open in browser
3. Verify metadata is correct

## 🐛 Troubleshooting

### Error: "Hedera credentials not configured"

**Solution**: Ensure `.env.local` has valid credentials:
```env
REACT_APP_HEDERA_OPERATOR_ID=0.0.123456
REACT_APP_HEDERA_OPERATOR_KEY=302e020100...
```

### Error: "NFT Token ID not configured"

**Solution**: Run the Hedera deployment script first:
```bash
cd ../hedera-setup
npm run deploy
```

Then copy the NFT Token ID to your `.env.local`:
```env
REACT_APP_NFT_TOKEN_ID=0.0.789012
```

### IPFS Upload Fails

**Fallback**: The app will generate a mock CID for testing if IPFS is unavailable.

**Fix for production**:
- Sign up for [Infura IPFS](https://infura.io/)
- Add credentials to `.env.local`

### Slow Minting

**Normal behavior**: NFT minting typically takes 3-5 seconds

**If longer**:
- Check Hedera network status
- Verify internet connection
- Check account HBAR balance

## 📈 Scaling for Production

### Bulk Minting

For minting multiple products:

```javascript
async function bulkMintProducts(products) {
  const results = [];
  
  for (const product of products) {
    const cid = await uploadMetadataToIPFS(product);
    const result = await mintProductNFT(client, tokenId, supplyKey, cid);
    results.push(result);
    
    // Add delay to avoid rate limiting
    await sleep(1000);
  }
  
  return results;
}
```

### CSV Import

Add CSV import functionality:

```javascript
import Papa from 'papaparse';

function handleCSVUpload(file) {
  Papa.parse(file, {
    header: true,
    complete: async (results) => {
      await bulkMintProducts(results.data);
    }
  });
}
```

## 🎨 Customization

### Branding

Update colors in `src/components/MintProduct.css`:

```css
.mint-button {
  background: linear-gradient(135deg, YOUR_COLOR_1, YOUR_COLOR_2);
}
```

### Additional Fields

Add custom fields to the form:

```javascript
// In MintProduct.js
const [formData, setFormData] = useState({
  // ... existing fields
  customField1: '',
  customField2: ''
});
```

### Validation Rules

Add custom validation:

```javascript
function validateProductData(data) {
  if (data.price && data.price < 0) {
    throw new Error("Price must be positive");
  }
  // ... more validation
}
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `build/` directory.

### Deploy to Hosting

**Vercel**:
```bash
npm i -g vercel
vercel
```

**Netlify**:
```bash
npm i -g netlify-cli
netlify deploy --prod
```

**Important**: Implement backend API before production deployment!

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Hedera SDK](https://docs.hedera.com/guides/docs/sdks)
- [IPFS Documentation](https://docs.ipfs.tech/)

## 🔄 Next Steps

After minting products:

1. Test verification in the Customer App
2. Implement database for NFC mappings
3. Create backend API for production
4. Add batch minting capability
5. Implement analytics dashboard

---

**Need help?** Check the main [README](../README.md) or open an issue.
