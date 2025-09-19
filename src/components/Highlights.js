import React, { useEffect, useState } from 'react';
import { getTrendingCoins, getMarketData } from '../api/coin';

const Highlights = () => {
  const [trending, setTrending] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [showAllTrending, setShowAllTrending] = useState(false);

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

      setTopGainers(sortedByChange.slice(0, 5));
      setTopLosers(sortedByChange.slice(-5).reverse());
    }

    fetchData();
  }, []);

  const visibleTrending = showAllTrending ? trending : trending.slice(0, 5);

  // Reusable compact coin card
  const renderCoinCard = ({ id, name, symbol, image }) => (
    <div
      className="col-4 col-sm-3 col-md-4 col-lg-3 col-xl-4 mb-3 d-flex justify-content-center"
      key={id}
    >
      <div
        className="text-center p-2 border rounded shadow-sm bg-white"
        style={{ width: '90px', height: '90px' }}
      >
        <img src={image} alt={name} width="32" height="32" className="mb-1" />
        <div className="fw-semibold" style={{ fontSize: '0.75rem' }}>
          {name.length > 10 ? name.slice(0, 10) + '…' : name}
        </div>
        <div className="text-muted text-uppercase" style={{ fontSize: '0.65rem' }}>
          {symbol}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mb-5">
      {/* ✅ Highlights section container with shadow */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-4 text-center">📊 Highlights</h3>

        <div className="row gy-4">
          {/* 🔥 Trending Coins */}
          <div className="col-12 col-md-4">
            <div className="p-3 border rounded shadow-sm h-100 bg-light">
              <h5 className="mb-3 text-center">🔥 Trending Coins</h5>
              <div className="row">
                {visibleTrending.map(({ item }) =>
                  renderCoinCard({
                    id: item.id,
                    name: item.name,
                    symbol: item.symbol,
                    image: item.thumb,
                  })
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

          {/* 📈 Top Gainers */}
          <div className="col-12 col-md-4">
            <div className="p-3 border rounded shadow-sm h-100 bg-light">
              <h5 className="mb-3 text-center">📈 Top Gainers</h5>
              <div className="row">
                {topGainers.map((coin) =>
                  renderCoinCard({
                    id: coin.id,
                    name: coin.name,
                    symbol: coin.symbol,
                    image: coin.image,
                  })
                )}
              </div>
            </div>
          </div>

          {/* 📉 Top Losers */}
          <div className="col-12 col-md-4">
            <div className="p-3 border rounded shadow-sm h-100 bg-light">
              <h5 className="mb-3 text-center">📉 Top Losers</h5>
              <div className="row">
                {topLosers.map((coin) =>
                  renderCoinCard({
                    id: coin.id,
                    name: coin.name,
                    symbol: coin.symbol,
                    image: coin.image,
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Highlights;
