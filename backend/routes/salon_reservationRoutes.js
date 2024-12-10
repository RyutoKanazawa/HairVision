// salon_reservationRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // データベース接続
const authenticateToken = require('../middleware/authenticateToken');

// サロンIDで予約を取得するエンドポイント
router.delete('/salon/reservations/:reservationId', authenticateToken, (req, res) => {
    const reservationId = req.params.reservationId;
    console.log('Cancelling reservation with ID:', reservationId);
  
    const query = 'DELETE FROM reservations WHERE id = ?';
    db.query(query, [reservationId], (err, results) => {
      if (err) {
        console.error('Error cancelling reservation:', err);
        return res.status(500).json({ message: 'Failed to cancel reservation' });
      }
  
      if (results.affectedRows === 0) {
        console.log('No reservation found with ID:', reservationId);
        return res.status(404).json({ message: 'Reservation not found' });
      }
  
      console.log('Reservation cancelled successfully');
      return res.status(200).json({ message: 'Reservation cancelled successfully' });
    });
  });
  
  

// 予約キャンセル (DELETE `/salon/reservations/:reservationId`)
router.delete('/salon/reservations/:reservationId', authenticateToken, (req, res) => {
    const reservationId = req.params.reservationId;
    console.log('Received DELETE request for reservation ID:', reservationId); // リクエスト確認用ログ
  
    const query = 'DELETE FROM reservations WHERE id = ?';
    db.query(query, [reservationId], (err, results) => {
      if (err) {
        console.error('Error cancelling reservation:', err);
        return res.status(500).json({ message: 'Failed to cancel reservation' });
      }
  
      if (results.affectedRows === 0) {
        console.log(`No reservation found with ID: ${reservationId}`);
        return res.status(404).json({ message: 'Reservation not found' });
      }
      console.log(`Reservation with ID ${reservationId} deleted`);
      res.status(200).json({ message: 'Reservation cancelled successfully' });
    });
  });

// 予約確認（施術完了） (POST `/salon/reservations/confirm/:reservationId`)
router.post('/salon/reservations/confirm/:reservationId', authenticateToken, (req, res) => {
    const reservationId = req.params.reservationId;
    console.log('Received POST request to confirm reservation with ID:', reservationId); // リクエストを受け取ったログ
  
    const query = 'UPDATE reservations SET status = "confirmed" WHERE id = ?';
    db.query(query, [reservationId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
  
      if (results.affectedRows === 0) {
        console.log('No reservation found with ID:', reservationId); // ログを追加
        return res.status(404).json({ message: 'Reservation not found' });
      }
  
      console.log('Reservation confirmed successfully'); // 成功のログ
      res.status(200).json({ message: 'Reservation confirmed' });
    });
  });

module.exports = router;