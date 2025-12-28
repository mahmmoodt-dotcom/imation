const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure uploads directory exists for persistence
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp to prevent collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Hard Limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only .jpg, .png, and .webp images under 2MB are supported."));
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// SERVE UPLOADS PUBLICLY
app.use('/uploads', express.static(uploadDir));

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'imation-shop-secret-2025';
const ADMIN_PASS = '#aho+imo22';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name_en TEXT NOT NULL,
        name_ku TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        description_en TEXT,
        description_ku TEXT,
        description_ar TEXT,
        image TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name_en TEXT NOT NULL,
        name_ku TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        description_en TEXT,
        description_ku TEXT,
        description_ar TEXT,
        price DECIMAL(12,2) NOT NULL DEFAULT 0,
        discount DECIMAL(12,2) DEFAULT 0,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        images JSONB DEFAULT '[]',
        availability BOOLEAN DEFAULT TRUE,
        specs JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(30) PRIMARY KEY,
        invoice_number VARCHAR(30) UNIQUE,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        secondary_phone TEXT,
        city TEXT,
        address TEXT,
        items JSONB,
        total DECIMAL(12,2),
        status VARCHAR(20) DEFAULT 'pending',
        shipping_driver TEXT,
        lang VARCHAR(5),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        about_text JSONB,
        about_image TEXT,
        phones JSONB,
        email TEXT,
        address TEXT,
        map_embed TEXT,
        floating_hero_image TEXT,
        home_feature_image TEXT,
        main_logo TEXT,
        brand_logos JSONB,
        socials JSONB
      );
    `);

    const res = await pool.query('SELECT COUNT(*) FROM settings');
    if (parseInt(res.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO settings (about_text, phones, email, address, socials)
        VALUES ($1, $2, $3, $4, $5)`,
        [
          JSON.stringify({ en: 'Premium computing solutions.', ckb: 'چارەسەری کۆمپیوتەری بەهێز.', ar: 'حلول الحوسبة الراقية.' }),
          JSON.stringify(['07701234567']),
          'info@imation-shop.com',
          'Erbil, Iraq',
          JSON.stringify({ whatsapp: '', instagram: '', facebook: '', tiktok: '' })
        ]
      );
    }
  } catch (err) { console.error("DB Init Error:", err.message); }
};

initDb();

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) { res.status(401).json({ error: 'Invalid Token' }); }
};

// --- API ROUTES ---

app.post('/api/login', (req, res) => {
  if (req.body.password === ADMIN_PASS) {
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '30d' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Wrong password' });
});

// STANDALONE UPLOAD ROUTE (Admin Authenticated)
app.post('/api/upload', authenticateAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows.map(r => ({
      id: r.id.toString(),
      name: { en: r.name_en, ckb: r.name_ku, ar: r.name_ar },
      description: { en: r.description_en, ckb: r.description_ku, ar: r.description_ar },
      price: parseFloat(r.price || 0),
      discount: parseFloat(r.discount || 0),
      category: r.category_id ? r.category_id.toString() : '',
      images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || []),
      availability: !!r.availability,
      specs: typeof r.specs === 'string' ? JSON.parse(r.specs) : (r.specs || []),
      createdAt: r.created_at
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.json(result.rows.map(r => ({
      id: r.id.toString(),
      name: { en: r.name_en, ckb: r.name_ku, ar: r.name_ar },
      image: r.image
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings LIMIT 1');
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// SPA Support
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => console.log(`Imation Backend active on port ${PORT}`));