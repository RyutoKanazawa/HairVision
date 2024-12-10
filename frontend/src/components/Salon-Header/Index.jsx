import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

export const SalonHeader = ({ onLogout }) => {
  return (
    <header className="salon-header">
      {/* Top Bar */}
      <div className="salon-top-bar">
        <div className="salon-logo">
          <h1>
            <Link to="/salon/menu">HairVision Salon</Link>
          </h1>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="salon-nav-bar">
        <Link to="/salon/reservations">Reservations</Link>
        <Link to="/salon/menu">Menu</Link>
        <Link to="/salon/profile">Profile</Link>
        <button className="salon-logout-button" onClick={onLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
};