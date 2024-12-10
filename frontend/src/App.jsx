import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header/Index';
import { SalonHeader } from './components/Salon-Header/Index';
import { Footer } from './components/Footer/Index';
import { Home } from './pages/Home';
import { HairstyleSimulation } from './pages/HairstyleSimulation';
import { UploadPage } from './pages/UploadPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { MyPage } from './pages/MyPage';
import { SalonLoginPage } from './pages/SalonLoginPage';
import { SalonSignupPage } from './pages/SalonSignupPage';
import { SalonProfile } from './pages/SalonProfile';
import { HairSalon } from './pages/HairSalon';
import { SalonMenu } from './pages/SalonMenu';
import { SalonReservation } from './pages/SalonReservation'; 
import { SalonDetails } from './pages/SalonDetails';
import { BookingSelection } from './pages/BookingSelection';
import { BookingConfirmation } from './pages/BookingConfirmation';
import { BookingCompleted } from './pages/BookingCompleted';
import 'leaflet/dist/leaflet.css';

export const AuthContext = createContext();

function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isSalon: false,
    user: null,
    salonId: null,
    token: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isSalon = localStorage.getItem('isSalon');
    const salonId = localStorage.getItem('salonId');
    const user = localStorage.getItem('user');

    if (token) {
      setAuth({
        isAuthenticated: true,
        token,
        isSalon: isSalon ? JSON.parse(isSalon) : false,
        user: user && user !== 'undefined' ? JSON.parse(user) : null,
        salonId: salonId ? salonId : null,
      });
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setAuth({ isAuthenticated: false, isSalon: false, user: null, salonId: null, token: null });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth, handleLogout }}>
      <Router>
        {auth.isAuthenticated ? (
          auth.isSalon ? <SalonHeader onLogout={handleLogout} /> : <Header onLogout={handleLogout} />
        ) : (
          <Header />
        )}

        <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hair-salon" element={<HairSalon />} />
          <Route path="/hairstyle-simulation" element={<HairstyleSimulation />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/my-page"
            element={
              auth.isAuthenticated ? <MyPage /> : <Navigate to="/login" />
            }
          />
          <Route path="/salon-login" element={<SalonLoginPage />} />
          <Route path="/salon-signup" element={<SalonSignupPage />} />
          <Route
            path="/salon/profile"
            element={
              auth.isAuthenticated && auth.isSalon ? <SalonProfile /> : <Navigate to="/salon-login" />
            }
          />
          <Route
            path="/salon/menu"
            element={
              auth.isAuthenticated && auth.isSalon ? <SalonMenu /> : <Navigate to="/salon-login" />
            }
          />
          <Route path="/salon/reservations" element={<SalonReservation />} />
          <Route
            path="/salon/:salonId"
            element={<SalonDetails />} // SalonDetailsをルートに追加
          />
          <Route
            path="/salon/:salonId/booking"
            element={<BookingSelection />} // BookingSelectionをルートに追加
          />
          <Route
            path="/salon/:salonId/confirmation"
            element={<BookingConfirmation />}
          />
          <Route path="/booking-completed" element={<BookingCompleted />} />
        </Routes>
        </main>
        <Footer />
      </Router>
    </AuthContext.Provider>
  );
}

export default App;