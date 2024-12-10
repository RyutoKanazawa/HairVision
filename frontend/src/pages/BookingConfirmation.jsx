import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import '../styles/BookingConfirmation.css';

export const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // デフォルト値を設定
  const {
    selectedDate = 'Not Selected',
    selectedTime = 'Not Selected',
    selectedMenu = 'Not Selected',
    salonName = 'Not Selected',
    salonId = '',
  } = state || {};

  const { auth } = useContext(AuthContext);

  const handleConfirm = async () => {
    try {
      // トークンを取得
      const token = auth?.token || localStorage.getItem('token');
      
      // トークンが存在しない場合のエラー処理
      if (!token) {
        console.error('Authorization Header: Bearer null');
        alert('User is not authenticated. Please log in again.');
        navigate('/login'); // ログインページにリダイレクト
        return;
      }
  
      console.log('Authorization Header: Bearer', token);
  
      // 予約データ
      const userId = localStorage.getItem('userId'); // localStorageからuserIdを取得
      if (!userId) {
        console.error('User ID is missing');
        alert('User is not authenticated. Please log in again.');
        navigate('/login');
        return;
      }
  
      // サーバーに送る予約詳細
      console.log('Booking details:', {
        salonId,
        userId,
        date: selectedDate,
        time: selectedTime,
        menu: selectedMenu,
      });
  
      // APIリクエスト
      const response = await axios.post(
        'http://localhost:5004/api/reservations',
        { salonId, userId, date: selectedDate, time: selectedTime, menu: selectedMenu },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Response from server:", response.data);
      
      if (response.status === 201) {
        console.log('Redirecting to booking-completed...');
        navigate('/booking-completed'); // 201を確認したら完了ページにリダイレクト
      } else {
        alert('Failed to confirm booking');
      }
  
    }catch (error) {
      console.error('Error confirming booking:', error);
      if (error.response) {
        console.log('Detailed error info:', error.response.data);
        alert(error.response.data.message || 'Failed to confirm booking');
      } else {
        alert('Failed to confirm booking. Please try again.');
      }
    }
  };

  return (
    <div className="booking-confirmation">
      <h1>Confirm Your Booking</h1>
      <div className="booking-details">
        <p><span>Salon Name:</span> {salonName}</p>
        <p><span>Date:</span> {selectedDate}</p>
        <p><span>Time:</span> {selectedTime}</p>
        <p><span>Menu:</span> {selectedMenu}</p>
      </div>
      <div className="action-buttons">
        <button className="confirm-button" onClick={handleConfirm}>Confirm</button>
        <button className="back-button" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
};