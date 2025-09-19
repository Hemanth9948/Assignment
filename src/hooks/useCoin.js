// src/hooks/useCoins.js
import { useEffect, useState } from 'react';
import { getMarketData } from '../api/coin';

const useCoins = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const data = await getMarketData();
        setCoins(data);
      } catch (err) {
        setError('Unable to fetch coin data');
      } finally {
        setLoading(false);
      }
    };
    fetchCoins();
  }, []);

  return { coins, loading, error };
};

export default useCoins;
