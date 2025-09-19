import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// Modal component to show coin details
function CoinDetailsModal({ coin, onClose }) {
  // Close on ESC key
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleEsc);
    // Disable background scroll
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!coin) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          padding: 24,
          borderRadius: 8,
          maxWidth: 400,
          width: '90%',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          textAlign: 'center',
        }}
      >
        <h2>{coin.name} ({coin.symbol.toUpperCase()})</h2>
        <img
          src={coin.image}
          alt={coin.name}
          width={80}
          height={80}
          style={{ borderRadius: '50%', margin: '20px 0' }}
        />
        <p><strong>Current Price:</strong> ${coin.current_price.toLocaleString()}</p>
        <p><strong>Market Cap:</strong> ${coin.market_cap.toLocaleString()}</p>
        <p><strong>24h Change:</strong> {coin.price_change_percentage_24h?.toFixed(2)}%</p>
        <p><strong>24h Volume:</strong> ${coin.total_volume.toLocaleString()}</p>
        <button
          onClick={onClose}
          style={{
            marginTop: 20,
            padding: '10px 18px',
            backgroundColor: '#007bff',
            border: 'none',
            borderRadius: 6,
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function CoinTable() {
  const coinsPerPage = 50;
  const totalPages = 20;

  const [coinsData, setCoinsData] = useState({}); // store pages data: { pageNum: [coins] }
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedCoin, setSelectedCoin] = useState(null);

  // Fetch coins from API for a page
  useEffect(() => {
    async function fetchPage(page) {
      if (coinsData[page]) return; // already loaded
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: coinsPerPage,
            page,
            price_change_percentage: '24h',
          },
        });
        setCoinsData((prev) => ({ ...prev, [page]: res.data }));
      } catch (e) {
        setError('Failed to fetch coins. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchPage(currentPage);
  }, [currentPage, coinsData]);

  // Get current page coins or empty
  const currentCoins = coinsData[currentPage] || [];

  // Filter coins by search term
  const filteredCoins = currentCoins.filter((coin) =>
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort coins by selected key and direction
  const sortedCoins = useMemo(() => {
    if (!sortConfig.key) return filteredCoins;

    const sorted = [...filteredCoins].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle null/undefined
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      // If string, compare case-insensitive
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredCoins, sortConfig]);

  // Sorting handler
  function handleSort(key) {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  // Pagination handlers
  function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setSearchTerm('');
    setSortConfig({ key: null, direction: 'asc' });
  }

  function getSortArrow(key) {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  }

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: '40px auto',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: 20 }}>Cryptocurrency Prices</h1>

      {error && (
        <div
          style={{
            color: 'red',
            marginBottom: 12,
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {error}
        </div>
      )}

      <input
        type="search"
        placeholder="Search by name or symbol..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
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
      <div
        style={{
          display: 'flex',
          fontWeight: '700',
          borderBottom: '2px solid #eee',
          paddingBottom: 10,
          userSelect: 'none',
        }}
      >
        <div style={{ flexBasis: 40, textAlign: 'center' }}>#</div>

        <div
          onClick={() => handleSort('name')}
          style={{ flexBasis: 240, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Sort by Name"
        >
          Name&nbsp;{getSortArrow('name')}
        </div>

        <div
          onClick={() => handleSort('current_price')}
          style={{ flexBasis: 130, textAlign: 'right', paddingLeft: 20, cursor: 'pointer' }}
          title="Sort by Price"
        >
          Price&nbsp;{getSortArrow('current_price')}
        </div>

        <div
          onClick={() => handleSort('price_change_percentage_24h')}
          style={{ flexBasis: 110, textAlign: 'right', cursor: 'pointer' }}
          title="Sort by 24h Change"
        >
          24h Change&nbsp;{getSortArrow('price_change_percentage_24h')}
        </div>

        <div
          onClick={() => handleSort('total_volume')}
          style={{ flexBasis: 130, textAlign: 'right', cursor: 'pointer' }}
          title="Sort by 24h Volume"
        >
          24h Volume&nbsp;{getSortArrow('total_volume')}
        </div>

        <div
          onClick={() => handleSort('market_cap')}
          style={{ flexBasis: 150, textAlign: 'right', paddingLeft: 20, cursor: 'pointer' }}
          title="Sort by Market Cap"
        >
          Market Cap&nbsp;{getSortArrow('market_cap')}
        </div>
      </div>

      {/* Table Body */}
      <div
        style={{
          maxHeight: 650,
          overflowY: 'auto',
          marginTop: 10,
        }}
      >
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>
        ) : sortedCoins.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center' }}>No coins found.</div>
        ) : (
          sortedCoins.map((coin, idx) => {
            const isPositive = coin.price_change_percentage_24h >= 0;
            return (
              <div
                key={coin.id}
                onClick={() => setSelectedCoin(coin)}
                title={`Click for details on ${coin.name}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                }}
              >
                <div style={{ flexBasis: 40, textAlign: 'center', fontWeight: 600 }}>
                  {(currentPage - 1) * coinsPerPage + idx + 1}
                </div>

                <div
                  style={{
                    flexBasis: 240,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    textAlign: 'left',
                  }}
                >
                  <img
                    src={coin.image}
                    alt={coin.name}
                    width={30}
                    height={30}
                    style={{ borderRadius: '50%' }}
                    loading="lazy"
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{coin.name}</div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#777',
                        textTransform: 'uppercase',
                      }}
                    >
                      {coin.symbol}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    flexBasis: 130,
                    textAlign: 'right',
                    paddingLeft: 20,
                    fontWeight: 600,
                  }}
                >
                  ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <div
                  style={{
                    flexBasis: 110,
                    textAlign: 'right',
                    color: isPositive ? 'green' : 'red',
                    fontWeight: 600,
                  }}
                >
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </div>

                <div style={{ flexBasis: 130, textAlign: 'right' }}>
                  ${coin.total_volume.toLocaleString()}
                </div>

                <div
                  style={{
                    flexBasis: 150,
                    textAlign: 'right',
                    paddingLeft: 20,
                    fontWeight: 600,
                  }}
                >
                  ${coin.market_cap.toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 6,
        }}
      >
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: '1px solid #ccc',
            backgroundColor: currentPage === 1 ? '#eee' : '#fff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          }}
          aria-label="Previous page"
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            aria-current={page === currentPage ? 'page' : undefined}
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
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: '1px solid #ccc',
            backgroundColor: currentPage === totalPages ? '#eee' : '#fff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          }}
          aria-label="Next page"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {selectedCoin && (
        <CoinDetailsModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />
      )}
    </div>
  );
}
