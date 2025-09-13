import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import StockManagement from './components/StockManagement';
import Sales from './components/Sales';
import Reporting from './components/Reporting';
import './App.css';

// Footer Component
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2025 Wings Cafe Inventory System. All rights reserved.</p>
      </div>
    </footer>
  );
};

function App() {
  return (
      <div className="App">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/stock" element={<StockManagement />} />
            <Route path="/sales" element={<Sales/>}/>
            <Route path="/reporting" element={<Reporting />} />
            <Route path="/Dashboard" element={<Dashboard/>}/>
          </Routes>
        </div>
        <Footer />
      </div>
  );
}

export default App;
