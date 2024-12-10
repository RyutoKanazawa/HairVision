import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // React Routerのナビゲート機能
import '../styles/SignupPage.css';

export const SignupPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // 電話番号用の状態追加
  const navigate = useNavigate(); // ナビゲーション用のフック

  const handleSubmit = async (e) => {
    e.preventDefault();  // フォームのデフォルト動作をキャンセル
    // フォームデータをコンソールに出力して確認
    console.log("Form data:", { firstName, lastName, email, password, phoneNumber });
  
    try {
      // バックエンドにPOSTリクエストを送信
      const response = await axios.post('http://localhost:5004/auth/signup', { 
        firstName, 
        lastName, 
        email, 
        password,
        phoneNumber,  // 電話番号も送信
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Signup successful:', response.data);
      alert('Signup successful! Please log in.');
      navigate('/login');  // サインアップ後にログイン画面に遷移
    } catch (error) {
      console.error('Error during signup:', error.response?.data || error.message);
      alert(error.response?.data || 'Signup failed');  // エラーメッセージを表示
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-form">
        <h2>Sign up</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}  // 名前の入力を更新
              required
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}  // 姓の入力を更新
              required
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}  // メールアドレスの入力を更新
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}  // パスワードの入力を更新
              required
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}  // 電話番号の入力を更新
              required
            />
          </div>
          <button type="submit" className="signup-button">
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
};