# 🛡️ Veritas: Digital Product Authentication System

**Veritas** (Latin for "Truth") is a comprehensive blockchain-based product authentication platform that eliminates counterfeiting and provides complete supply chain transparency. Built on the Hedera Network, Veritas uses NFT technology combined with secure NFC tags to give every physical product an unforgeable digital identity that customers can verify instantly with a simple smartphone tap.

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [❌ The Problem We Solve](#-the-problem-we-solve)
- [✅ Our Solution](#-our-solution)
- [🏗️ System Architecture](#️-system-architecture)
- [🔧 Technology Stack](#-technology-stack)
- [🚀 Quick Start](#-quick-start)
- [📱 Application Components](#-application-components)
- [🛠️ Development Guide](#️-development-guide)
- [🔐 Security Features](#-security-features)
- [📈 Business Benefits](#-business-benefits)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🎯 Overview

Veritas is an enterprise-grade digital authentication and supply chain transparency platform designed for high-value goods, particularly electronics, luxury items, and critical components. The system creates an immutable digital twin for every physical product, ensuring authenticity and enabling complete traceability throughout the product lifecycle.

### Key Features

- **🔒 Unforgeable Authentication**: Each product gets a unique NFT linked to a tamper-proof NFC tag
- **⚡ Instant Verification**: Customers verify authenticity with a single phone tap
- **🌐 Complete Transparency**: Full ownership and transfer history on public ledger
- **💳 Seamless Experience**: No crypto knowledge required - uses social logins
- **💰 Cost-Effective**: Hedera's low fees enable mass-market adoption
- **🔗 End-to-End Integration**: From manufacturing to customer ownership

## ❌ The Problem We Solve

### 1. Counterfeiting Crisis
- **Global Impact**: Counterfeiting costs the global economy $4.2 trillion annually
- **Consumer Risk**: Fake products pose safety risks and financial losses
- **Brand Damage**: Counterfeit goods erode brand trust and reputation
- **Traditional Limitations**: Physical anti-counterfeiting measures are easily replicated

### 2. Supply Chain Opacity
- **Lack of Visibility**: Consumers cannot verify product origins or authenticity
- **Trust Deficit**: No reliable way to confirm manufacturing details
- **Fragmented Records**: Disconnected systems create gaps in traceability
- **Manual Processes**: Paper-based verification is slow and unreliable

### 3. Poor User Experience
- **Complex Solutions**: Existing blockchain systems require technical expertise
- **High Costs**: Traditional blockchain fees make micro-transactions uneconomical
- **Slow Processing**: Long confirmation times hinder real-time verification
- **Adoption Barriers**: Cryptocurrency requirements limit mass-market appeal

## ✅ Our Solution

Veritas provides a comprehensive solution that addresses all these challenges:

| Problem | Veritas Solution | Value Delivered |
|---------|------------------|-----------------|
| **Counterfeiting** | Unique NFT per product + tamper-proof NFC tag | Unforgeable proof of authenticity with instant verification |
| **Lack of Trust** | Immutable ledger records all product events | Complete transparency and verifiable provenance |
| **Poor UX** | Web3Auth + Hedera's speed + intuitive interface | Mass-market adoption with no crypto knowledge required |
| **High Costs** | Hedera's near-zero fees + efficient architecture | Economically viable for all product price points |

### How It Works

1. **🏭 Manufacturing**: Product receives unique NFT and NFC tag during production
2. **📦 Distribution**: All transfers recorded immutably on Hedera ledger
3. **🛒 Purchase**: Customer taps NFC tag to verify authenticity
4. **👤 Ownership**: Customer claims digital ownership via social login
5. **🔄 Lifecycle**: All future transfers and history remain permanently accessible

## 🏗️ System Architecture

Veritas consists of three integrated components working together to provide complete product authentication:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Hedera Setup │    │  Ledger Hub     │    │  Veritas Scan   │
│   (Blockchain)  │    │  (B2B Portal)   │    │  (Customer App) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────────────────────────────────────────────────────┐
│                    Hedera Network                                │
│  • NFT Token Service (HTS)  • Fast Consensus  • Low Fees       │
└─────────────────────────────────────────────────────────────────┘
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      IPFS       │    │    Web3Auth     │    │   NFC Tags      │
│  (Metadata)     │    │  (Identity)     │    │  (Physical)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1. 🔧 Hedera Setup Module
**Purpose**: Blockchain infrastructure management
- **Token Deployment**: Creates fungible utility tokens (VUT) and NFT token types
- **Network Configuration**: Manages Hedera testnet/mainnet connections
- **Account Management**: Handles operator accounts and permissions
- **Smart Contract Setup**: Initializes token services and validates connections

### 2. 🏭 Ledger Hub (B2B Manufacturer Portal)
**Purpose**: Product onboarding and NFT minting
- **Product Registration**: Input product details, metadata, and manufacturing info
- **NFT Minting**: Create unique NFTs for each physical product
- **NFC Linking**: Associate NFT with physical NFC tag serial numbers
- **IPFS Integration**: Store rich product metadata permanently
- **Batch Operations**: Handle multiple products efficiently
- **Audit Trail**: Track all minting activities and results

### 3. 📱 Veritas Scan (B2C Customer App)
**Purpose**: Product verification and ownership management
- **NFC Scanning**: Read embedded NFC tags instantly
- **Authenticity Verification**: Query blockchain for product status
- **Ownership Transfer**: Claim digital ownership through Web3Auth
- **Provenance Display**: Show complete ownership and transfer history
- **Social Login**: Authenticate via email, Google, Facebook, etc.
- **Mobile Optimized**: Works seamlessly on any smartphone

## 🔧 Technology Stack

### Blockchain & Digital Assets
- **[Hedera Hashgraph](https://hedera.com/)**: Enterprise-grade DLT with high throughput and low fees
- **[Hedera Token Service (HTS)](https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service)**: Native NFT functionality without smart contracts
- **[Hedera JavaScript SDK](https://github.com/hashgraph/hedera-sdk-js)**: Official SDK for blockchain interactions

### Frontend Applications
- **[React.js](https://reactjs.org/)**: Modern frontend framework for both applications
- **[Web3Auth](https://web3auth.io/)**: Social authentication for seamless user onboarding
- **CSS3 & Modern Styling**: Responsive, mobile-first design

### Storage & Infrastructure
- **[IPFS](https://ipfs.io/)**: Decentralized storage for product metadata
- **[Infura IPFS](https://infura.io/product/ipfs)**: Reliable IPFS gateway and pinning service
- **NFC Technology**: ISO14443 Type A/B compatible tags

### Development Tools
- **Node.js**: JavaScript runtime for all applications
- **npm**: Package management and build scripts
- **Environment Configuration**: Secure credential management

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Hedera Testnet Account** ([Create here](https://portal.hedera.com/))
- **Web3Auth Account** ([Sign up here](https://web3auth.io/))
- **Infura Account** (Optional, for IPFS)

### 1. 📥 Clone and Install

```bash
git clone https://github.com/Modaniels/veritas.git
cd veritas
npm install
```

### 2. 🔧 Environment Configuration

Create a `.env` file in the root directory:

```env
# Hedera Network Configuration
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
HEDERA_OPERATOR_ID=0.0.YOUR_OPERATOR_ID
HEDERA_OPERATOR_KEY=YOUR_OPERATOR_PRIVATE_KEY

# Web3Auth Configuration
WEB3AUTH_CLIENT_ID=YOUR_WEB3AUTH_CLIENT_ID

# IPFS Configuration (Optional)
IPFS_PROJECT_ID=YOUR_INFURA_PROJECT_ID
IPFS_PROJECT_SECRET=YOUR_INFURA_SECRET
```

### 3. 🏗️ Initialize Blockchain Infrastructure

```bash
# Test Hedera connection
npm run hedera:init

# Deploy tokens (VUT and NFT types)
npm run hedera:deploy
```

### 4. 🚀 Launch Applications

**Manufacturer Portal (Ledger Hub):**
```bash
npm run hub:dev
# Access at http://localhost:3000
```

**Customer App (Veritas Scan):**
```bash
npm run scan:dev
# Access at http://localhost:3001
```

### 5. ✅ Verification

1. **Ledger Hub**: Create a test product and mint its NFT
2. **Veritas Scan**: Verify the product using the generated NFT serial
3. **Check Hedera**: Confirm transactions on [HashScan](https://hashscan.io/testnet/)

## 📱 Application Components

### 🏭 Ledger Hub Features

#### Product Minting Interface
- **Form Fields**: Product name, category, manufacturer, manufacturing date, serial number, NFC ID, description
- **Validation**: Real-time input validation and error handling
- **IPFS Upload**: Automatic metadata storage with progress indicators
- **NFT Creation**: One-click minting with immediate confirmation
- **Results Display**: Transaction IDs, NFT serials, and verification links

#### Batch Operations
- **CSV Import**: Bulk product uploads
- **Progress Tracking**: Real-time status for large batches
- **Error Handling**: Detailed logs for failed operations
- **Export Results**: Download minting results and audit trails

### 📱 Veritas Scan Features

#### Authentication System
- **Web3Auth Integration**: Social login (Google, Facebook, Email, etc.)
- **Automatic Wallet Creation**: Invisible Web3 wallet management
- **Session Management**: Persistent login across sessions
- **Security**: Private key abstraction for user safety

#### Product Verification
- **NFC Reading**: Automatic tag detection and parsing
- **Blockchain Query**: Real-time NFT status verification
- **Metadata Display**: Rich product information from IPFS
- **Ownership History**: Complete provenance chain
- **Transfer Interface**: Claim ownership with guided process

#### User Experience
- **Mobile Responsive**: Optimized for smartphone usage
- **Offline Capability**: Cache verification results
- **Multiple Languages**: Internationalization support
- **Accessibility**: WCAG compliant interface

## 🛠️ Development Guide

### Project Structure

```
veritas/
├── hedera-setup/          # Blockchain infrastructure
│   ├── scripts/
│   │   ├── initializeHedera.js    # Connection testing
│   │   ├── deployTokens.js        # Token deployment
│   │   └── mintProductWithNFC.js   # Utility scripts
│   └── package.json
├── ledger-hub/            # Manufacturer portal
│   ├── src/
│   │   ├── components/
│   │   │   └── MintProduct.js     # Main minting component
│   │   ├── utils/
│   │   │   ├── hederaService.js   # Blockchain interactions
│   │   │   └── ipfsService.js     # IPFS operations
│   │   └── App.js
│   └── package.json
├── veritas-scan/          # Customer application
│   ├── src/
│   │   ├── components/
│   │   │   ├── VerifyProduct.js   # Verification interface
│   │   │   └── Web3AuthLogin.js   # Authentication
│   │   ├── utils/
│   │   │   ├── hederaService.js   # Blockchain queries
│   │   │   ├── ipfsService.js     # Metadata retrieval
│   │   │   └── web3AuthService.js # Auth management
│   │   └── App.js
│   └── package.json
└── package.json           # Root package management
```

### Development Workflow

1. **Environment Setup**: Configure all required API keys and accounts
2. **Blockchain Deployment**: Initialize Hedera tokens and verify setup
3. **Component Development**: Build and test individual React components
4. **Integration Testing**: Verify end-to-end workflows
5. **Production Deployment**: Deploy to chosen hosting platform

### API Integration Points

#### Hedera Network
```javascript
// Initialize client
const client = Client.forTestnet()
    .setOperator(accountId, privateKey);

// Mint NFT
const mintTx = await new TokenMintTransaction()
    .setTokenId(nftTokenId)
    .setMetadata([Buffer.from(JSON.stringify(metadata))])
    .execute(client);
```

#### IPFS Storage
```javascript
// Upload metadata
const result = await ipfs.add(JSON.stringify(productData), {
    pin: true,
    cidVersion: 1
});
```

#### Web3Auth
```javascript
// Initialize authentication
const web3auth = new Web3Auth({
    clientId: "YOUR_CLIENT_ID",
    chainConfig: {
        chainNamespace: "eip155",
        chainId: "0x127" // Hedera testnet
    }
});
```

## 🔐 Security Features

### Blockchain Security
- **Immutable Records**: All transactions permanently recorded on Hedera
- **Consensus Mechanism**: Hedera's asynchronous Byzantine Fault Tolerance
- **Key Management**: Secure operator key handling and rotation
- **Network Isolation**: Testnet for development, mainnet for production

### Application Security
- **Authentication**: Web3Auth provides secure social login
- **Data Validation**: Input sanitization and validation on all forms
- **Error Handling**: Graceful failure modes without data exposure
- **Session Management**: Secure token-based session handling

### Physical Security
- **NFC Tamper Resistance**: Secure NFC tags with anti-tamper features
- **Unique Identifiers**: Cryptographically secure serial generation
- **Manufacturing Integration**: Secure tag application during production
- **Supply Chain Integrity**: Verification at each transfer point

## 📈 Business Benefits

### For Manufacturers
- **Brand Protection**: Eliminate counterfeit products and protect reputation
- **Supply Chain Visibility**: Track products throughout entire lifecycle
- **Customer Trust**: Provide verifiable proof of authenticity
- **Regulatory Compliance**: Meet traceability requirements in regulated industries
- **Data Insights**: Gather analytics on product usage and transfers

### For Consumers
- **Authenticity Guarantee**: Instant verification of genuine products
- **Provenance Information**: See complete product history and origins
- **Digital Ownership**: Secure, transferable digital certificates
- **Warranty Tracking**: Automatic warranty registration and management
- **Resale Value**: Verified authenticity increases secondary market value

### For Retailers
- **Inventory Verification**: Confirm authentic products in supply chain
- **Customer Confidence**: Offer guaranteed authentic products
- **Fraud Prevention**: Eliminate unknowing sale of counterfeit goods
- **Premium Positioning**: Differentiate with verified authenticity
- **Insurance Benefits**: Reduced liability for counterfeit-related issues

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Contributions
1. **Fork the Repository**: Create your own copy of the project
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**: Implement your improvements
4. **Test Thoroughly**: Ensure all tests pass
5. **Submit Pull Request**: Describe your changes clearly

### Bug Reports
- Use GitHub Issues to report bugs
- Include reproduction steps and environment details
- Provide screenshots or logs when relevant

### Feature Requests
- Open GitHub Issues for new feature ideas
- Describe the use case and expected behavior
- Consider contributing the implementation

### Documentation
- Improve README documentation
- Add code comments and examples
- Create tutorial content

## 📞 Support

- **Documentation**: Full documentation available in this README
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions
- **Email**: Contact the development team at [your-email@domain.com]

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the Veritas Team**

*Veritas: Where Truth Meets Technology*

Before running the applications, you must deploy the core logic and create the NFT Token Type on the network.
Bash

cd veritas-smart-contracts
npm install
# Execute the script to deploy the contract and mint the initial token supply
npm run deploy:setup

🤝 Contribution

We welcome contributions! Please see our CONTRIBUTING.md for guidelines on submitting pull requests and reporting issues.

📝 License

This project is licensed under the  GNU GENERAL PUBLIC LICENSE. See the LICENSE file for details.
