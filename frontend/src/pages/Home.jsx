import React from 'react';
import EventIcon from '@mui/icons-material/Event'; // カレンダーアイコン
import Person3Icon from '@mui/icons-material/Person3'; // AIアイコン
import '../styles/Home.css'; // 修正したCSSをインポート

export const Home = () => {
    return (
        <div className="home">
        {/* 背景画像 */}
        <div className="home-header">
            <img src={require('../images/home.jpg')} alt="Home Background" className="home-background" />
        </div>

        <h2>Benefits for customers</h2>
        <div className="benefits">
            {/* カレンダーアイコン */}
            <div className="benefit">
            <EventIcon className="icon" />
            <div className="benefit-box">
                <p>Make online reservations anytime, anywhere! Select your desired service and instantly check availability.</p>
            </div>
            </div>

            {/* AIアイコン */}
            <div className="benefit">
            <Person3Icon className="icon" />
            <div className="benefit-box">
                <p>Check out your ideal hairstyle using AI! Find the perfect hairstyle that suits you.</p>
            </div>
            </div>
        </div>
        </div>
    );
};

