import React, { useState, useEffect } from 'react';

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct || !quantity || quantity <= 0) {
      alert('Please select a product and enter a valid quantity');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5001/api/stock/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct,
          adjustmentType,
          quantity: parseInt(quantity)
        }),
      });
      
      if (response.ok) {
        alert('Stock adjusted successfully!');
        fetchProducts(); // Refresh the product list
        setSelectedProduct('');
        setQuantity('');
      } else {
        alert('Failed to adjust stock');
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('Error adjusting stock. Please try again.');
    }
  };

  return (
    <div className="stock-management">
      <h1>Stock Management</h1>
      
      <div className="stock-adjustment">
        <h2>Adjust Stock Levels</h2>
        <form onSubmit={handleStockAdjustment}>
          <div className="form-group">
            <label>Select Product:</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              required
            >
              <option value="">Select a product</option>
              {products && products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} (Current: {product.quantity})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Adjustment Type:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="add"
                  checked={adjustmentType === 'add'}
                  onChange={() => setAdjustmentType('add')}
                />
                Add Stock
              </label>
              <label>
                <input
                  type="radio"
                  value="deduct"
                  checked={adjustmentType === 'deduct'}
                  onChange={() => setAdjustmentType('deduct')}
                />
                Deduct Stock
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label>Quantity:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          
          <button type="submit">Apply Adjustment</button>
        </form>
      </div>
      
      <div className="stock-overview">
        <h2>Current Stock Levels</h2>
        {products && products.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.quantity}</td>
                  <td>
                    {product.quantity === 0 ? (
                      <span className="out-of-stock">Out of Stock</span>
                    ) : product.quantity < 10 ? (
                      <span className="low-stock">Low Stock</span>
                    ) : (
                      <span className="in-stock">In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No products available. Add some products to manage stock.</p>
        )}
      </div>
    </div>
  );
};

export default StockManagement;