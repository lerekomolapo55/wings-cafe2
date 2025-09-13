import React, { useState, useEffect } from 'react';
import LowStockAlert from './LowStockAlert';


const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch products
      const productsResponse = await fetch('http://localhost:5000/api/products');
      const productsData = await productsResponse.json();
      
      // Fetch sales
      const salesResponse = await fetch('http://localhost:5000/api/sales');
      const salesData = await salesResponse.json();
      
      setProducts(productsData);
      setSales(salesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Calculate total products
  const totalProducts = products.length;
  
  // Calculate low stock items (quantity less than 10)
  const lowStockItems = products.filter(product => product.quantity < 10);
  

  // Calculate today's sales
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(sale => sale.date === today)
    .reduce((total, sale) => {
      const saleTotal = typeof sale.total === 'number' ? sale.total : parseFloat(sale.total || 0);
      return total + saleTotal;
    }, 0);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {lowStockItems.length > 0 && <LowStockAlert products={lowStockItems} />}
      
      <div className="dashboard-cards">
        <div className="card">
          <h3>Total Products</h3>
          <p className="stat">{totalProducts}</p>
        </div>
        
        <div className="card">
          <h3>Low Stock Items</h3>
          <p className="stat">{lowStockItems.length}</p>
        </div>
        
        <div className="card">
          <h3>Today's Sales</h3>
          <p className="stat">M{todaySales.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="recent-products">
        <h2>Recent Products</h2>
        {products.length > 0 ? (
          <div className="products-grid">
            {products.slice(0, 19).map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="product-image"
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-category">{product.category}</p>
                  <div className="stock-stats">
                    <div className="stat-item">
                      <span className="label">Stock:</span>
                      <span className={`value ${product.quantity < 10 ? 'low-stock' : ''}`}>
                        {product.quantity}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Price:</span>
                      <span className="value">M{typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Value:</span>
                      <span className="value">M{((typeof product.price === 'number' ? product.price : 0) * product.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No products available. Add some products to get started.</p>
        )}
      </div>
      
    </div>
  );
};

export default Dashboard;