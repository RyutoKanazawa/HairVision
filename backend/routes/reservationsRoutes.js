const express = require('express');
const router = express.Router();
const db = require('../db'); // データベース接続
const authenticateToken = require('../middleware/authenticateToken');

console.log('Debug: Route setup for reservations');

// 特定のサロンの予約を取得 (GET `/salon/:salonId/reservations`)
// 特定のサロンの予約を取得 (GET `/salon/:salonId/reservations`)
router.get('/:salonId/reservations', authenticateToken, (req, res) => {
  const salonId = req.params.salonId; 
  console.log('Debug: Fetching reservations for salon ID:', salonId);

  if (!salonId) {
    return res.status(400).json({ message: 'Salon ID is required' });
  }

  const query = 'SELECT * FROM reservations WHERE salon_id = ?';
  db.query(query, [salonId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      console.warn('No reservations found for salon ID:', salonId);
      return res.status(404).json({ message: 'No reservations found' });
    }

    console.log('Debug: Reservations found:', results);
    res.status(200).json(results);  
  });
});

// 新しい予約を作成 (POST `/api/reservations`)
router.post('/reservations', authenticateToken, async (req, res) => {
  const { salonId, date, time, menu } = req.body;
  const userId = req.user.id;  // トークンからuserIdを取得

  console.log('Debug: Incoming reservation data:', req.body);

  // 必須フィールドの確認
  if (!salonId || !userId || !date || !time || !menu) {
    console.error('Error: Missing required fields for reservation:', req.body);
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = `
    INSERT INTO reservations (salon_id, user_id, date, time, menu)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [salonId, userId, date, time, menu];

  try {
    const [results] = await db.query(query, values);

    // 挿入された行数が1以上の場合
    if (results.affectedRows > 0) {
      console.log('Reservation created successfully');
      return res.status(201).json({
        message: 'Reservation created successfully',
        reservationId: results.insertId,
      });
    } else {
      return res.status(500).json({ message: 'Failed to create reservation' });
    }
  } catch (error) {
    console.error('Error creating reservation:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
