# Veritas Scan - Customer App

The Customer App is a React application that allows customers to verify product authenticity by scanning NFC tags and claim ownership of products through blockchain-based NFT transfers.

## 🎯 Features

- **Web3Auth Login**: Simplified authentication via social logins
- **NFC Product Verification**: Scan NFC tags to verify authenticity
- **Provenance Display**: View complete ownership history
- **Ownership Transfer**: Claim product ownership with NFT transfer
- **IPFS Metadata**: Retrieve and display product information
- **Real-time Verification**: Instant blockchain-based authentication

## 🚀 Quick Start

### Prerequisites

- Completed Hedera Setup (tokens deployed)
- Products minted via Ledger Hub
- Updated `.env` file

### Installation

```bash
npm install
```

### Configuration

Create a `.env.local` file in the `veritas-scan` directory:

```env
# Hedera Configuration
REACT_APP_HEDERA_NETWORK=testnet
REACT_APP_HEDERA_OPERATOR_ID=0.0.YOUR_OPERATOR_ID
REACT_APP_HEDERA_OPERATOR_KEY=YOUR_OPERATOR_KEY
REACT_APP_HEDERA_ACCOUNT_ID=0.0.YOUR_MANUFACTURER_ACCOUNT_ID
REACT_APP_HEDERA_PRIVATE_KEY=YOUR_MANUFACTURER_PRIVATE_KEY

# Token IDs
REACT_APP_NFT_TOKEN_ID=0.0.YOUR_NFT_TOKEN_ID

# Web3Auth
REACT_APP_WEB3AUTH_CLIENT_ID=YOUR_WEB3AUTH_CLIENT_ID

# IPFS (Optional)
REACT_APP_IPFS_PROJECT_ID=YOUR_INFURA_PROJECT_ID
REACT_APP_IPFS_PROJECT_SECRET=YOUR_INFURA_SECRET
```

### Run the Application

```bash
npm start
```

Access at: **http://localhost:3002**

## 📱 Using the App

### Step 1: Login

1. Click "Login with Web3Auth"
2. Choose your preferred login method:
   - Google
   - Facebook
   - Email
   - Other social providers
3. Complete authentication
4. Your Hedera account will be linked

**Note**: In development mode without Web3Auth configured, a mock login is used.

### Step 2: Scan Product

**Method 1: NFC Tap** (Mobile with NFC)
1. Tap your phone to the product's NFC tag
2. The NFC serial ID will be automatically captured
3. Verification starts immediately

**Method 2: Manual Entry**
1. Enter the NFC Serial ID manually
2. Click "Verify Product"

**Method 3: Test Mode**
1. Click "Simulate NFC Tap"
2. Uses test serial ID: `NFC-TEST-001`

### Step 3: View Product Details

After verification, you'll see:

**Product Information**:
- Product name and category
- Manufacturer details
- Manufacturing date
- Serial number
- Description

**Blockchain Details**:
- NFT Token ID
- NFT Serial Number
- Current owner account
- NFC Serial ID

**Ownership History (Provenance)**:
- Complete transaction timeline
- Mint event
- All transfers
- Transaction IDs for verification

### Step 4: Claim Ownership

If you're not the current owner:

1. Review product details and history
2. Click "Claim Ownership"
3. Confirm the transaction
4. Wait for blockchain confirmation (3-5 seconds)
5. Receive ownership confirmation

After claiming:
- You become the verified owner
- Transaction is recorded on blockchain
- Ownership history is updated

## 🔧 Component Overview

### Web3AuthLogin Component

Handles user authentication.

**Location**: `src/components/Web3AuthLogin.js`

**Functions**:
```javascript
handleLogin()     // Authenticate user
handleLogout()    // Log out user
```

**User Object**:
```javascript
{
  accountId: "0.0.123456",
  email: "user@example.com",
  name: "John Doe",
  provider: web3authProvider,
  isMock: false
}
```

### VerifyProduct Component

Main component for product verification and ownership transfer.

**Location**: `src/components/VerifyProduct.js`

**Key Functions**:
```javascript
handleVerifyProduct(e)     // Verify product by NFC serial
handleClaimOwnership()     // Transfer NFT ownership
handleSimulateNFCTap()     // Test with mock NFC data
```

