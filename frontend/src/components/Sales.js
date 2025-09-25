import React, { useState, useEffect } from 'react';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [sellQuantities, setSellQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch products
      const productsResponse = await fetch('http://localhost:5001/api/products');
      if (!productsResponse.ok) throw new Error('Failed to fetch products');
      const productsData = await productsResponse.json();
      setProducts(productsData);

      // Fetch sales (though we don't use the sales data in this component)
      const salesResponse = await fetch('http://localhost:5001/api/sales');
      if (!salesResponse.ok) throw new Error('Failed to fetch sales');
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSellChange = (id, value) => {
    setSellQuantities(prev => ({ ...prev, [id]: Number(value) }));
  };

  const handleBulkSale = async () => {
    // Filter out products with valid quantities to sell
    const productsToSell = Object.entries(sellQuantities)
      .filter(([id, quantity]) => quantity > 0)
      .map(([id, quantity]) => {
        const product = products.find(p => p.id === id);
        return { product, quantity };
      });

    if (productsToSell.length === 0) {
      setError('Please enter quantities for at least one product');
      return;
    }

    // Validate stock for all products first
    for (const { product, quantity } of productsToSell) {
      if (!product) {
        setError('Product not found');
        return;
      }

      if (product.quantity < quantity) {
        setError(`Insufficient stock for ${product.name}. Only ${product.quantity} available.`);
        return;
      }
    }

    try {
      let successfulSales = 0;
      let totalRevenue = 0;

      // Process each sale
      for (const { product, quantity } of productsToSell) {
        const total = product.price * quantity;

        const response = await fetch('http://localhost:5001/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            quantity: quantity,
            total: total
          }),
        });

        if (response.ok) {
          successfulSales++;
          totalRevenue += total;
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to record sale for ${product.name}`);
        }
      }

      // Update product quantities locally
      setProducts(prevProducts => 
        prevProducts.map(product => {
          const quantitySold = sellQuantities[product.id] || 0;
          if (quantitySold > 0) {
            return { ...product, quantity: product.quantity - quantitySold };
          }
          return product;
        })
      );

      // Reset quantity inputs
      setSellQuantities({});
      setError('');

      alert(`Successfully sold ${successfulSales} product(s)! Total Revenue: M${totalRevenue.toFixed(2)}`);
    } catch (err) {
      console.error('Error recording sales:', err);
      setError('Error recording sales: ' + err.message);
    }
  };

  // Calculate total revenue from selected quantities
  const calculateTotalRevenue = () => {
    return Object.entries(sellQuantities).reduce((total, [id, quantity]) => {
      if (quantity > 0) {
        const product = products.find(p => p.id === id);
        if (product) {
          return total + (product.price * quantity);
        }
      }
      return total;
    }, 0);
  };

  const hasProductsToSell = Object.values(sellQuantities).some(quantity => quantity > 0);
  const totalRevenue = calculateTotalRevenue();

  if (loading) return <div className="loading">Loading sales data...</div>;

  return (
    <div className="sales">
      <h1>Sales Management</h1>

      {/* Sales Form - Inventory Style */}
      <div className="inventory-sales">
        <h2>Sell Products</h2>
        {error && <div className="error-message">{error}</div>}
        
        <table>
          <thead>
            <tr>
              <th>Picture</th>
              <th>Name</th>
              <th>Stock</th>
              <th>Price (M)</th>
              <th>Sell Qty</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className={product.quantity < 10 ? 'low-stock-row' : ''}>
                <td>
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="product-image-small"
                    />
                  ) : (
                    <div className="no-image-small">No Image</div>
                  )}
                </td>
                <td>{product.name}</td>
                <td className={product.quantity < 10 ? 'low-stock' : ''}>
                  {product.quantity}
                </td>
                <td>M{product.price.toFixed(2)}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max={product.quantity}
                    value={sellQuantities[product.id] || ''}
                    onChange={e => handleSellChange(product.id, e.target.value)}
                    disabled={product.quantity === 0}
                    className="quantity-input"
                    placeholder="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bulk Sell Button with Total Display */}
        <div className="bulk-sell-container">
          <div className="total-revenue-display">
            <strong>Total: M{totalRevenue.toFixed(2)}</strong>
          </div>
          <button
            onClick={handleBulkSale}
            disabled={!hasProductsToSell}
            className="bulk-sell-btn"
          >
            Sell Selected Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sales;