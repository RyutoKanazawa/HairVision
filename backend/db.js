const mysql = require('mysql2/promise');  // MySQLのpromise対応版

// プールの作成
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Your password',
  database: process.env.DB_NAME || 'Your db_name',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 非同期で接続確認を行う関数
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL');
    connection.release();  // コネクションのリリース
  } catch (err) {
    console.error('Database connection failed: ', err);
  }
}

// 初期接続確認
testConnection();

// プールをエクスポート
module.exports = pool;