const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const app = express();
const fs = require('fs');
const PORT = process.env.PORT || 5004;
const reservationsRoutes = require('./routes/reservationsRoutes');
const authRoutes = require('./routes/auth');
const authenticateToken = require('./middleware/authenticateToken'); 
const salonReservationRoutes = require('./routes/salon_reservationRoutes');


// Load environment variables
require('dotenv').config();

// MySQL configuration
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'hairvision_admin',
  database: process.env.DB_NAME || 'salon_management', 
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');

    // デバッグ: 現在使用しているデータベースを確認
    db.query('SELECT DATABASE() AS db', (err, results) => {
      if (err) {
          console.error('Error fetching current database:', err);
      } else {
          console.log('Debug: Connected database:', results[0].db);
      }
  });
});

// CORS設定を追加
app.use(cors({
    origin: 'http://localhost:3000', // フロントエンドのURL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 許可するHTTPメソッド
    allowedHeaders: ['Content-Type', 'Authorization'], 
}));

// 未定義のエラーをキャッチするミドルウェア
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err); // エラーログを表示
  res.status(500).json({ message: 'Something went wrong!' });
});

// プリフライトリクエストの対応
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).end();
    res.status(404).json({message: 'Endpoint not found',});
});

// Middleware
app.use(bodyParser.json({ limit: '10mb' })); // Update body parser to allow 10MB payload
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));// Serve images
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(5002, () => {
  console.log('Server is running on http://localhost:5004');
});
app.use('/reservations', reservationsRoutes);
app.use('/api', reservationsRoutes);
app.use('/auth', authRoutes);
app.use('/profile', authenticateToken);  
app.use('/api', salonReservationRoutes); 
app.use('/salon', salonReservationRoutes);
app.use(salonReservationRoutes);


// サロンIDに基づいてメニューを取得
const getSalonMenu = (salonId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM salon_menus WHERE salon_id = ?';
        db.query(query, [salonId], (err, results) => {
            if (err) {
            console.error('Error executing query:', err);
            reject(err);
            } else {
            resolve(results);  // 返されるデータが正しいか確認
            }
        });
    });
};

// Multerストレージ設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

//
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 最大ファイルサイズ5MB
});

// 静的ファイル提供の設定
app.use('/uploads', express.static('uploads'));


// 新しいメニューアイテムをデータベースに挿入
const addMenuItem = (salonId, name, duration, price) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO salon_menus (salon_id, name, duration, price) VALUES (?, ?, ?, ?)';
        console.log('Executing query:', query, [salonId, name, duration, price]);
    
        db.query(query, [salonId, name, duration, price], (err, results) => {
            if (err) {
            console.error('Database error in addMenuItem:', err.message);
            reject(err);
            } else {
            // 成功した場合は insertId を使ってデータを返す
            resolve({ id: results.insertId, name, duration, price });
            }
        });
        });
    };
    

// --- User Auth Endpoints ---

// User signup
app.post('/salon/signup', async (req, res) => {
  console.log('Request received at /auth/signup:');
  console.log(req.body);
    const { salonName, email, password } = req.body;
  
    if (!salonName || !email || !password) {
      return res.status(400).send('All fields are required');
    }
  
    const checkQuery = 'SELECT email FROM salons WHERE email = ?';
    db.query(checkQuery, [email], async (err, results) => {
      if (err) return res.status(500).send('Server error');
      if (results.length > 0) return res.status(409).send('Email already exists');
  
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = `
          INSERT INTO salons (name, email, password)
          VALUES (?, ?, ?)
        `;
        db.query(insertQuery, [salonName, email, hashedPassword], (err) => {
          if (err) {
            console.error('Error inserting into database:', err);
            return res.status(500).send('Server error');
          }
          res.status(201).send('Salon registered successfully');
        });
      } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).send('Server error');
      }
    });
  });


// User login (ログイン処理)
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      console.warn('No user found with email:', email);
      return res.status(401).send('Invalid email or password');
    }

    const user = results[0];
    console.log('User retrieved from DB:', user);

    try {
      // 入力されたパスワードとDBのハッシュを比較
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        console.warn('Invalid password for user:', email);
        return res.status(401).send('Invalid email or password');
      }

      // JWTトークン生成
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET_KEY || 'your-secret-key',
        { expiresIn: '1h' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return res.status(500).send('Server error');
    }
  });
});

// --- User Profile Endpoints ---
app.get('/profile/user/:id', authenticateToken, (req, res) => {
  const userId = req.params.id;

  const query = `SELECT first_name, last_name, email, phone_number FROM users WHERE id = ?`;
  db.query(query, [userId], (err, results) => {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Server error');
      }
      if (results.length === 0) {
          return res.status(404).send('User not found');
      }
      res.json(results[0]); // ユーザーデータを返す
  });
});

