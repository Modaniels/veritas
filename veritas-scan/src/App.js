import React, { useState } from 'react';
import './App.css';
import VerifyProduct from './components/VerifyProduct';
import Web3AuthLogin from './components/Web3AuthLogin';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔍 Veritas Scan</h1>
        <p>Product Authentication & Ownership Transfer</p>
      </header>
      <main className="App-main">
        <Web3AuthLogin user={user} setUser={setUser} />
        {user && <VerifyProduct user={user} />}
      </main>
    </div>
  );
}

export default App;
