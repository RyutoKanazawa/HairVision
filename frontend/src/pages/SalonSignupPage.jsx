import React, { useState } from 'react';  // useStateをReactからインポート
import { useNavigate } from 'react-router-dom';
import '../styles/SalonSignupPage.css';
import axios from 'axios';  // axiosをインポート

export const SalonSignupPage = () => {
  const [salonName, setSalonName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:5004/salon/signup', {
        salonName,
        email,
        password,
      });
      console.log('Signup successful:', response.data);
      alert('Signup successful!');
      navigate('/salon-login'); // ログインページへリダイレクト
    } catch (error) {
      console.error('Error during signup:', error.response?.data || error.message);
      alert(error.response?.data || 'Signup failed');
    }
  };

  return (
    <div className="salon-signup-page">
      <div className="salon-signup-form">
        <h2>Sign up</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Salon name:
            <input
              type="text"
              placeholder="Enter name"
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="signup-button">
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
};