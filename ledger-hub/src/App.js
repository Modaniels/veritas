import React from 'react';
import './App.css';
import MintProduct from './components/MintProduct';

function App() {
  return (
    <div className="App">
      {/* Animated Background Elements */}
      <div className="circuit-pattern"></div>
      <div className="tech-elements">
        <div className="tech-element">⚡</div>
        <div className="tech-element">🔗</div>
        <div className="tech-element">🏭</div>
        <div className="tech-element">🔒</div>
        <div className="tech-element">💎</div>
        <div className="tech-element">🌐</div>
      </div>
      <div className="blockchain-nodes">
        <div className="blockchain-node"></div>
        <div className="blockchain-node"></div>
        <div className="blockchain-node"></div>
        <div className="blockchain-node"></div>
        <div className="connection-line"></div>
        <div className="connection-line"></div>
        <div className="connection-line"></div>
      </div>
      
      <header className="App-header">
        <h1>🏭 Veritas Ledger Hub</h1>
        <p>Manufacturer Portal - Product Authentication System</p>
      </header>
      <main className="App-main">
        <MintProduct />
      </main>
    </div>
  );
}

export default App;
