import React, { useEffect, useState } from 'react';
import { getTrendingCoins, getMarketData } from '../api/coin';

const CoinDetailsModal = ({ coin, onClose }) => {
  if (!coin) return null;

  const {
    id,
    name,
    symbol,
    image,
    current_price,
    price_change_percentage_24h,
    market_cap,
    total_volume,
  } = coin.item
    ? {
        id: coin.item.id,
        name: coin.item.name,
        symbol: coin.item.symbol,
        image: coin.item.large || coin.item.thumb,
        current_price: coin.item.current_price || 0,
        price_change_percentage_24h: coin.item.price_change_percentage_24h || 0,
        market_cap: coin.item.market_cap || 0,
        total_volume: coin.item.total_volume || 0,
      }
    : coin;

  const isPositive = price_change_percentage_24h >= 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1050,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: 24,
          borderRadius: 8,
          width: 320,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          userSelect: 'none',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h5 style={{ marginBottom: 12 }}>
          {name} ({symbol.toUpperCase()})
        </h5>
        <img
          src={image}
          alt={name}
          style={{ width: 50, height: 50, borderRadius: '50%', marginBottom: 12 }}
        />
        <p>
          <strong>Current Price:</strong>{' '}
          ${current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p>
          <strong>Market Cap:</strong> ${market_cap.toLocaleString()}
        </p>
        <p>
          <strong>24h Change:</strong>{' '}
          <span style={{ color: isPositive ? 'green' : 'red' }}>
            {price_change_percentage_24h?.toFixed(2)}%
          </span>
        </p>
        <p>
          <strong>24h Volume:</strong> ${total_volume.toLocaleString()}
        </p>
        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Close
        </button>
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

  // Selected coin for modal
  const [selectedCoin, setSelectedCoin] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const [trendingData, marketData] = await Promise.all([getTrendingCoins(), getMarketData()]);

      setTrending(trendingData);

      const sortedByChangeDesc = [...marketData].sort(
        (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
      );
      setTopGainers(sortedByChangeDesc);

      const sortedByChangeAsc = [...marketData].sort(
        (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
      );
      setTopLosers(sortedByChangeAsc);

      const sortedByVolume = [...marketData].sort((a, b) => b.total_volume - a.total_volume);
      setHighestVolume(sortedByVolume);
    }

    fetchData();
  }, []);

  const getVisibleItems = (list, showAll, initialCount) => (showAll ? list : list.slice(0, initialCount));

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
        <img src={image} alt={name} width="32" height="32" style={{ borderRadius: '50%' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="fw-semibold" style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

  return (
    <div className="container mb-5">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-4 text-center">📊 Highlights</h3>

        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          {/* Trending Coins */}
          <div
            style={{
              flex: '1 1 220px',
              backgroundColor: 'white',
              padding: 16,
              borderRadius: 8,
              boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h5 className="mb-3 text-center">🔥 Trending Coins</h5>
            <div style={{ flexGrow: 1 }}>
              {getVisibleItems(trending, showAllTrending, 5).map(renderCoinCard)}
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

          {/* Top Gainers */}
          <div
            style={{
              flex: '1 1 220px',
              backgroundColor: 'white',
              padding: 16,
              borderRadius: 8,
              boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h5 className="mb-3 text-center">📈 Top Gainers</h5>
            <div style={{ flexGrow: 1 }}>
              {getVisibleItems(topGainers, showAllGainers, 5).map(renderCoinCard)}
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

          {/* Top Losers */}
          <div
            style={{
              flex: '1 1 220px',
              backgroundColor: 'white',
              padding: 16,
              borderRadius: 8,
              boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h5 className="mb-3 text-center">📉 Top Losers</h5>
            <div style={{ flexGrow: 1 }}>
              {getVisibleItems(topLosers, showAllLosers, 5).map(renderCoinCard)}
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

          {/* Highest Volume */}
          <div
            style={{
              flex: '1 1 220px',
              backgroundColor: 'white',
              padding: 16,
              borderRadius: 8,
              boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h5 className="mb-3 text-center">💰 Highest Volume</h5>
            <div style={{ flexGrow: 1 }}>
              {getVisibleItems(highestVolume, showAllVolume, 5).map(renderCoinCard)}
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

        {/* Modal for coin details */}
        <CoinDetailsModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />
      </div>
    </div>
  );
};

export default Highlights;
