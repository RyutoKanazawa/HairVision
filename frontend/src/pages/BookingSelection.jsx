import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';

export const BookingSelection = () => {
  const { salonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { menuItem, salonName } = location.state || {};
  const { auth, setAuth } = useContext(AuthContext);

  useEffect(() => {
    if (!menuItem) {
      console.error('No menu item selected.');
      navigate(`/salon/${salonId}`);
    }
  }, [menuItem, navigate, salonId]);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');

  const now = new Date();

  useEffect(() => {
    console.log('Debug: Fetching reservations...');
    const fetchReservations = async () => {
      try {
        const token = auth?.token || localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const response = await axios.get(
          `http://localhost:5004/api/${salonId}/reservations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setReservations(response.data);
        console.log('Debug: Reservations fetched:', response.data);
      } catch (err) {
        console.error('Error fetching reservations:', err.message);
        if (err.response?.status === 403 || err.response?.status === 401) {
          alert('Your session has expired. Please log in again.');
          setAuth({
            isAuthenticated: false,
            token: null,
          });
          localStorage.removeItem('token');
          navigate('/login', { state: { from: location.pathname } });
        }
      }
    };

    fetchReservations();
  }, [auth, salonId, setAuth, navigate, location]);

  useEffect(() => {
    if (selectedDate) {
      const times = [];
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          times.push(time);
        }
      }
      setAvailableTimes(times);
      console.log('Debug: Available times:', times);
    }
  }, [selectedDate]);

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select a valid date and time.');
      return;
    }
    console.log('Debug: Navigate state:', {
      selectedDate,
      selectedTime,
      selectedMenu: menuItem.name,
      salonName,
      salonId,
    });
    navigate(`/salon/${salonId}/confirmation`, {
      state: {
        selectedDate,
        selectedTime,
        selectedMenu: menuItem.name,
        salonName,
        salonId,
      },
    });
  };

  return (
    <div>
      <h1>Booking for: {menuItem?.name}</h1>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        min={now.toISOString().split('T')[0]}
      />
      <ul>
        {availableTimes.map((time) => (
          <li key={time}>
            <button
              onClick={() => {
                setSelectedTime(time);
                console.log('Debug: Time selected:', time);
              }}
            >
              {time}
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleConfirm}>Confirm</button>
    </div>
  );
};