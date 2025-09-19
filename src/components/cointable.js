import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CoinDetailsModal = ({ coin, onClose }) => {
  if (!coin) return null;
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1050,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 8,
          width: 320,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          userSelect: 'none',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h5>{coin.name} ({coin.symbol.toUpperCase()})</h5>
        <img src={coin.image} alt={coin.name} style={{ width: 50, height: 50 }} />
        <p>Current Price: ${coin.current_price.toLocaleString()}</p>
        <p>Market Cap: ${coin.market_cap.toLocaleString()}</p>
        <p>24h Change: {coin.price_change_percentage_24h?.toFixed(2)}%</p>
        <p>24h Volume: ${coin.total_volume.toLocaleString()}</p>
        <button onClick={onClose} style={{ marginTop: 10 }}>Close</button>
      </div>
    </div>
  );
};

const BASE_URL = 'https://api.coingecko.com/api/v3';

const CoinTable = () => {
  const coinsPerPage = 50;
  const [coinsData, setCoinsData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedCoin, setSelectedCoin] = useState(null);

  const fetchCoinsPage = async (pageNumber) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: coinsPerPage,
          page: pageNumber,
          price_change_percentage: '24h',
        },
      });
      const data = response.data;
      if (!Array.isArray(data)) throw new Error('Invalid response');

      setCoinsData(prev => ({
        ...prev,
        [pageNumber]: data,
      }));
      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to load coins');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!coinsData[currentPage]) fetchCoinsPage(currentPage);
  }, [currentPage, coinsData]);

  const currentCoins = coinsData[currentPage] || [];

  const filteredCoins = currentCoins.filter(coin => {
    const term = searchTerm.toLowerCase();
    return coin.name.toLowerCase().includes(term) || coin.symbol.toLowerCase().includes(term);
  });

  const sortedCoins = React.useMemo(() => {
    if (!sortConfig.key) return filteredCoins;

    return [...filteredCoins].sort((a, b) => {
      let aVal = a[sortConfig.key] ?? '';
      let bVal = b[sortConfig.key] ?? '';

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCoins, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const totalPages = 20;

  const handlePageClick = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setSearchTerm('');
    setSortConfig({ key: null, direction: 'asc' });
  };

  const getSortArrow = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: 20, backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 6px 15px rgba(0,0,0,0.1)' }}>
      {error && <div style={{ marginBottom: 12, color: 'red' }}>{error}</div>}

      <input
        type="text"
        placeholder="Search by name or symbol..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: 10,
          marginBottom: 20,
          borderRadius: 8,
          border: '1px solid #ccc',
          fontSize: 16,
        }}
      />

      {/* Table Header */}
      <div style={{ display: 'flex', fontWeight: '600', borderBottom: '2px solid #eee', paddingBottom: 10, userSelect: 'none' }}>
        <div style={{ flexBasis: 40, textAlign: 'center' }}>#</div>
        <div
          onClick={() => requestSort('name')}
          style={{ flexBasis: 240, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          Name&nbsp;{getSortArrow('name')}
        </div>
        <div
          onClick={() => requestSort('current_price')}
          style={{ flexBasis: 130, textAlign: 'right', paddingLeft: 20, cursor: 'pointer' }}
        >
          Price&nbsp;{getSortArrow('current_price')}
        </div>
        <div
          onClick={() => requestSort('price_change_percentage_24h')}
          style={{ flexBasis: 110, textAlign: 'right', cursor: 'pointer' }}
        >
          24h Change&nbsp;{getSortArrow('price_change_percentage_24h')}
        </div>
        <div
          onClick={() => requestSort('total_volume')}
          style={{ flexBasis: 130, textAlign: 'right', cursor: 'pointer' }}
        >
          24h Volume&nbsp;{getSortArrow('total_volume')}
        </div>
        <div
          onClick={() => requestSort('market_cap')}
          style={{ flexBasis: 150, textAlign: 'right', paddingLeft: 20, cursor: 'pointer' }}
        >
          Market Cap&nbsp;{getSortArrow('market_cap')}
        </div>
      </div>

      {/* Table Body */}
      <div style={{ maxHeight: 650, overflowY: 'auto', marginTop: 10 }}>
        {isLoading ? (
          <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>
        ) : sortedCoins.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center' }}>No coins found.</div>
        ) : (
          sortedCoins.map((coin, index) => {
            const isPositive = coin.price_change_percentage_24h >= 0;
            return (
              <div
                key={coin.id}
                onClick={() => setSelectedCoin(coin)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                }}
                title={`Click to view details for ${coin.name}`}
              >
                <div style={{ flexBasis: 40, textAlign: 'center', fontWeight: 600 }}>
                  {(currentPage - 1) * coinsPerPage + index + 1}
                </div>

                <div style={{ flexBasis: 240, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                  <img src={coin.image} alt={coin.name} width={30} height={30} style={{ borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{coin.name}</div>
                    <div style={{ fontSize: 12, color: '#777', textTransform: 'uppercase' }}>{coin.symbol}</div>
                  </div>
                </div>

                <div style={{ flexBasis: 130, textAlign: 'right', paddingLeft: 20, fontWeight: 600 }}>
                  ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <div style={{ flexBasis: 110, textAlign: 'right', color: isPositive ? 'green' : 'red', fontWeight: 600 }}>
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </div>

                <div style={{ flexBasis: 130, textAlign: 'right' }}>
                  ${coin.total_volume.toLocaleString()}
                </div>

                <div style={{ flexBasis: 150, textAlign: 'right', paddingLeft: 20, fontWeight: 600 }}>
                  ${coin.market_cap.toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 6 }}>
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: '1px solid #ccc',
            backgroundColor: currentPage === 1 ? '#eee' : '#fff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: page === currentPage ? '2px solid #007bff' : '1px solid #ccc',
              backgroundColor: page === currentPage ? '#cce5ff' : '#fff',
              cursor: 'pointer',
              minWidth: 35,
            }}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: '1px solid #ccc',
            backgroundColor: currentPage === totalPages ? '#eee' : '#fff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          }}
        >
          Next
        </button>
      </div>

      {selectedCoin && <CoinDetailsModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />}
    </div>
  );
};

export default CoinTable;
