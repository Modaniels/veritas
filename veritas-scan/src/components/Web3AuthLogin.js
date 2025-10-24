import React, { useState } from 'react';
import { loginWithWeb3Auth, logoutFromWeb3Auth } from '../utils/web3AuthService';
import './Web3AuthLogin.css';

/**
 * Web3AuthLogin Component
 * Handles user authentication via Web3Auth
 */
function Web3AuthLogin({ user, setUser }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = await loginWithWeb3Auth();
      setUser(userData);
      console.log("✅ User logged in:", userData);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutFromWeb3Auth();
      setUser(null);
      console.log("✅ User logged out");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="auth-card">
        <div className="user-info">
          <div className="user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
          </div>
          <div className="user-details">
            <h3>{user.name || 'User'}</h3>
            <p>{user.email}</p>
            <code>{user.accountId}</code>
            {user.isMock && <span className="mock-badge">Mock Mode</span>}
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="logout-button"
          disabled={loading}
        >
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h2>🔐 Login to Verify Products</h2>
      <p className="auth-description">
        Connect your wallet to verify product authenticity and claim ownership
      </p>
      
      {error && (
        <div className="error-message">
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      <button 
        onClick={handleLogin} 
        className="login-button"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Connecting...
          </>
        ) : (
          <>
            🔑 Login with Web3Auth
          </>
        )}
      </button>

      <p className="auth-note">
        Web3Auth provides secure, passwordless authentication using social logins
      </p>
    </div>
  );
}

export default Web3AuthLogin;
