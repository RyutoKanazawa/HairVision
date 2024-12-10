import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../App";
import "../styles/SalonProfile.css";

export const SalonProfile = () => {
  const { auth } = useContext(AuthContext);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    address_1: '',
    address_2: '',
    state: '',
    city: '',
    postcode: '',
    openingHours: {
      monday: { start: '', end: '' },
      tuesday: { start: '', end: '' },
      wednesday: { start: '', end: '' },
      thursday: { start: '', end: '' },
      friday: { start: '', end: '' },
      saturday: { start: '', end: '' },
      sunday: { start: '', end: '' },
    },
    salonImage: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = auth.token || localStorage.getItem('token');
        if (!token) {
          console.error('Token is missing');
          return;
        }

        const response = await axios.get('http://localhost:5004/salon/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(response.data);
        // サロンIDをlocalStorageに保存
        localStorage.setItem('salonId', response.data.id);
        console.log('Saved salonId to localStorage:', response.data.id);  
      } catch (err) {
        console.error('Error fetching profile:', err.response?.data || err.message);
      }
    };

    fetchProfile();
  }, [auth]);

  const handleSave = async () => {
    try {
      const token = auth.token || localStorage.getItem('token');
      const updatedProfile = { ...profile, openingHours: profile.openingHours };

      await axios.put('http://localhost:5004/salon/profile', updatedProfile, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      alert('Profile updated successfully');
    } catch (err) {
      console.error('Error saving profile:', err.response?.data || err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const token = auth?.token || localStorage.getItem('token');
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('salonImage', file);

    try {
      const response = await axios.post('http://localhost:5004/salon/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile((prevProfile) => ({
        ...prevProfile,
        salonImage: response.data.imageUrl,
      }));
    } catch (error) {
      console.error('Image upload failed:', error.response?.data || error.message);
    }
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      openingHours: {
        ...prevProfile.openingHours,
        [day]: {
          ...prevProfile.openingHours[day],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="salon-profile">
      <h1>Salon Profile</h1>

      <div className="profile-section">
        <h2>Salon Name</h2>
        <input
          type="text"
          placeholder="Enter Salon Name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
      </div>

      <div className="profile-section image-container">
        <h2>Salon Image</h2>
        <input type="file" onChange={handleImageUpload} />
        {profile.salonImage && (
          <div className="image-preview">
            <img src={profile.salonImage} alt="Salon" className="salon-image" />
          </div>
        )}
      </div>

      <div className="profile-section">
        <h2>Email</h2>
        <input
          type="email"
          placeholder="Enter Email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        />
      </div>

      <div className="profile-section opening-hours-section">
        <h2>Opening Hours</h2>
        {Object.keys(profile.openingHours).map((day) => (
          <div key={day} className="opening-hours-row">
            <label>{day.charAt(0).toUpperCase() + day.slice(1)}:</label>
            <input
              type="time"
              value={profile.openingHours[day]?.start || ''}
              onChange={(e) => handleOpeningHoursChange(day, 'start', e.target.value)}
            />
            <span> - </span>
            <input
              type="time"
              value={profile.openingHours[day]?.end || ''}
              onChange={(e) => handleOpeningHoursChange(day, 'end', e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="profile-section">
        <h2>Location</h2>
        <input
          type="text"
          placeholder="Address Line 1"
          value={profile.address_1}
          onChange={(e) => setProfile({ ...profile, address_1: e.target.value })}
        />
        <input
          type="text"
          placeholder="Address Line 2"
          value={profile.address_2}
          onChange={(e) => setProfile({ ...profile, address_2: e.target.value })}
        />
        <input
          type="text"
          placeholder="City"
          value={profile.city}
          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
        />
        <input
          type="text"
          placeholder="State"
          value={profile.state}
          onChange={(e) => setProfile({ ...profile, state: e.target.value })}
        />
        <input
          type="text"
          placeholder="Postcode"
          value={profile.postcode}
          onChange={(e) => setProfile({ ...profile, postcode: e.target.value })}
        />
      </div>

      <button className="save-button" onClick={handleSave}>
        Save
      </button>
    </div>
  );
};