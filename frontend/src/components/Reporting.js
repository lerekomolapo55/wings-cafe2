import React, { useState, useEffect } from 'react';


const Reporting = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch products
      const productsResponse = await fetch('http://localhost:5001/api/products');
      const productsData = await productsResponse.json();
      
      // Fetch sales
      const salesResponse = await fetch('http://localhost:5001/api/sales');
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
    return <div className="loading">Loading reports...</div>;
  }

  // Calculate initial stock for each product (current stock + total sold)
  const productsWithSalesData = products.map(product => {
    const productSales = sales.filter(sale => sale.productId === product.id);
    const totalSold = productSales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
    const initialStock = product.quantity + totalSold;
    const totalSalesValue = productSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    
    // Calculate profit for this product
    const totalProfit = productSales.reduce((total, sale) => {
      const costPerUnit = (product.price || 0) * 0.7;
      const saleProfit = (sale.total || 0) - (costPerUnit * (sale.quantity || 0));
      return total + saleProfit;
    }, 0);
    
    return {
      ...product,
      initialStock,
      totalSold,
      totalSalesValue,
      totalProfit
    };
  });

  // Calculate summary data from sales report table
  const totalSalesValue = productsWithSalesData.reduce((total, product) => total + product.totalSalesValue, 0);
  const totalSalesCount = sales.length; // Count total number of sales transactions
  const totalProductsSold = productsWithSalesData.filter(product => product.totalSold > 0).length; // Count unique products sold
  const totalProductsCount = products.length;
  const totalProfit = productsWithSalesData.reduce((total, product) => total + product.totalProfit, 0);

  // Get low stock products
  const lowStockProducts = products
    .filter(p => p.quantity < 10)
    .sort((a, b) => a.quantity - b.quantity);

  return (
    <div className="reporting">
      <h1>Sales & Inventory Reports</h1>
      
      {/* Summary Cards - Data fetched from sales report table */}
      <div className="report-cards">
        <div className="card">
          <h3>Total Sales Value</h3>
          <p className="stat">M{totalSalesValue.toFixed(2)}</p>
        </div>
        
        <div className="card">
          <h3>Total Sales Count</h3>
          <p className="stat">{totalSalesCount}</p>
        </div>
        
        <div className="card">
          <h3>Products Sold</h3>
          <p className="stat">{totalProductsSold} / {totalProductsCount}</p>
        </div>
        
        <div className="card">
          <h3>Total Profit</h3>
          <p className="stat">M{totalProfit.toFixed(2)}</p>
        </div>
      </div>

      {/* Sales Report Table - Main data source */}
      <div className="report-section">
        <h2>Sales Report</h2>
        <table className="sales-report-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Initial Stock</th>
              <th>Current Stock</th>
              <th>Sold</th>
              <th>Total Sales (M)</th>
              <th>Profit (M)</th>
            </tr>
          </thead>
          <tbody>
            {productsWithSalesData.map(product => (
              <tr key={product.id} className={product.quantity < 10 ? 'low-stock-row' : ''}>
                <td>
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="product-image-table"
                    />
                  ) : (
                    <div className="no-image-table">No Image</div>
                  )}
                </td>
                <td>{product.name}</td>
                <td>{product.initialStock}</td>
                <td className={product.quantity < 10 ? 'low-stock' : ''}>
                  {product.quantity}
                </td>
                <td>{product.totalSold}</td>
                <td>M{product.totalSalesValue.toFixed(2)}</td>
                <td className={product.totalProfit >= 0 ? 'profit-positive' : 'profit-negative'}>
                  M{product.totalProfit.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2"><strong>Total</strong></td>
              <td><strong>{productsWithSalesData.reduce((sum, p) => sum + p.initialStock, 0)}</strong></td>
              <td><strong>{productsWithSalesData.reduce((sum, p) => sum + p.quantity, 0)}</strong></td>
              <td><strong>{totalSalesCount}</strong></td>
              <td><strong>M{totalSalesValue.toFixed(2)}</strong></td>
              <td className={totalProfit >= 0 ? 'profit-positive' : 'profit-negative'}>
                <strong>M{totalProfit.toFixed(2)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Table 4: Low Stock Alert */}
      <div className="report-section">
        <h2>Low Stock Alert</h2>
        {lowStockProducts.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Unit Price (M)</th>
                <th>Status</th>
                <th>Action Needed</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map(product => (
                <tr key={product.id} className={product.quantity === 0 ? 'out-of-stock' : 'low-stock-row'}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.quantity}</td>
                  <td>M{typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}</td>
                  <td className="low-stock">
                    {product.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                  </td>
                  <td>
                    {product.quantity === 0 ? 'URGENT: Restock immediately' :
                     product.quantity < 3 ? 'Restock soon' :
                     'Monitor closely'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>All products have sufficient stock.</p>
        )}
      </div>
    </div>
  );
};

export default Reporting;