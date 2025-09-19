// src/api/coingecko.js
import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export const getMarketData = async () => {
  const response = await axios.get(`${BASE_URL}/coins/markets`, {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 50,
      page: 1,
      price_change_percentage: '24h',
    },
  });
  return response.data;
};

export const getTrendingCoins = async () => {
  const response = await axios.get(`${BASE_URL}/search/trending`);
  return response.data.coins;
};
