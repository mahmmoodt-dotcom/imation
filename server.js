const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Lazy initialization for Supabase to prevent boot crash if env vars are missing
let supabaseInstance = null;
const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are missing.");
  }
  supabaseInstance = createClient(url, key);
  return supabaseInstance;
};

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'imation-shop-secret-2025';
const ADMIN_PASS = '#aho+imo22';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * Helper to upload a Multer file buffer to Supabase Storage
 */
const uploadToSupabase = async (file, folder = 'products') => {
  const sb = getSupabase();
  const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const filePath = `${folder}/${filename}`;
  
  const { data, error } = await sb.storage
    .from('product-images')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    console.error("Supabase Upload Error:", error);
    throw error;
  }

  const { data: { publicUrl } } = sb.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrl;
};

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
    console.log("Database ready.");
  } catch (err) {
    console.error("DB Init Error:", err.message);
  }
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

// Products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows.map(mapRowToProduct));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/products', authenticateAdmin, upload.array('images', 3), async (req, res) => {
  try {
    const b = req.body;
    if (req.files.length > 3) return res.status(400).json({ error: 'Max 3 images allowed' });
    
    const uploadPromises = req.files.map(file => uploadToSupabase(file, 'products'));
    const imageUrls = await Promise.all(uploadPromises);

    const result = await pool.query(
      `INSERT INTO products (name_en, name_ku, name_ar, description_en, description_ku, description_ar, price, discount, category_id, availability, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [b.name_en, b.name_ku, b.name_ar, b.description_en, b.description_ku, b.description_ar, b.price, b.discount, b.category_id || null, b.availability === 'true', JSON.stringify(imageUrls)]
    );
    res.json(mapRowToProduct(result.rows[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/products/:id', authenticateAdmin, upload.array('images', 3), async (req, res) => {
  try {
    const b = req.body;
    let existingImages = JSON.parse(b.existingImages || '[]');
    const newFiles = req.files || [];
    
    if (existingImages.length + newFiles.length > 3) {
      return res.status(400).json({ error: 'Max 3 images total allowed' });
    }

    const uploadPromises = newFiles.map(file => uploadToSupabase(file, 'products'));
    const newUrls = await Promise.all(uploadPromises);
    const finalImages = [...existingImages, ...newUrls];

    await pool.query(
      `UPDATE products SET name_en=$1, name_ku=$2, name_ar=$3, description_en=$4, description_ku=$5, description_ar=$6, price=$7, discount=$8, category_id=$9, availability=$10, images=$11 WHERE id=$12`,
      [b.name_en, b.name_ku, b.name_ar, b.description_en, b.description_ku, b.description_ar, b.price, b.discount, b.category_id || null, b.availability === 'true', JSON.stringify(finalImages), req.params.id]
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
    const imageUrl = req.file ? await uploadToSupabase(req.file, 'categories') : '';
    await pool.query(`INSERT INTO categories (name_en, name_ku, name_ar, image) VALUES ($1, $2, $3, $4)`, [b.name_en, b.name_ku, b.name_ar, imageUrl]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/categories/:id', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const b = req.body;
    let updateQuery = `UPDATE categories SET name_en=$1, name_ku=$2, name_ar=$3`;
    let params = [b.name_en, b.name_ku, b.name_ar];
    
    if (req.file) {
      const imageUrl = await uploadToSupabase(req.file, 'categories');
      updateQuery += `, image=$4 WHERE id=$5`;
      params.push(imageUrl, req.params.id);
    } else {
      updateQuery += ` WHERE id=$4`;
      params.push(req.params.id);
    }
    await pool.query(updateQuery, params);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/categories/:id', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Orders
app.post('/api/orders', async (req, res) => {
  try {
    const b = req.body;
    const id = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const inv = 'INV-' + Date.now();
    const result = await pool.query(
      `INSERT INTO orders (id, invoice_number, customer_name, phone, secondary_phone, city, address, items, total, lang)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [id, inv, b.customerName, b.phone, b.secondaryPhone, b.city, b.address, JSON.stringify(b.items), b.total, b.lang]
    );
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/orders/track', async (req, res) => {
  try {
    const { id, phone } = req.query;
    const result = await pool.query('SELECT * FROM orders WHERE id = $1 AND phone = $2', [id, phone]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const { status, shipping_driver } = req.body;
    await pool.query('UPDATE orders SET status=$1, shipping_driver=$2 WHERE id=$3', [status, shipping_driver, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Settings
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings LIMIT 1');
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/settings', authenticateAdmin, async (req, res) => {
  try {
    const s = req.body;
    await pool.query(
      `UPDATE settings SET about_text=$1, phones=$2, email=$3, address=$4, map_embed=$5, socials=$6 WHERE id=(SELECT id FROM settings LIMIT 1)`,
      [JSON.stringify(s.aboutText), JSON.stringify(s.phones), s.email, s.address, s.map_embed, JSON.stringify(s.socials)]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/settings/home_feature_image', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = await uploadToSupabase(req.file, 'settings');
    await pool.query('UPDATE settings SET home_feature_image=$1 WHERE id=(SELECT id FROM settings LIMIT 1)', [imageUrl]);
    res.json({ image: imageUrl });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/settings/about_image', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = await uploadToSupabase(req.file, 'settings');
    await pool.query('UPDATE settings SET about_image=$1 WHERE id=(SELECT id FROM settings LIMIT 1)', [imageUrl]);
    res.json({ image: imageUrl });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Bulk Actions
app.delete('/api/admin/products/bulk', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ANY($1)', [req.body.ids]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/products/bulk/discount', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE products SET discount=$1 WHERE id = ANY($2)', [req.body.discount, req.body.ids]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/products/bulk/availability', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE products SET availability=$1 WHERE id = ANY($2)', [req.body.availability, req.body.ids]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// SPA Support
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));

app.listen(PORT, () => console.log(`Server live on port ${PORT}`));