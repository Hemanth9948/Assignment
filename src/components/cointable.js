import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CoinRow from './CoinRow';

const BASE_URL = 'https://api.coingecko.com/api/v3';

const CoinTable = () => {
  const coinsPerPage = 50;
  const [coinsData, setCoinsData] = useState({}); // object: pageNumber → array of coins
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  

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

      // Ensure data is an array
      if (!Array.isArray(data)) {
        throw new Error('Unexpected response: data is not array');
      }

      setCoinsData((prev) => ({
        ...prev,
        [pageNumber]: data,
      }));

      // If this is first page, optionally set totalCoins if known
      // CoinGecko doesn’t return total count, so this can be null or estimate
      // Maybe leave totalPages open or limit to some max

      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching coins page:', err);
      setError('Failed to load coins');
      setIsLoading(false);
    }
  };

  // When currentPage changes, fetch if not already
  useEffect(() => {
    if (!coinsData[currentPage]) {
      fetchCoinsPage(currentPage);
    }
  }, [currentPage, coinsData]);

  // Current coins array or empty array
  const currentCoins = coinsData[currentPage] || [];
  
  // Decide totalPages or at least show next for some pages
  const totalPages = 20; // you can set based on limit or just some max

  const handlePageClick = (pageNumber) => {
    if (pageNumber < 1) return;
    // optionally check upper bound
    setCurrentPage(pageNumber);
  };

  return (
    <div className="mt-4">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Price</th>
              <th>24h Change</th>
              <th>24h Volume</th>
              <th>Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              currentCoins.map((coin, index) => (
                <CoinRow
                  key={coin?.id || index}
                  coin={coin}
                  index={(currentPage - 1) * coinsPerPage + index + 1}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <nav className="mt-3">
        <ul className="pagination justify-content-center flex-wrap">
          <li
            className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
          >
            <button
              className="page-link"
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <li
              key={page}
              className={`page-item ${currentPage === page ? 'active' : ''}`}
            >
              <button
                className="page-link"
                onClick={() => handlePageClick(page)}
              >
                {page}
              </button>
            </li>
          ))}
          <li
            className={`page-item ${
              currentPage === totalPages ? 'disabled' : ''
            }`}
          >
            <button
              className="page-link"
              onClick={() => handlePageClick(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default CoinTable;
