// JWT認証ミドルウェア
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']; // Authorizationヘッダーを取得
  const token = authHeader && authHeader.split(' ')[1]; // Bearerトークン形式からトークン部分を抽出

  console.log('Authorization Header:', authHeader); // デバッグ用
  console.log('Extracted Token:', token); // 抽出したトークンをログ出力

  if (!token) {
    console.error('No token provided'); // エラー原因を特定するためのログ
    return res.status(401).json({ message: 'Access Denied: No token provided' }); // 401エラーを返却
  }

  jwt.verify(token, process.env.JWT_SECRET || 'FYP2_hairvision_project', (err, user) => {
    if (err) {
      // トークンのエラーハンドリング
      if (err.name === 'TokenExpiredError') {
        console.error('Token expired:', err.message);
        return res.status(403).json({ message: 'Token expired' });
      }
      if (err.name === 'JsonWebTokenError') {
        console.error('Malformed token:', err.message);
        return res.status(403).json({ message: 'Malformed token' });
      }
      console.error('Token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }

    // トークンが有効であればユーザー情報を req.user に設定
    console.log('Decoded User:', user); 
    req.user = user; 
    next(); // 次のミドルウェアへ
  });
};

module.exports = authenticateToken;