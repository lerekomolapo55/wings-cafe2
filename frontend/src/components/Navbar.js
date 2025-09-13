import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="nav-brand">
          <h2>Wings Cafe </h2>
        </div>
        <ul className="nav-links">
          <li className={location.pathname === '/' ? 'active' : ''}>
            <Link to="/">Dashboard</Link>
          </li>
          <li className={location.pathname === '/products' ? 'active' : ''}>
            <Link to="/products">Products</Link>
          </li>
          <li className={location.pathname === '/stock' ? 'active' : ''}>
            <Link to="/stock">Stock</Link>
          </li>
          <li className={location.pathname === '/sales' ? 'active' : ''}>
            <Link to="/sales">Sales</Link>
          </li>
          <li className={location.pathname === '/reporting' ? 'active' : ''}>
            <Link to="/reporting">Reporting</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;