// ユーザー用プロフィール取得
app.get('/profile/user/:id', authenticateToken, (req, res) => {
    const userId = req.params.id;

    const query = `SELECT first_name, last_name, email, phone_number FROM users WHERE id = ?`;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        if (results.length === 0) {
            return res.status(404).send('User not found');
        }
        res.json(results[0]); // ユーザーデータを返す
    });
});


  // ユーザーのプロフィール更新
  app.put('/profile/user/update', authenticateToken, (req, res) => {
    const { first_name, last_name, email, phone_number } = req.body;

    if (!first_name || !last_name || !email || !phone_number) {
        console.error('Missing required fields');
        return res.status(400).send('All fields are required');
    }

    const query = 'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone_number = ? WHERE id = ?';
    const values = [first_name, last_name, email, phone_number, req.user.id];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }

        if (results.affectedRows === 0) {
            return res.status(404).send('User not found');
        }

        res.status(200).send('Profile updated successfully');
    });
});





  // --- Salon Auth Endpoints ---
//サロンサインアップ
  app.post('/salon/signup', async (req, res) => {
    const { salonName, email, password } = req.body;
    if (!salonName || !email || !password) return res.status(400).send('All fields are required');
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO salons (name, email, password) VALUES (?, ?, ?)';
    db.query(query, [salonName, email, hashedPassword], (err) => {
      if (err) return res.status(500).send('Server error');
      res.status(201).send('Salon registered successfully');
    });
  });
  

// サロンログイン
app.post('/salon/login', async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = email?.trim();

  console.log('Login request received:', { email: trimmedEmail, password });

  if (!trimmedEmail || !password) {
      console.warn('Email or password is missing');
      return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM salon_management.salons WHERE email = ?';

  db.query(query, [trimmedEmail], async (err, results) => {
      console.log('Query parameter:', trimmedEmail);
      console.log('Query results:', results);

      if (err) {
          console.error('Database error:', err.message);
          return res.status(500).json({ message: 'Server error' });
      }

      if (results.length === 0) {
          console.warn('No salon found with the provided email');
          return res.status(401).json({ message: 'Invalid email or password' });
      }

      const salon = results[0];
      console.log('Salon found:', { id: salon.id, email: salon.email });

      const isPasswordValid = await bcrypt.compare(password, salon.password);
      console.log('Password comparison result:', isPasswordValid);

      if (!isPasswordValid) {
          console.warn('Invalid password for email:', trimmedEmail);
          return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign(
          { id: salon.id, email: salon.email },
          process.env.JWT_SECRET || 'secret_key',
          { expiresIn: '1h' }
      );

      res.status(200).json({
          message: 'Login successful',
          token,
          salon: { id: salon.id, name: salon.name, email: salon.email },
      });
  });
});

  
// --- Salon Profile Endpoints ---
// GET /salon/profile
// サロンプロフィール取得
app.get('/salon/profile', authenticateToken, (req, res) => {
  const salonId = req.user.id;

  const query = 'SELECT * FROM salons WHERE id = ?';
  db.query(query, [salonId], (err, results) => {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Database error');
      }

      if (results.length === 0) {
          return res.status(404).send('Salon not found');
      }

      const salonData = results[0];
      let openingHours = {};

      try {
          openingHours = typeof salonData.opening_hours === 'string'
              ? JSON.parse(salonData.opening_hours)
              : salonData.opening_hours;
      } catch (error) {
          console.error('Error parsing opening_hours:', error);
      }

      res.json({
          id: salonData.id,
          name: salonData.name,
          email: salonData.email,
          address_1: salonData.address_1,
          address_2: salonData.address_2,
          state: salonData.state,
          city: salonData.city,
          postcode: salonData.postcode,
          openingHours,
          salonImage: salonData.image_url,
      });
  });
});


// PUT /salon/profile
app.put('/salon/profile', authenticateToken, (req, res) => {
    const salonId = req.user.id;
    const { name, email, address_1, address_2, state, city, postcode, openingHours, salonImage } = req.body;
  
    console.log('Debug: Received profile update data:', req.body);
  
    let openingHoursJson = null;
    if (openingHours) {
      try {
        openingHoursJson = JSON.stringify(openingHours);
      } catch (error) {
        console.error('Failed to stringify openingHours:', error);
        return res.status(400).send('Invalid opening hours format');
      }
    }
  
    const query = `
      UPDATE salons
      SET name = ?, email = ?, address_1 = ?, address_2 = ?, state = ?, city = ?, postcode = ?, opening_hours = ?, image_url = ?
      WHERE id = ?
    `;
    const params = [name, email, address_1, address_2, state, city, postcode, openingHoursJson, salonImage, salonId];
  
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Database error');
      }
  
      console.log('Debug: Update results:', results);
  
      if (results.affectedRows === 0) {
        console.warn(`No salon found to update with ID: ${salonId}`);
        return res.status(404).send('Salon not found');
      }
  
      res.send('Profile updated successfully');
    });
  });

