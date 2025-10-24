const {
  Client,
  PrivateKey,
  AccountId,
  Hbar,
  AccountBalanceQuery
} = require("@hashgraph/sdk");
require("dotenv").config({ path: "../.env" });

/**
 * Initialize Hedera Client
 * Connects to the Hedera network (testnet or mainnet)
 */
async function initializeClient() {
  try {
    console.log("🚀 Initializing Hedera Client...");

    // Retrieve credentials from environment
    const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
    const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);
    const network = process.env.HEDERA_NETWORK || "testnet";

    // Validate credentials
    if (!operatorId || !operatorKey) {
      throw new Error(
        "Missing HEDERA_OPERATOR_ID or HEDERA_OPERATOR_KEY in .env file"
      );
    }

    // Create client for the specified network
    let client;
    if (network === "mainnet") {
      client = Client.forMainnet();
      console.log("📡 Connected to Hedera Mainnet");
    } else {
      client = Client.forTestnet();
      console.log("📡 Connected to Hedera Testnet");
    }

    // Set operator
    client.setOperator(operatorId, operatorKey);

    // Set default transaction fee and query payment
    client.setDefaultMaxTransactionFee(new Hbar(100));
    client.setDefaultMaxQueryPayment(new Hbar(50));

    // Verify connection by checking account balance
    const balance = await getAccountBalance(client, operatorId);
    console.log(`✅ Operator Account Balance: ${balance.toString()}`);

    console.log("✅ Hedera Client initialized successfully");
    return client;
  } catch (error) {
    console.error("❌ Error initializing Hedera client:", error);
    throw error;
  }
}

/**
 * Get account balance
 */
async function getAccountBalance(client, accountId) {
  try {
    const balance = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(client);
    return balance.hbars;
  } catch (error) {
    console.error("Error getting account balance:", error);
    throw error;
  }
}

/**
 * Gracefully close the client connection
 */
async function closeClient(client) {
  if (client) {
    await client.close();
    console.log("🔒 Hedera Client connection closed");
  }
}

module.exports = {
  initializeClient,
  closeClient,
  getAccountBalance
};

// Run initialization test if executed directly
if (require.main === module) {
  (async () => {
    let client;
    try {
      client = await initializeClient();
      console.log("\n🎉 Initialization test completed successfully!");
    } catch (error) {
      console.error("\n❌ Initialization test failed:", error.message);
      process.exit(1);
    } finally {
      if (client) {
        await closeClient(client);
      }
    }
  })();
}
