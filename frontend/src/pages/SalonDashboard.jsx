import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const SalonDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No token found. Please log in.');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5004/salon/reservations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReservations(response.data);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError(err.response?.data || 'Failed to fetch reservations');
      }
    };

    fetchReservations();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Salon Reservations</h1>
      <ul>
        {reservations.map((reservation) => (
          <li key={reservation.id}>
            {reservation.customer_name} - {reservation.date}
          </li>
        ))}
      </ul>
    </div>
  );
};