import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import '../styles/SalonLoginPage.css';

export const SalonLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5004/salon/login', {
        email: email,
        password: password,
      });

      const { token, salon } = response.data;

      // Save token and salon data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('salon', JSON.stringify(salon));
      localStorage.setItem('salonId', salon.id);

      // Update auth state
      setAuth({
        isAuthenticated: true,
        token,
        user: { id: salon.id },
        isSalon: true,
        salonId: salon.id,
      });

      // Navigate to salon profile page
      navigate('/salon/profile');
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.message ||
        'Invalid credentials. Please check your email and password.'
      );
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Salon Login</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="input-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">
          Login
        </button>
        <p className="register-link">
          Don't have a salon account? 
          <a href="/salon-signup"> Register here</a>
        </p>
      </form>
    </div>
  );
};