**Process Flow**:
1. User enters/scans NFC Serial ID
2. Query NFT from Hedera network
3. Retrieve metadata from IPFS
4. Fetch ownership history
5. Display complete product information
6. Enable ownership claim if applicable

## 🛠️ Service Utilities

### Web3Auth Service

**Location**: `src/utils/web3AuthService.js`

**Functions**:
```javascript
// Initialize Web3Auth
initializeWeb3Auth()
  -> Returns: Web3Auth instance

// Login user
loginWithWeb3Auth()
  -> Returns: { accountId, email, name, provider }

// Logout user
logoutFromWeb3Auth()
```

### Hedera Service

**Location**: `src/utils/hederaService.js`

**Functions**:
```javascript
// Initialize Hedera client
initializeHederaClient(operatorId, operatorKey, network)

// Query NFT by NFC Serial ID
queryNFTByNFCSerial(client, tokenId, nfcSerialId)
  -> Returns: { tokenId, serialNumber, accountId, metadata, createdAt }

// Get NFT ownership history
getNFTProvenance(tokenId, serialNumber)
  -> Returns: Array of transaction events

// Transfer NFT ownership
transferNFTOwnership(client, tokenId, serialNumber, from, fromKey, to)
  -> Returns: { success, transactionId, status, newOwner, timestamp }
```

### IPFS Service

**Location**: `src/utils/ipfsService.js`

**Functions**:
```javascript
// Initialize IPFS client
initializeIPFS()

// Get metadata from IPFS
getMetadataFromIPFS(cid)
  -> Returns: Product metadata object
```

## 🔐 Web3Auth Setup

### Get Your Client ID

1. Go to [Web3Auth Dashboard](https://dashboard.web3auth.io/)
2. Sign up / Login
3. Create a new project:
   - **Name**: Veritas Scan
   - **Environment**: Testnet
4. Copy your **Client ID**
5. Add to `.env.local`:
   ```env
   REACT_APP_WEB3AUTH_CLIENT_ID=YOUR_CLIENT_ID_HERE
   ```

### Configure Redirect URLs

In Web3Auth Dashboard:
1. Go to your project settings
2. Add redirect URLs:
   - Development: `http://localhost:3002`
   - Production: `https://yourdomain.com`

### Supported Login Methods

Web3Auth supports:
- Google
- Facebook
- Twitter
- Discord
- Apple
- Email (Passwordless)
- SMS
- Custom authentication

## 📊 Provenance Data Structure

Transaction history follows this format:

```javascript
[
  {
    type: "MINT",
    timestamp: "2025-10-01T10:00:00Z",
    from: null,
    to: "0.0.123456",
    transactionId: "0.0.123456@1696156800.000000000"
  },
  {
    type: "TRANSFER",
    timestamp: "2025-10-15T14:30:00Z",
    from: "0.0.123456",
    to: "0.0.789012",
    transactionId: "0.0.123456@1697378200.000000000"
  }
]
```

## ⚠️ Security Considerations

### Production Deployment

**Critical Security Issues in Current Implementation**:

1. **Private Keys in Frontend**: Manufacturer keys are exposed
2. **No Backend API**: All transactions from browser
3. **No Database**: NFC mappings hardcoded

### Recommended Production Architecture

```
Mobile/Web App → Backend API → Hedera Network
                      ↓
                  Database (NFC Mappings)
                      ↓
                  Authentication Service
```

### Secure Backend Implementation

```javascript
// backend/routes/verify.js
router.post('/verify-product', authenticate, async (req, res) => {
  const { nfcSerialId } = req.body;
  
  // 1. Query database for NFT serial
  const product = await db.query(
    'SELECT * FROM products WHERE nfc_serial_id = ?',
    [nfcSerialId]
  );
  
  // 2. Query Hedera for NFT info
  const nftInfo = await queryNFT(product.tokenId, product.serialNumber);
  
  // 3. Get metadata from IPFS
  const metadata = await getIPFSMetadata(nftInfo.metadataCID);
  
  // 4. Return combined data
  res.json({ product, nftInfo, metadata });
});

router.post('/claim-ownership', authenticate, async (req, res) => {
  const { nftSerialNumber, userAccountId } = req.body;
  
  // 1. Verify user owns the account
  // 2. Execute transfer using server-side keys
  // 3. Update database
  // 4. Return transaction result
});
```

### Database Schema

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  nft_token_id VARCHAR(50) NOT NULL,
  nft_serial_number VARCHAR(50) NOT NULL,
  nfc_serial_id VARCHAR(100) UNIQUE NOT NULL,
  metadata_cid VARCHAR(100) NOT NULL,
  current_owner VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ownership_history (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  from_account VARCHAR(50),
  to_account VARCHAR(50),
  transaction_id VARCHAR(100),
  transferred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing

### Test Flow

1. **Login**: Click "Login with Web3Auth"
2. **Simulate Scan**: Click "Simulate NFC Tap"
3. **Verify**: Review product details and history
4. **Claim**: Click "Claim Ownership"
5. **Confirm**: Verify successful transfer

### Test with Real NFC

For testing with actual NFC tags:

1. Mint a product in Ledger Hub
2. Record the NFC Serial ID used
3. Write that ID to a physical NFC tag using an NFC writer
4. Tap the tag with your phone
5. App should detect and verify

### Mock Mode Testing

Without Web3Auth configured:
- Mock login automatically used
- Test account ID generated
- All other features work normally

## 🐛 Troubleshooting

### Error: "Hedera credentials not configured"

**Solution**: Add credentials to `.env.local`:
```env
REACT_APP_HEDERA_OPERATOR_ID=0.0.123456
REACT_APP_HEDERA_OPERATOR_KEY=302e...
```

### Error: "NFT not found for this NFC Serial ID"

**Causes**:
- Product not minted yet
- Wrong NFC Serial ID entered
- Database mapping missing

**Solution**:
- Verify product was minted in Ledger Hub
- Check NFC Serial ID spelling
- Implement database lookup in production

### Web3Auth Modal Not Appearing

**Solution**:
- Check Client ID is correct
- Verify redirect URLs configured
- Check browser console for errors

### Ownership Transfer Fails

**Common Issues**:
- Insufficient HBAR balance
- Invalid signature
- NFT already owned by user

**Debug**:
- Check account balance
- Verify manufacturer account has transfer authority
- Review Hedera transaction logs

## 📱 Mobile Integration

### NFC Reading

For mobile apps with NFC capability:

```javascript
// React Native NFC example
import NfcManager from 'react-native-nfc-manager';

async function readNFC() {
  await NfcManager.start();
  const tag = await NfcManager.requestTechnology(
    NfcTech.IsoDep
  );
  
  const nfcSerialId = tag.id;
  // Use serial ID for verification
}
```

### Progressive Web App (PWA)

Enable PWA for installation:

1. Update `public/manifest.json`
2. Add service worker
3. Configure for offline use

## 🎨 Customization

### Branding

Update styles in `src/components/VerifyProduct.css`:

```css
.verify-button {
  background: linear-gradient(135deg, YOUR_COLOR_1, YOUR_COLOR_2);
}
```

### Additional Product Fields

Display custom metadata:

```javascript
<div className="info-item">
  <strong>Your Custom Field:</strong>
  <span>{productData.metadata.customField}</span>
</div>
```

### Custom Provenance Display

Modify timeline appearance:

```javascript
<div className="timeline-event custom-style">
  {/* Your custom provenance UI */}
</div>
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
vercel --prod
```

### Deploy to Netlify

```bash
netlify deploy --prod --dir=build
```

### Environment Variables

Don't forget to set environment variables in your hosting platform!

## 📚 Additional Resources

- [Web3Auth Documentation](https://web3auth.io/docs/)
- [Hedera SDK](https://docs.hedera.com/guides/docs/sdks)
- [React Documentation](https://react.dev/)
- [NFC Development](https://developer.mozilla.org/en-US/docs/Web/API/Web_NFC_API)

## 🔄 Next Steps

1. **Implement Backend API** for secure transactions
2. **Add Database** for NFC-to-NFT mappings
3. **Mobile App** with native NFC reading
4. **QR Code Fallback** for non-NFC devices
5. **Marketplace Features** for resale
6. **Analytics Dashboard** for insights

---

**Need help?** Check the main [README](../README.md) or open an issue.
