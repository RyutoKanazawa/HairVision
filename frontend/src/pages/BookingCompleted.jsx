import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BookingCompleted.css'; // スタイルをインポート

export const BookingCompleted = () => {
  const navigate = useNavigate();

  return (
    <div className="booking-completed-container">
      <h1>Booking Completed!</h1>
      <p>Your booking has been successfully completed.</p>
      <button onClick={() => navigate('/')}>Go to Home</button>
    </div>
  );
};