const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// 環境変数にデフォルト値を設定
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'FYP2_hairvision_project';

// サインアップ
router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    try {
        // データベースにサンプルクエリを実行して確認
        const [testResults] = await db.query('SELECT 1 + 1 AS solution');
        console.log('Test query successful:', testResults); // 結果をログに出力

        // ユーザー登録の処理
        const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (results.length > 0) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // パスワードのハッシュ化とデータベースへの挿入処理
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const insertQuery = `
            INSERT INTO users (first_name, last_name, email, password, phone_number)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [firstName, lastName, email, hashedPassword, phoneNumber || null];

        await db.query(insertQuery, values);
        
        res.status(201).json({ message: 'User created successfully' });

    } catch (error) {
        console.error('Error during signup process:', error);
        return res.status(500).json({ message: 'Error creating user' });
    }
});

// ログイン
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 必須項目の確認
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // データベースからユーザーを取得
        const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = results[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone_number: user.phone_number,
            },
        });
    } catch (error) {
        console.error('Error during login process:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;