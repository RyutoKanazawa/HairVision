import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styles/SalonReservation.css";

export const SalonReservation = () => {
  const { salonId } = useParams();  // URLパラメータからサロンIDを取得
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);

  // 予約リストを取得する関数
  const fetchReservations = async () => {
    const salonIdFromLocalStorage = localStorage.getItem("salonId");  // localStorageからsalonIdを取得

    const validSalonId = salonId || salonIdFromLocalStorage;

    if (!validSalonId) {
      setError('Salon ID is required.');
      console.log('Salon ID is missing.');
      return;
    }

    console.log('Fetching reservations for salon ID:', validSalonId);  // salonIdの値をログに表示

    try {
      const token = localStorage.getItem('token'); // localStorageからトークンを取得
      console.log('Authorization Header:', token);
      if (!token) {
        setError("No token provided");
        console.log("No token provided");
        return;
      }

      // APIリクエストを送信
      const response = await axios.get(
        `http://localhost:5004/salon/reservations/${validSalonId}`,
        {
          headers: { Authorization: `Bearer ${token}` }  // トークンをヘッダーに追加
        }
      );
      console.log("Reservations data:", response.data);  // 取得した予約データをログに表示

      setReservations(response.data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      if (err.response) {
        console.error("Response error:", err.response.data);  // サーバーからのエラーメッセージを表示
      }
      setError("Failed to fetch reservations.");
    }
  };

  useEffect(() => {
    fetchReservations();  // 初回レンダリング時に予約リストを取得
  }, [salonId]);  // salonIdが変更されるたびに再取得

  // 予約キャンセル
  const handleCancelReservation = async (reservationId) => {
    try {
      console.log(`Cancelling reservation with ID: ${reservationId}`);
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5004/salon/reservations/${reservationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Reservation cancelled successfully.');
  
      // 状態をAPIから再取得
      await fetchReservations();
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      setError('Failed to cancel reservation.');
    }
  };

  // 予約確認（施術完了）
  const handleConfirmReservation = async (reservationId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Authorization Header:', `Bearer ${token}`); // トークンを確認
  
      const response = await axios.post(
        `http://localhost:5004/salon/reservations/confirm/${reservationId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      console.log("Reservation confirmed:", response.data);
    } catch (err) {
      console.error("Error confirming reservation:", err);
      if (err.response) {
        console.error("Response error:", err.response.data); // サーバーからのエラーメッセージを表示
      }
    }
  };

  // エラーがあった場合にエラーメッセージを表示
  if (error) {
    return <div>{error}</div>;
  }

  // 予約がない場合にメッセージを表示
  if (reservations.length === 0) {
    return <div>No reservations found for this salon.</div>;
  }

  // 予約のリストを表示
  return (
    <div className="salon-reservation">
      <h1>Salon Reservations</h1>
      <div className="reservation-list">
        {reservations.map((reservation, index) => (
          <div className="reservation-item" key={reservation.id}>
            <div className="reservation-client">
              <p>Client {index + 1}</p>
            </div>
            <div className="reservation-details">
              <p>Date: {reservation.date}</p>
              <p>Time: {reservation.time}</p>
              <p>Menu: {reservation.menu}</p>
            </div>
            {/* キャンセルボタン */}
            <button
              onClick={() => handleCancelReservation(reservation.id)}
              className="cancel-button"
            >
              Cancel
            </button>
            {/* 確認ボタン */}
            <button
              onClick={() => handleConfirmReservation(reservation.id)}
              className="confirm-button"
            >
              Confirm
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};