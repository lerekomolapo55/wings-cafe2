import React from 'react';

const LowStockAlert = ({ products }) => {
  return (
    <div className="low-stock-alert">
      <h3>Low Stock Alert</h3>
      <p>The following products are running low on stock:</p>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.name} - Only {product.quantity} left
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LowStockAlert;