// POST /salon/upload
app.post('/salon/upload', authenticateToken, upload.single('salonImage'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }
    const imageUrl = `http://localhost:5004/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

// DELETE /salon/upload
app.delete('/salon/upload', authenticateToken, (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).send('Image URL is required');
    }

    const filePath = path.join(__dirname, 'uploads', path.basename(imageUrl));

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            return res.status(500).send('Error deleting file');
        }
        res.send('Image deleted successfully');
    });
});




// サロンメニュー
app.post('/salon/menu', authenticateToken, (req, res) => {
    const { salon_id, name, price, duration } = req.body;

    if (!salon_id || !name || !price || !duration) {
        return res.status(400).send('All fields are required');
    }

    const query = `INSERT INTO salon_menus (salon_id, name, price, duration) VALUES (?, ?, ?, ?)`;
    const values = [salon_id, name, price, duration];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error inserting menu item:', err);
            return res.status(500).send('Database error');
        }

        res.status(201).json({ id: results.insertId, salon_id, name, price, duration });
    });
});


app.get('/salon/menu/:salonId', (req, res) => {
    const salonId = req.params.salonId;

    const query = `
        SELECT id, name, duration, price
        FROM salon_menus
        WHERE salon_id = ?
    `;

    db.query(query, [salonId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            console.warn(`No menu items found for salon ID: ${salonId}`);
            return res.status(404).json({ message: 'No menu items found' });
        }

        res.status(200).json(results);
    });
});


app.delete('/salon/menu/:id', (req, res) => {
    const menuId = req.params.id; // URL パラメータから ID を取得
    const query = `
        DELETE FROM salon_menus
        WHERE id = ?
    `;

    db.query(query, [menuId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.affectedRows === 0) {
            console.warn(`Menu item with ID ${menuId} not found`);
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.status(200).json({ message: 'Menu item deleted successfully' });
    });
});


// サロン一覧
app.get('/salons', (req, res) => {
  console.log('Debug: /salons endpoint hit'); // デバッグ: エンドポイントが呼ばれたか
  const query = 'SELECT * FROM salons WHERE name IS NOT NULL AND email IS NOT NULL';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err); // デバッグ: データベースエラー
      return res.status(500).send('Database error');
    }
    console.log('Debug: Retrieved salons:', results); // デバッグ: データ取得成功
    res.json(results);
  });
});

//
app.get('/salon/:id', (req, res) => {
    const salonId = req.params.id;
    console.log(`Debug: Fetching details for salon ID: ${salonId}`); // デバッグ用
    const query = 'SELECT * FROM salons WHERE id = ?';
    db.query(query, [salonId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }
        if (results.length === 0) {
            console.warn(`No salon found for ID: ${salonId}`);
            return res.status(404).send('Salon not found');
        }
        console.log('Debug: Salon details fetched:', results[0]);
        res.json(results[0]);
    });
});

app.get('/salon/:salonId/menu', (req, res) => {
  const salonId = req.params.salonId;
  // サロンのメニューを取得するためのロジック
  db.query('SELECT * FROM salon_menus WHERE salon_id = ?', [salonId], (err, results) => {
    if (err) {
      console.error('メニュー取得エラー:', err);
      return res.status(500).json({ message: 'メニューの取得に失敗しました' });
    }
    res.json(results);  // メニューアイテムをフロントエンドに返す
  });
});

//
// // 新しいエンドポイントを追加
// app.get('/salon/reservations/:salonId', authenticateToken, (req, res) => {
//   const salonId = req.params.salonId;  // URL パラメータからサロンIDを取得

//   console.log('Fetching reservations for salon ID:', salonId);

//   // サロンIDが提供されていない場合のエラーチェック
//   if (!salonId) {
//     return res.status(400).json({ message: 'Salon ID is required' });
//   }

//   // SQL クエリで予約情報を取得
//   const query = 'SELECT * FROM reservations WHERE salon_id = ?';
//   db.query(query, [salonId], (err, results) => {
//     if (err) {
//       console.error('Database error:', err);
//       return res.status(500).json({ message: 'Server error' });
//     }

//     if (results.length === 0) {
//       console.warn('No reservations found for salon ID:', salonId);
//       return res.status(404).json({ message: 'No reservations found' });
//     }

//     // 予約情報をレスポンスとして返す
//     res.status(200).json(results);
//   });
// });


// //
// app.delete('/salon/reservation/:id', (req, res) => {
//   const reservationId = req.params.id; // URL パラメータから予約IDを取得
//   const query = `
//       DELETE FROM reservations
//       WHERE id = ?
//   `;

//   db.query(query, [reservationId], (err, results) => {
//       if (err) {
//           console.error('Database error:', err);
//           return res.status(500).json({ message: 'Server error' });
//       }

//       if (results.affectedRows === 0) {
//           console.warn(`Reservation with ID ${reservationId} not found`);
//           return res.status(404).json({ message: 'Reservation not found' });
//       }

//       res.status(200).json({ message: 'Reservation deleted successfully' });
//   });
// });

// サロンの予約を取得するAPIエンドポイント
app.get('/salon/reservations/:salonId', authenticateToken, (req, res) => {
  const salonId = req.params.salonId;  // URLからサロンIDを取得
  console.log('Fetching reservations for salon ID:', salonId);

  if (!salonId) {
    return res.status(400).json({ message: 'Salon ID is required' });
  }

  // reservationsテーブルから予約情報を取得
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

    // 予約情報を返す
    res.status(200).json(results);
  });
});

//
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  res.send('File uploaded successfully');
});

  // サーバー起動
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });