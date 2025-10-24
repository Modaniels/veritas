# Hedera Setup

This module contains scripts for deploying and managing Hedera Token Service (HTS) tokens for the Veritas product authentication system.

## 📋 Overview

The Hedera Setup module provides:
- **Utility Token (VUT)**: Fungible token for transaction fees and rewards
- **Product NFT Token**: Non-fungible token type for unique products
- **Initialization Scripts**: Easy deployment and testing

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Ensure your root `.env` file contains:

```env
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
HEDERA_OPERATOR_ID=0.0.YOUR_OPERATOR_ID
HEDERA_OPERATOR_KEY=YOUR_OPERATOR_PRIVATE_KEY
```

### 3. Initialize Hedera Client

Test your connection:

```bash
npm run init
```

This will:
- Connect to Hedera testnet
- Verify your credentials
- Check your account balance

### 4. Deploy Tokens

Deploy the utility and NFT tokens:

```bash
npm run deploy
```

This will:
- Create the Veritas Utility Token (VUT)
- Create the Product NFT token type
- Mint a test NFT
- Update your `.env` file with token IDs

## 📝 Scripts

### initializeHedera.js

Initializes and tests the Hedera client connection.

**Usage:**
```bash
node scripts/initializeHedera.js
```

**Functions:**
- `initializeClient()`: Creates and configures Hedera client
- `getAccountBalance()`: Retrieves account balance
- `closeClient()`: Gracefully closes the connection

### deployTokens.js

Deploys the utility token and NFT token type.

**Usage:**
```bash
node scripts/deployTokens.js
```

**Functions:**
- `createUtilityToken()`: Creates fungible VUT token
- `createProductNFT()`: Creates NFT token type for products
- `mintTestNFT()`: Mints a test NFT with sample metadata

**Output:**
- Utility Token ID
- NFT Token ID
- Test NFT serial number
- Updates `.env` file automatically

## 🔑 Token Details

### Veritas Utility Token (VUT)

- **Type**: Fungible Token
- **Symbol**: VUT
- **Decimals**: 2
- **Initial Supply**: 1,000,000.00 VUT
- **Supply Type**: Infinite
- **Keys**:
  - Admin Key: Treasury account
  - Supply Key: Treasury account
  - Freeze Key: Treasury account
  - Wipe Key: Treasury account

### Veritas Product NFT (VPNFT)

- **Type**: Non-Fungible Unique Token
- **Symbol**: VPNFT
- **Decimals**: 0
- **Supply Type**: Infinite
- **Keys**:
  - Admin Key: Treasury account
  - Supply Key: Treasury account (for minting)
  - Wipe Key: Treasury account

## 💡 Usage Examples

### Example 1: Basic Deployment

```bash
# Navigate to hedera-setup directory
cd hedera-setup

# Install dependencies
npm install

# Test connection
npm run init

# Deploy tokens
npm run deploy
```

### Example 2: Programmatic Usage

```javascript
const { initializeClient, closeClient } = require('./scripts/initializeHedera');
const { createProductNFT, mintTestNFT } = require('./scripts/deployTokens');

async function main() {
  const client = await initializeClient();
  
  const treasuryId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  const treasuryKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
  
  const nftTokenId = await createProductNFT(client, treasuryId, treasuryKey);
  
  await closeClient(client);
}

main();
```

## 🔍 Verification

After deployment, verify your tokens on HashScan:

1. Go to https://hashscan.io/testnet
2. Search for your token ID
3. View token details, supply, and transactions

## ⚠️ Important Notes

### Transaction Fees

- Token creation: ~1-2 HBAR
- NFT minting: ~0.1 HBAR per NFT
- Ensure your account has sufficient HBAR balance

### Key Management

**NEVER** share or commit your private keys:
- Keep `.env` file in `.gitignore`
- Use separate accounts for testing and production
- Implement proper key rotation policies

### Network Selection

**Testnet** (Development):
- Use for testing and development
- Free HBAR from faucet
- Network ID: `0x128`

**Mainnet** (Production):
- Real HBAR costs
- Production-grade security
- Network ID: `0x127`

## 🛠️ Troubleshooting

### Error: "Missing HEDERA_OPERATOR_ID or HEDERA_OPERATOR_KEY"

**Solution**: Ensure your `.env` file has valid credentials:
```env
HEDERA_OPERATOR_ID=0.0.123456
HEDERA_OPERATOR_KEY=302e020100300506032b657004220420...
```

### Error: "Insufficient account balance"

**Solution**: Add HBAR to your account:
- **Testnet**: Use the [Hedera Faucet](https://portal.hedera.com/faucet)
- **Mainnet**: Transfer HBAR from an exchange

### Error: "INVALID_SIGNATURE"

**Solution**: Verify your private key matches your account ID:
```bash
node -e "console.log(require('@hashgraph/sdk').PrivateKey.fromString('YOUR_KEY').publicKey)"
```

### Token Creation Fails

**Common causes**:
- Insufficient HBAR balance
- Invalid key format
- Network connectivity issues

**Debug steps**:
1. Run `npm run init` to test connection
2. Check account balance
3. Verify private key format
4. Check Hedera network status

## 📚 Additional Resources

### Hedera Documentation
- [Hedera Token Service](https://docs.hedera.com/guides/docs/sdks/tokens)
- [Creating Tokens](https://docs.hedera.com/guides/docs/sdks/tokens/create-a-token)
- [Minting NFTs](https://docs.hedera.com/guides/docs/sdks/tokens/mint-a-token)

### Hedera SDK
- [JavaScript SDK](https://github.com/hashgraph/hedera-sdk-js)
- [SDK Examples](https://github.com/hashgraph/hedera-sdk-js/tree/main/examples)

### Network Information
- [Hedera Portal](https://portal.hedera.com/)
- [HashScan Explorer](https://hashscan.io/)
- [Network Status](https://status.hedera.com/)

## 🧪 Testing

### Test Token Creation

```bash
# Initialize and test connection
npm run init

# Deploy tokens
npm run deploy

# Verify output includes:
# ✅ Utility Token created with ID: 0.0.XXXXXX
# ✅ Product NFT Token created with ID: 0.0.YYYYYY
# ✅ Test NFT minted successfully
```

### Test NFT Minting

```javascript
const { mintTestNFT } = require('./scripts/deployTokens');

// Mint additional test NFT
await mintTestNFT(
  client,
  "0.0.YOUR_NFT_TOKEN_ID",
  treasuryKey,
  "QmYourIPFSCIDHere"
);
```

## 🔄 Next Steps

After successful deployment:

1. **Save Token IDs**: Your `.env` file will be updated with:
   - `UTILITY_TOKEN_ID`
   - `NFT_TOKEN_ID`

2. **Start Manufacturer Portal**: 
   ```bash
   cd ../ledger-hub
   npm start
   ```

3. **Mint Products**: Use the portal to mint NFTs for real products

4. **Test Customer App**:
   ```bash
   cd ../veritas-scan
   npm start
   ```

---

**Need help?** Check the main [README](../README.md) or open an issue.
