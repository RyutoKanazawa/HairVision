import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import '../styles/MyPage.css';

export const MyPage = () => {
  const { auth } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        console.log('Debug: Fetching profile with token:', token);

        const response = await axios.get(
          `http://localhost:5004/profile/user/${auth.userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProfile({
          firstName: response.data.first_name,
          lastName: response.data.last_name,
          email: response.data.email,
          phoneNumber: response.data.phone_number,
        });
      } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
        setMessage('Failed to fetch profile. Please try again later.');
      }
    };

    if (auth?.userId) {
      fetchProfile();
    }
  }, [auth]);

  const handleSave = async () => {
    try {
      const token = auth.token || localStorage.getItem('token');
      const updatedProfile = {
        first_name: profile.firstName.trim(),
        last_name: profile.lastName.trim(),
        email: profile.email.trim(),
        phone_number: profile.phoneNumber.trim(),
      };

      console.log('Debug: Sending updated profile data:', updatedProfile);

      const response = await axios.put(
        'http://localhost:5004/profile/user/update',
        updatedProfile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Debug: API response:', response.data);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Debug: API response error status:', err.response?.status);
      console.error('Debug: API response error data:', err.response?.data);
      setMessage('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="my-page-container">
      <h1>Profile</h1>
      {message && <p className="message">{message}</p>}
      <div className="profile-section">
        {isEditing ? (
          <div className="profile-card">
            <input
              type="text"
              placeholder="First Name"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
            />
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        ) : (
          <div className="profile-card">
            <p>First Name: {profile.firstName}</p>
            <p>Last Name: {profile.lastName}</p>
            <p>Email: {profile.email}</p>
            <p>Phone Number: {profile.phoneNumber}</p>
            <button onClick={() => setIsEditing(true)}>Edit</button>
          </div>
        )}
      </div>
    </div>
  );
};