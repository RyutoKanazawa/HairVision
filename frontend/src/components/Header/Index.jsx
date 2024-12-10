import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import './style.css';
import { AuthContext } from '../../App';

export const Header = () => {
  const { auth, handleLogout } = useContext(AuthContext);

  return (
    <header className="header">
      <div className="top-bar">
        <div className="logo">
          <NavLink to="/">
            <h1>HairVision</h1>
          </NavLink>
        </div>
        <div className="auth-links">
          {auth.isAuthenticated ? (
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink> / <NavLink to="/signup">Sign up</NavLink>
            </>
          )}
        </div>
      </div>
      <nav className="bottom-bar">
        <NavLink
          to="/hair-salon"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Hair salon
        </NavLink>
        <NavLink
          to="/hairstyle-simulation"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Hairstyle simulation
        </NavLink>
        {auth.isAuthenticated && (
          <NavLink
            to="/my-page"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            My page
          </NavLink>
        )}
      </nav>
    </header>
  );
};