import React from 'react';
import './style.css';

export const Footer = () => {
    return (
        <footer className="footer">
        <div className="footer-content">
            <h1>HairVision</h1>
            <div className="business-links">
            <a href="/salon-login">Login</a> / <a href="/salon-signup">Sign up (For business)</a>
            </div>
        </div>
        </footer>
    );
};

