import React from 'react';
import './App.css';
import MintProduct from './components/MintProduct';

function App() {
  return (
    <div className="App">
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
