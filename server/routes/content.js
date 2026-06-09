import express from 'express';
import { getOne, getAll, run } from '../database.js';
import { CURRENCIES, getCurrencyFromSettings } from '../utils/currency.js';

const router = express.Router();

// Products CRUD
router.get('/products', (req, res) => {
  const { category, featured, search, page = 1, limit = 20 } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (featured === 'true') {
    query += ' AND is_featured = 1';
  }
  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  const products = getAll(query, params);
  res.json(products);
});

router.get('/products/:slug', (req, res) => {
  const product = getOne('SELECT * FROM products WHERE slug = ?', [req.params.slug]);
  if (product) {
    product.gallery_images = JSON.parse(product.gallery_images || '[]');
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

router.get('/products/id/:id', (req, res) => {
  const product = getOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (product) {
    product.gallery_images = JSON.parse(product.gallery_images || '[]');
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

router.post('/products', (req, res) => {
  const { name, slug, description, price, original_price, category, image, gallery_images, in_stock, is_featured, is_new, sort_order } = req.body;
  
  const result = run(`
    INSERT INTO products (name, slug, description, price, original_price, category, image, gallery_images, in_stock, is_featured, is_new, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [name, slug, description, price, original_price, category, image, JSON.stringify(gallery_images || []), in_stock ? 1 : 0, is_featured ? 1 : 0, is_new ? 1 : 0, sort_order || 0]);
  
  res.json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/products/:id', (req, res) => {
  const { name, slug, description, price, original_price, category, image, gallery_images, in_stock, is_featured, is_new, sort_order } = req.body;
  
  run(`
    UPDATE products SET 
      name = ?, slug = ?, description = ?, price = ?, original_price = ?, category = ?, image = ?, 
      gallery_images = ?, in_stock = ?, is_featured = ?, is_new = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [name, slug, description, price, original_price, category, image, JSON.stringify(gallery_images || []), in_stock ? 1 : 0, is_featured ? 1 : 0, is_new ? 1 : 0, sort_order || 0, req.params.id]);
  
  res.json({ id: req.params.id, ...req.body });
});

router.delete('/products/:id', (req, res) => {
  run('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// Categories CRUD
router.get('/categories', (req, res) => {
  const categories = getAll('SELECT * FROM categories ORDER BY sort_order ASC');
  res.json(categories);
});

router.get('/categories/id/:id', (req, res) => {
  const category = getOne('SELECT * FROM categories WHERE id = ?', [req.params.id]);
  if (category) {
    res.json(category);
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

router.get('/categories/:slug', (req, res) => {
  const category = getOne('SELECT * FROM categories WHERE slug = ?', [req.params.slug]);
  if (category) {
    res.json(category);
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

router.post('/categories', (req, res) => {
  const { name, slug, description, image, sort_order } = req.body;
  
  const result = run(`
    INSERT INTO categories (name, slug, description, image, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `, [name, slug, description, image, sort_order || 0]);
  
  res.json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/categories/:id', (req, res) => {
  const { name, slug, description, image, sort_order } = req.body;
  
  run(`
    UPDATE categories SET name = ?, slug = ?, description = ?, image = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [name, slug, description, image, sort_order || 0, req.params.id]);
  
  res.json({ id: req.params.id, ...req.body });
});

router.delete('/categories/:id', (req, res) => {
  run('DELETE FROM categories WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// Homepage content CRUD
router.get('/homepage', (req, res) => {
  const content = getAll('SELECT * FROM homepage_content WHERE is_visible = 1 ORDER BY sort_order ASC');
  res.json(content);
});

router.get('/homepage/all', (req, res) => {
  const content = getAll('SELECT * FROM homepage_content ORDER BY sort_order ASC');
  res.json(content);
});

router.post('/homepage', (req, res) => {
  const { section, title, subtitle, description, image, link, link_text, sort_order, is_visible } = req.body;
  
  const result = run(`
    INSERT INTO homepage_content (section, title, subtitle, description, image, link, link_text, sort_order, is_visible)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [section, title, subtitle, description, image, link, link_text, sort_order || 0, is_visible ? 1 : 1]);
  
  res.json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/homepage/:id', (req, res) => {
  const { section, title, subtitle, description, image, link, link_text, sort_order, is_visible } = req.body;
  
  run(`
    UPDATE homepage_content SET 
      section = ?, title = ?, subtitle = ?, description = ?, image = ?, link = ?, link_text = ?, 
      sort_order = ?, is_visible = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [section, title, subtitle, description, image, link, link_text, sort_order || 0, is_visible ? 1 : 1, req.params.id]);
  
  res.json({ id: req.params.id, ...req.body });
});

router.delete('/homepage/:id', (req, res) => {
  run('DELETE FROM homepage_content WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// Features CRUD
router.get('/features', (req, res) => {
  const features = getAll('SELECT * FROM features WHERE is_visible = 1 ORDER BY sort_order ASC');
  res.json(features);
});

router.get('/features/all', (req, res) => {
  const features = getAll('SELECT * FROM features ORDER BY sort_order ASC');
  res.json(features);
});

router.post('/features', (req, res) => {
  const { title, description, icon, sort_order, is_visible } = req.body;
  
  const result = run(`
    INSERT INTO features (title, description, icon, sort_order, is_visible)
    VALUES (?, ?, ?, ?, ?)
  `, [title, description, icon, sort_order || 0, is_visible ? 1 : 1]);
  
  res.json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/features/:id', (req, res) => {
  const { title, description, icon, sort_order, is_visible } = req.body;
  
  run(`
    UPDATE features SET title = ?, description = ?, icon = ?, sort_order = ?, is_visible = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [title, description, icon, sort_order || 0, is_visible ? 1 : 1, req.params.id]);
  
  res.json({ id: req.params.id, ...req.body });
});

router.delete('/features/:id', (req, res) => {
  run('DELETE FROM features WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// Footer content CRUD
router.get('/footer', (req, res) => {
  const content = getAll('SELECT * FROM footer_content ORDER BY sort_order ASC');
  
  // Group by section
  const grouped = {};
  content.forEach(item => {
    if (!grouped[item.section]) {
      grouped[item.section] = { title: '', links: [] };
    }
    if (item.key === 'title') {
      grouped[item.section].title = item.value || '';
    } else {
      grouped[item.section].links.push({ key: item.key, value: item.value });
    }
  });
  
  res.json(grouped);
});

router.post('/footer', (req, res) => {
  const { section, key, value, sort_order } = req.body;
  
  const result = run(`
    INSERT INTO footer_content (section, key, value, sort_order)
    VALUES (?, ?, ?, ?)
  `, [section, key, value, sort_order || 0]);
  
  res.json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/footer/:id', (req, res) => {
  const { section, key, value, sort_order } = req.body;
  
  run(`
    UPDATE footer_content SET section = ?, key = ?, value = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [section, key, value, sort_order || 0, req.params.id]);
  
  res.json({ id: req.params.id, ...req.body });
});

router.delete('/footer/:id', (req, res) => {
  run('DELETE FROM footer_content WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// Site settings
function getSettingsMap() {
  const settings = getAll('SELECT key, value FROM site_settings');
  const result = {};
  settings.forEach(s => { result[s.key] = s.value; });
  return result;
}

router.get('/settings', (req, res) => {
  res.json(getSettingsMap());
});

router.get('/settings/currency', (req, res) => {
  const settings = getSettingsMap();
  const currency = getCurrencyFromSettings(settings);
  res.json({ ...currency, currencies: Object.values(CURRENCIES) });
});

router.post('/settings', (req, res) => {
  const { key, value } = req.body;

  run(`
    INSERT OR REPLACE INTO site_settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `, [key, value]);

  res.json({ key, value });
});

router.put('/settings', (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'settings object required' });
  }

  Object.entries(settings).forEach(([key, value]) => {
    run(`
      INSERT OR REPLACE INTO site_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [key, String(value)]);
  });

  res.json({ success: true, settings: getSettingsMap() });
});

export default router;