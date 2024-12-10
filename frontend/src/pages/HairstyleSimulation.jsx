import React from 'react';
import { Link } from 'react-router-dom'; // Linkをインポート
import '../styles/HairstyleSimulation.css';

export const HairstyleSimulation = () => {
    return (
        <div className="hairstyle-simulation">
            <h2>Hairstyle simulation</h2>
            <div className="description-box">
                <p>
                    Thinking about trying a new hairstyle but curious about how it will look before visiting the salon? 
                    Our AI Hair Simulation lets you easily try out different styles from the comfort of your home. Using your camera, 
                    you can see in real-time how each style suits your face, giving you the confidence to make a change. 
                    If you find a style you love, you can book a salon appointment right away!
                </p>
            </div>
            <Link to="/upload">
                <button className="try-button">Try</button>
            </Link>
        </div>
    );
};