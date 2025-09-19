// src/App.jsx
import React from 'react';
import useCoins from './hooks/useCoin';
import CoinTable from './components/cointable';
import Highlights from './components/Highlights';

const App = () => {
  const { coins, loading, error } = useCoins();

  return (
    <div className="container mt-5">
      <h1 className="mb-4">🪙 Crypto Dashboard</h1>
      <Highlights />
      {loading && <div className="alert alert-info">Loading data...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && <CoinTable coins={coins} />}
    </div>
  );
};

export default App;
