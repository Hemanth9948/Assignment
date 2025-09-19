import React, { useEffect, useState } from 'react';
import { getTrendingCoins, getMarketData } from '../api/coin';

// Modal component for coin details
const CoinDetailsModal = ({ coin, onClose }) => {
  if (!coin) return null;

  // Normalize coin data for trending or marketData formats
  const {
    name,
    symbol,
    image,
    current_price,
    price_change_percentage_24h,
    market_cap,
    total_volume,
  } = coin.item
    ? {
        name: coin.item.name,
        symbol: coin.item.symbol,
        image: coin.item.large || coin.item.thumb,
        current_price: coin.item.current_price || 0,
        price_change_percentage_24h: coin.item.price_change_percentage_24h || 0,
        market_cap: coin.item.market_cap || 0,
        total_volume: coin.item.total_volume || 0,
      }
    : {
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume,
      };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1050,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 8,
          width: 320,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          userSelect: 'none',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h5>{name} ({symbol.toUpperCase()})</h5>
        <img src={image} alt={name} style={{ width: 50, height: 50 }} />
        <p><strong>Current Price:</strong> ${current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p><strong>Market Cap:</strong> ${market_cap.toLocaleString()}</p>
        <p><strong>24h Change:</strong> {price_change_percentage_24h?.toFixed(2)}%</p>
        <p><strong>24h Volume:</strong> ${total_volume.toLocaleString()}</p>
        <button onClick={onClose} style={{ marginTop: 10 }}>Close</button>
      </div>
    </div>
  );
};

const Highlights = () => {
  const [trending, setTrending] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [highestVolume, setHighestVolume] = useState([]);

  // Show more states
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [showAllGainers, setShowAllGainers] = useState(false);
  const [showAllLosers, setShowAllLosers] = useState(false);
  const [showAllVolume, setShowAllVolume] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected coin for modal
  const [selectedCoin, setSelectedCoin] = useState(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [trendingData, marketData] = await Promise.all([
        getTrendingCoins(),
        getMarketData(),
      ]);

      setTrending(trendingData);

      const sortedByChange = [...marketData].sort(
        (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
      );
      setTopGainers(sortedByChange);

      const sortedByChangeAsc = [...sortedByChange].slice().reverse();
      setTopLosers(sortedByChangeAsc);

      const sortedByVolume = [...marketData].sort(
        (a, b) => b.total_volume - a.total_volume
      );
      setHighestVolume(sortedByVolume);
    } catch (err) {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const getVisibleItems = (list, showAll, initialCount) =>
    showAll ? list : list.slice(0, initialCount);

  const renderCoinCard = (coin) => {
    const {
      id,
      name,
      symbol,
      image,
      current_price,
      price_change_percentage_24h,
    } = coin.item
      ? {
          id: coin.item.id,
          name: coin.item.name,
          symbol: coin.item.symbol,
          image: coin.item.thumb,
          current_price: coin.item.current_price || 0,
          price_change_percentage_24h: coin.item.price_change_percentage_24h || 0,
        }
      : coin;

    const isPositive = price_change_percentage_24h >= 0;

    return (
      <div
        className="d-flex align-items-center mb-3"
        key={id}
        style={{ gap: '0.75rem', cursor: 'pointer' }}
        onClick={() => setSelectedCoin(coin)}
        title={`Click to view details for ${name}`}
      >
        <img src={image} alt={name} width="32" height="32" />
        <div style={{ flex: 1 }}>
          <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
            {name.length > 15 ? name.slice(0, 15) + '…' : name}
          </div>
          <div className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>
            {symbol}
          </div>
        </div>
        <div style={{ width: '90px', textAlign: 'right', fontWeight: '600' }}>
          ${current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div
          style={{
            width: '70px',
            textAlign: 'right',
            color: isPositive ? 'green' : 'red',
            fontWeight: '600',
            fontSize: '0.9rem',
          }}
        >
          {price_change_percentage_24h?.toFixed(2)}%
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-5">
        <p className="text-danger">{error}</p>
        <button className="btn btn-primary" onClick={fetchData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mb-5">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-4 text-center">📊 Highlights</h3>

        <div className="row gy-4">
          {/* Trending Coins */}
          <div className="col-12 col-md-3">
            <div className="p-3 border rounded shadow-sm h-100 bg-light d-flex flex-column">
              <h5 className="mb-3 text-center">🔥 Trending Coins</h5>
              <div className="flex-grow-1">
                {trending.length === 0 ? (
                  <p className="text-center text-muted">No trending coins available.</p>
                ) : (
                  getVisibleItems(trending, showAllTrending, 5).map(renderCoinCard)
                )}
              </div>
              {trending.length > 5 && (
                <div className="text-center mt-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setShowAllTrending((prev) => !prev)}
                  >
                    {showAllTrending ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Top Gainers */}
          <div className="col-12 col-md-3">
            <div className="p-3 border rounded shadow-sm h-100 bg-light d-flex flex-column">
              <h5 className="mb-3 text-center">📈 Top Gainers</h5>
              <div className="flex-grow-1">
                {topGainers.length === 0 ? (
                  <p className="text-center text-muted">No top gainers available.</p>
                ) : (
                  getVisibleItems(topGainers, showAllGainers, 5).map(renderCoinCard)
                )}
              </div>
              {topGainers.length > 5 && (
                <div className="text-center mt-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setShowAllGainers((prev) => !prev)}
                  >
                    {showAllGainers ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Top Losers */}
          <div className="col-12 col-md-3">
            <div className="p-3 border rounded shadow-sm h-100 bg-light d-flex flex-column">
              <h5 className="mb-3 text-center">📉 Top Losers</h5>
              <div className="flex-grow-1">
                {topLosers.length === 0 ? (
                  <p className="text-center text-muted">No top losers available.</p>
                ) : (
                  getVisibleItems(topLosers, showAllLosers, 5).map(renderCoinCard)
                )}
              </div>
              {topLosers.length > 5 && (
                <div className="text-center mt-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setShowAllLosers((prev) => !prev)}
                  >
                    {showAllLosers ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Highest Volume */}
          <div className="col-12 col-md-3">
            <div className="p-3 border rounded shadow-sm h-100 bg-light d-flex flex-column">
              <h5 className="mb-3 text-center">💰 Highest Volume</h5>
              <div className="flex-grow-1">
                {highestVolume.length === 0 ? (
                  <p className="text-center text-muted">No high volume coins available.</p>
                ) : (
                  getVisibleItems(highestVolume, showAllVolume, 5).map(renderCoinCard)
                )}
              </div>
              {highestVolume.length > 5 && (
                <div className="text-center mt-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setShowAllVolume((prev) => !prev)}
                  >
                    {showAllVolume ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Coin Details Modal */}
      {selectedCoin && (
        <CoinDetailsModal
          coin={selectedCoin}
          onClose={() => setSelectedCoin(null)}
        />
      )}
    </div>
  );
};

export default Highlights;
