import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import '../styles/LoginPage.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // フォームのデフォルト送信動作を防止
    console.log('Form submitted with email:', email, 'password:', password); // フォーム送信デバッグログ
    setError(null); // エラー状態をリセット
  
    // バリデーション
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
  
    try {
      console.log('Sending request to server with:', { email, password }); // サーバー送信デバッグログ
      const response = await axios.post('http://localhost:5004/auth/login', { email, password }); // サーバーにリクエストを送信
      console.log('Server response:', response.data); // サーバーからの応答をログに出力
  
      // サーバー応答のデータを取得
      const { token, user } = response.data;
  
      if (!user) {
        setError('User data is missing.');
        return;
      }
  
      // ローカルストレージにトークンとユーザー情報を保存
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', user.id);
  
      // 認証情報を状態として保存
      setAuth({ token, isAuthenticated: true, user, userId: user.id });
      navigate('/my-page'); // 成功時にマイページへリダイレクト
    } catch (err) {
      console.error('Error:', err.response?.data || err.message); // エラー詳細をログ出力
      setError('Invalid email or password.'); // エラーメッセージを状態にセット
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>User Login</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
    </div>
  );
};