const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'imation-shop-secret-2025';
const ADMIN_PASS = '#aho+imo22';

// Robust Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

const initDb = async () => {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set. Running in limited mode.");
    return;
  }
  let retries = 5;
  while (retries > 0) {
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
          created_at TIMESTAMP DEFAULT NOW(),
          order_date TIMESTAMP DEFAULT NOW()
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
      console.log("Database initialized successfully.");
      break;
    } catch (err) {
      console.error(`DB Init Attempt Failed (${retries} left):`, err.message);
      retries--;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

initDb();

// Middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) { res.status(401).json({ error: 'Invalid Token' }); }
};

const mapRowToProduct = (r) => ({
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
});

// Auth
app.post('/api/login', (req, res) => {
  if (req.body.password === ADMIN_PASS) {
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '30d' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Wrong password' });
});

// API Routes
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows.map(mapRowToProduct));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/products', authenticateAdmin, upload.array('images', 3), async (req, res) => {
  try {
    const b = req.body;
    const imgs = req.files.map(f => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`);
    const result = await pool.query(
      `INSERT INTO products (name_en, name_ku, name_ar, description_en, description_ku, description_ar, price, discount, category_id, availability, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [b.name_en, b.name_ku, b.name_ar, b.description_en, b.description_ku, b.description_ar, b.price, b.discount, b.category_id || null, b.availability === 'true', JSON.stringify(imgs)]
    );
    res.json(mapRowToProduct(result.rows[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/products/:id', authenticateAdmin, upload.array('images', 3), async (req, res) => {
  try {
    const b = req.body;
    let imgs = JSON.parse(b.existingImages || '[]');
    if (req.files && req.files.length > 0) {
      const newImgs = req.files.map(f => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`);
      imgs = [...imgs, ...newImgs].slice(0, 3);
    }
    await pool.query(
      `UPDATE products SET name_en=$1, name_ku=$2, name_ar=$3, description_en=$4, description_ku=$5, description_ar=$6, price=$7, discount=$8, category_id=$9, availability=$10, images=$11 WHERE id=$12`,
      [b.name_en, b.name_ku, b.name_ar, b.description_en, b.description_ku, b.description_ar, b.price, b.discount, b.category_id || null, b.availability === 'true', JSON.stringify(imgs), req.params.id]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Categories
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

app.post('/api/admin/categories', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const b = req.body;
    const img = req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : '';
    await pool.query(`INSERT INTO categories (name_en, name_ku, name_ar, image) VALUES ($1, $2, $3, $4)`, [b.name_en, b.name_ku, b.name_ar, img]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Serving the static files for production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// API 404
app.use('/api/*', (req, res) => res.status(404).json({ error: 'Endpoint not found' }));

// SPA Fallback: Send index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => console.log(`Server live on port ${PORT}`));