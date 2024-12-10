import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import '../styles/SalonDetails.css';

export const SalonDetails = () => {
  const { salonId } = useParams();
  const navigate = useNavigate();
  const [salonDetails, setSalonDetails] = useState(null);
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('menu'); // デフォルトタブを「メニュー」に設定

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  const center = {
    lat: salonDetails?.latitude || 3.08055,
    lng: salonDetails?.longitude || 101.73299,
  };

  useEffect(() => {
    const fetchSalonDetails = async () => {
      try {
        // サロン情報取得
        const response = await axios.get(`http://localhost:5004/salon/${salonId}`);
        setSalonDetails(response.data);
    
        // メニュー取得
        const menuResponse = await axios.get(`http://localhost:5004/salon/${salonId}/menu`); // サロンIDが含まれているURL
        setMenu(menuResponse.data);
      } catch (err) {
        console.error('Error fetching salon details or menu:', err.message);
        setError('Unable to fetch salon details or menu.');
      }
    };

    fetchSalonDetails();
  }, [salonId]);

  const handleBooking = (menuItem) => {
    navigate(`/salon/${salonId}/booking`, { state: { menuItem, salonName: salonDetails.name } });
  };

  if (error) return <div>{error}</div>;
  if (!salonDetails) return <div>Loading...</div>;

  return (
    <div className="salon-details">
      <h1 className="salon-title">{salonDetails.name}</h1>
      <div className="salon-image-container">
        <img
          src={salonDetails.image_url}
          alt={salonDetails.name}
          className="salon-image"
        />
      </div>

      {/* タブヘッダー */}
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          Menu
        </button>
        <button
          className={`tab-button ${activeTab === 'openingTime' ? 'active' : ''}`}
          onClick={() => setActiveTab('openingTime')}
        >
          Opening Time
        </button>
        <button
          className={`tab-button ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab('location')}
        >
          Location
        </button>
      </div>

      {/* タブコンテンツ */}
      <div className="tab-content">
        {activeTab === 'menu' && (
          <div className="menu">
            <h2>Menu</h2>
            {menu.length > 0 ? (
              <ul>
                {menu.map((item) => (
                  <li key={item.id} className="menu-item">
                    <div className="menu-item-info">
                      <span className="menu-name">{item.name} ({item.duration} hours):</span>
                      <span className="menu-price">RM {item.price}</span>
                    </div>
                    <button className="book-button" onClick={() => handleBooking(item)}>
                      Book
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No menu items available.</p>
            )}
          </div>
        )}
        {activeTab === 'openingTime' && (
          <div className="opening-time">
            <h2>Opening Time</h2>
            <ul>
              {Object.entries(salonDetails.opening_hours || {}).map(([day, hours]) => (
                <li key={day}>
                  <span className="day">{day.charAt(0).toUpperCase() + day.slice(1)}:</span>{' '}
                  <span className="time">{hours.start || '-'} - {hours.end || '-'}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {activeTab === 'location' && (
          <div className="location">
            <h2>Location</h2>
            <p>
              {salonDetails.address_1}, {salonDetails.address_2}, {salonDetails.city},{' '}
              {salonDetails.state}, {salonDetails.postcode}
            </p>
            <LoadScript googleMapsApiKey="AIzaSyAknwWcffh4LoRgvQHiPZFCJ3063P2WN9w">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={15}
              >
                <Marker position={center} />
              </GoogleMap>
            </LoadScript>
          </div>
        )}
      </div>
    </div>
  );
};
