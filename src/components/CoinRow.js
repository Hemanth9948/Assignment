// src/components/CoinRow.jsx
import React from 'react';

const CoinRow = ({ coin, index }) => {
  const isPositive = coin.price_change_percentage_24h >= 0;

  return (
    <tr>
      <td>{index + 1}</td>
      <td>
        <img src={coin.image} alt={coin.name} width="20" className="me-2" />
        {coin.name} ({coin.symbol.toUpperCase()})
      </td>
      <td>${coin.current_price.toLocaleString()}</td>
      <td className={isPositive ? 'text-success' : 'text-danger'}>
        {coin.price_change_percentage_24h?.toFixed(2)}%
      </td>
      <td>${coin.total_volume.toLocaleString()}</td>
      <td>${coin.market_cap.toLocaleString()}</td>
    </tr>
  );
};

export default CoinRow;
