import React, { useEffect, useState } from 'react';
import { getTrendingCoins, getMarketData } from '../api/coin';

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

  useEffect(() => {
    async function fetchData() {
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
    }

    fetchData();
  }, []);

  const getVisibleItems = (list, showAll, initialCount) =>
    showAll ? list : list.slice(0, initialCount);

  // New reusable coin card that includes price and 24h change
  const renderCoinCard = (coin) => {
    // coin can be from trending or marketData format — handle accordingly
    // trending coins have structure: { item: { id, name, symbol, thumb, ... } }
    // others have id, name, symbol, image, current_price, price_change_percentage_24h
    // We'll normalize data for trending coins first.

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
        className="col-12 d-flex align-items-center mb-3"
        key={id}
        style={{ gap: '0.75rem' }}
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
          </div>

          {/* Top Gainers */}
          <div className="col-12 col-md-3">
            <div className="p-3 border rounded shadow-sm h-100 bg-light d-flex flex-column">
              <h5 className="mb-3 text-center">📈 Top Gainers</h5>
              <div className="flex-grow-1">
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
          </div>

          {/* Top Losers */}
          <div className="col-12 col-md-3">
            <div className="p-3 border rounded shadow-sm h-100 bg-light d-flex flex-column">
              <h5 className="mb-3 text-center">📉 Top Losers</h5>
              <div className="flex-grow-1">
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
          </div>

          {/* Highest Volume */}
          <div className="col-12 col-md-3">
            <div className="p-3 border rounded shadow-sm h-100 bg-light d-flex flex-column">
              <h5 className="mb-3 text-center">💰 Highest Volume</h5>
              <div className="flex-grow-1">
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
        </div>
      </div>
    </div>
  );
};

export default Highlights;
