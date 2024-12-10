import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/HairSalon.css';

export const HairSalon = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // サロンデータを取得
  useEffect(() => {
    const fetchSalons = async () => {
      try {
        console.log("Fetching salon data...");
        const response = await axios.get('http://localhost:5004/salons');
        console.log('Debug: Fetched salons:', response.data);
        setSalons(response.data);
      } catch (err) {
        console.error('Error fetching salons:', err.message);
        setError('Unable to fetch salon data');
      } finally {
        setLoading(false);
      }
    };

    fetchSalons();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="hair-salon">
      <h1>Hair Salons</h1>
      <div className="salon-grid">
        {salons.length > 0 ? (
          salons.map((salon) => (
            <div key={salon.id} className="salon-card">
              {/* リンクに salon.id を渡す */}
              <Link to={`/salon/${salon.id}`}>
                <img
                  src={salon.image_url || '/default-salon.jpg'}
                  alt={salon.name}
                  className="salon-image"
                />
                <h2>{salon.name}</h2>
                <p>{salon.city}, {salon.state}</p>
              </Link>
            </div>
          ))
        ) : (
          <p>No salons available.</p>
        )}
      </div>
    </div>
  );
};