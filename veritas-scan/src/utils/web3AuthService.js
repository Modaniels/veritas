/**
 * Simplified Web3Auth service with mock login
 * For production, integrate real Web3Auth SDK
 */

let mockUser = null;

/**
 * Login with mock authentication
 */
export async function loginWithWeb3Auth() {
  try {
    console.log("🔐 Logging in (mock mode)...");
    
    // Simulate async login
    await new Promise(resolve => setTimeout(resolve, 500));
    
    mockUser = {
      accountId: `0.0.${Math.floor(Math.random() * 1000000)}`,
      email: "customer@example.com",
      name: "Test Customer",
      isMock: true
    };

    console.log("✅ Mock login successful:", mockUser);
    return mockUser;

  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

/**
 * Logout
 */
export async function logoutFromWeb3Auth() {
  try {
    mockUser = null;
    console.log("✅ Logged out successfully");
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
}
