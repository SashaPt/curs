import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'data', 'database.sqlite');

// Ensure data directory exists
mkdirSync(dirname(dbPath), { recursive: true });

let db;

export async function initDatabase() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  // Initialize tables
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      original_price REAL,
      category TEXT NOT NULL,
      image TEXT DEFAULT '/images/products/product-1.png',
      gallery_images TEXT DEFAULT '[]',
      in_stock INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      is_new INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS homepage_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT UNIQUE NOT NULL,
      title TEXT,
      subtitle TEXT,
      description TEXT,
      image TEXT,
      link TEXT,
      link_text TEXT,
      sort_order INTEGER DEFAULT 0,
      is_visible INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      is_visible INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS footer_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS acf_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      location TEXT NOT NULL DEFAULT 'homepage',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS acf_fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      label TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'text',
      config TEXT DEFAULT '{}',
      sort_order INTEGER DEFAULT 0,
      required INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES acf_groups(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS acf_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      field_id INTEGER NOT NULL UNIQUE,
      value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (field_id) REFERENCES acf_fields(id) ON DELETE CASCADE
    )
  `);
  
  saveDatabase();
  seedData();
  seedAcfData();
  seedCurrencySettings();
  migrateCurrencyPrices();
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(dbPath, buffer);
}

function seedData() {
  // Check if products exist
  const productResult = db.exec('SELECT COUNT(*) as count FROM products');
  const productCount = productResult.length > 0 ? productResult[0].values[0][0] : 0;
  
  if (productCount === 0) {
    const products = [
      ['Modern Lounge Chair', 'modern-lounge-chair', 'Stylish and comfortable lounge chair with premium fabric', 4500000, 6000000, 'living', '/images/products/product-1.png', '[]', 1, 1, 1],
      ['Dining Table Set', 'dining-table-set', 'Elegant 6-seater dining table set', 9000000, 12000000, 'dining', '/images/products/product-2.png', '[]', 1, 1, 0],
      ['Minimalist Bookshelf', 'minimalist-bookshelf', 'Clean lines bookshelf for modern homes', 3000000, 3750000, 'living', '/images/products/product-3.png', '[]', 1, 0, 1],
      ['Bedroom Suite', 'bedroom-suite', 'Complete bedroom suite with storage', 13500000, 18000000, 'bedroom', '/images/products/product-4.png', '[]', 1, 1, 0]
    ];
    
    products.forEach(p => {
      db.run(`INSERT INTO products (name, slug, description, price, original_price, category, image, gallery_images, in_stock, is_featured, is_new) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        p);
    });
    
    const categories = [
      ['Living Room', 'living', 'Sofas, chairs, and entertainment units', '/images/home/range-living.png', 1],
      ['Dining Room', 'dining', 'Tables, chairs, and storage', '/images/home/range-dining.png', 2],
      ['Bedroom', 'bedroom', 'Beds, wardrobes, and nightstands', '/images/home/range-bedroom.png', 3]
    ];
    
    categories.forEach(c => {
      db.run(`INSERT INTO categories (name, slug, description, image, sort_order) VALUES (?, ?, ?, ?, ?)`, c);
    });
    
    const homepageSections = [
      ['hero', 'Discover Your Perfect Furniture', 'Quality & Style for Every Home', 'Transform your living space with our curated collection of premium furniture', '/images/home/hero-bg.png', '/shop', 'Shop Now', 1, 1],
      ['gallery_1', 'Inspire Your Space', 'Curated Collections', 'Browse our carefully selected furniture pieces', '/images/home/gallery-1.png', '/shop', 'Explore', 2, 1],
      ['gallery_2', 'Modern Living', 'Timeless Design', 'Furniture that combines beauty with functionality', '/images/home/gallery-2.png', '/shop', 'View Collection', 3, 1]
    ];
    
    homepageSections.forEach(h => {
      db.run(`INSERT INTO homepage_content (section, title, subtitle, description, image, link, link_text, sort_order, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, h);
    });
    
    const features = [
      ['Free Delivery', 'On all orders over $500', 'delivery', 1, 1],
      ['30 Days Return', 'Easy returns within 30 days', 'return', 2, 1],
      ['Secure Payment', '100% secure payment processing', 'payment', 3, 1],
      ['24/7 Support', 'Round the clock customer support', 'support', 4, 1]
    ];
    
    features.forEach(f => {
      db.run(`INSERT INTO features (title, description, icon, sort_order, is_visible) VALUES (?, ?, ?, ?, ?)`, f);
    });
    
    const footerLinks = [
      ['about', 'title', 'About Us', 1],
      ['about', 'link_1', 'Our Story', 2],
      ['about', 'link_2', 'Careers', 3],
      ['about', 'link_3', 'Press', 4],
      ['customer_service', 'title', 'Customer Service', 5],
      ['customer_service', 'link_1', 'Contact Us', 6],
      ['customer_service', 'link_2', 'Returns', 7],
      ['customer_service', 'link_3', 'FAQ', 8],
      ['information', 'title', 'Information', 9],
      ['information', 'link_1', 'Privacy Policy', 10],
      ['information', 'link_2', 'Terms & Conditions', 11],
      ['information', 'link_3', 'Shipping Info', 12],
      ['newsletter', 'title', 'Newsletter', 13],
      ['newsletter', 'description', 'Subscribe for updates', 14],
      ['contact', 'title', 'Contact', 15],
      ['contact', 'address', '123 Furniture Street, Design City', 16],
      ['contact', 'email', 'hello@furniturestore.com', 17],
      ['contact', 'phone', '+1 (555) 123-4567', 18]
    ];
    
    footerLinks.forEach(l => {
      db.run(`INSERT INTO footer_content (section, key, value, sort_order) VALUES (?, ?, ?, ?)`, l);
    });
    
    saveDatabase();
  }
}

function seedAcfData() {
  const groupResult = db.exec('SELECT COUNT(*) as count FROM acf_groups');
  const groupCount = groupResult.length > 0 ? groupResult[0].values[0][0] : 0;

  if (groupCount > 0) return;

  db.run(`INSERT INTO acf_groups (name, slug, description, location, sort_order) VALUES (?, ?, ?, ?, ?)`,
    ['Главная страница — Hero', 'homepage-hero', 'Блок героя на главной', 'homepage', 1]);
  db.run(`INSERT INTO acf_groups (name, slug, description, location, sort_order) VALUES (?, ?, ?, ?, ?)`,
    ['Главная — Категории', 'homepage-range', 'Секция Browse The Range', 'homepage', 2]);
  db.run(`INSERT INTO acf_groups (name, slug, description, location, sort_order) VALUES (?, ?, ?, ?, ?)`,
    ['Главная — Галерея', 'homepage-gallery', 'Секция галереи', 'homepage', 3]);
  db.run(`INSERT INTO acf_groups (name, slug, description, location, sort_order) VALUES (?, ?, ?, ?, ?)`,
    ['Главная — Вдохновение', 'homepage-inspiration', 'Секция вдохновения', 'homepage', 4]);

  const groups = getAll('SELECT id, slug FROM acf_groups');
  const groupMap = Object.fromEntries(groups.map(g => [g.slug, g.id]));

  const fields = [
    [groupMap['homepage-hero'], 'hero_label', 'Подзаголовок', 'text', '{}', 1, 0],
    [groupMap['homepage-hero'], 'hero_title', 'Заголовок', 'text', '{}', 2, 1],
    [groupMap['homepage-hero'], 'hero_description', 'Описание', 'textarea', '{}', 3, 0],
    [groupMap['homepage-hero'], 'hero_image', 'Фоновое изображение', 'image', '{}', 4, 0],
    [groupMap['homepage-hero'], 'hero_button_text', 'Текст кнопки', 'text', '{}', 5, 0],
    [groupMap['homepage-hero'], 'hero_button_link', 'Ссылка кнопки', 'url', '{}', 6, 0],
    [groupMap['homepage-range'], 'range_title', 'Заголовок секции', 'text', '{}', 1, 0],
    [groupMap['homepage-range'], 'range_subtitle', 'Подзаголовок', 'text', '{}', 2, 0],
    [groupMap['homepage-gallery'], 'gallery_title', 'Заголовок', 'text', '{}', 1, 0],
    [groupMap['homepage-gallery'], 'gallery_subtitle', 'Подзаголовок', 'text', '{}', 2, 0],
    [groupMap['homepage-gallery'], 'gallery_images', 'Изображения', 'repeater', JSON.stringify({
      sub_fields: [
        { name: 'image', label: 'Изображение', type: 'image' },
        { name: 'alt', label: 'Alt текст', type: 'text' }
      ]
    }), 3, 0],
    [groupMap['homepage-inspiration'], 'inspiration_title', 'Заголовок', 'text', '{}', 1, 0],
    [groupMap['homepage-inspiration'], 'inspiration_text', 'Текст', 'textarea', '{}', 2, 0],
    [groupMap['homepage-inspiration'], 'inspiration_images', 'Изображения', 'repeater', JSON.stringify({
      sub_fields: [
        { name: 'image', label: 'Изображение', type: 'image' },
        { name: 'caption', label: 'Подпись', type: 'text' }
      ]
    }), 3, 0]
  ];

  fields.forEach(f => {
    db.run(`INSERT INTO acf_fields (group_id, name, label, type, config, sort_order, required) VALUES (?, ?, ?, ?, ?, ?, ?)`, f);
  });

  const fieldRows = getAll('SELECT id, name FROM acf_fields');
  const fieldMap = Object.fromEntries(fieldRows.map(f => [f.name, f.id]));

  const values = [
    [fieldMap['hero_label'], 'New arrival'],
    [fieldMap['hero_title'], 'Discover Our New Collection'],
    [fieldMap['hero_description'], 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.'],
    [fieldMap['hero_image'], JSON.stringify({ path: '/images/home/hero-bg.png', fallback: '/images/home/hero-bg.png' })],
    [fieldMap['hero_button_text'], 'BUY NOW'],
    [fieldMap['hero_button_link'], '/shop'],
    [fieldMap['range_title'], 'Browse The Range'],
    [fieldMap['range_subtitle'], 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'],
    [fieldMap['gallery_title'], '#FuniroFurniture'],
    [fieldMap['gallery_subtitle'], 'Share your setup with'],
    [fieldMap['gallery_images'], JSON.stringify([
      { image: { path: '/images/home/gallery-1.png', fallback: '/images/home/gallery-1.png' }, alt: 'Gallery 1' },
      { image: { path: '/images/home/gallery-2.png', fallback: '/images/home/gallery-2.png' }, alt: 'Gallery 2' },
      { image: { path: '/images/home/gallery-3.png', fallback: '/images/home/gallery-3.png' }, alt: 'Gallery 3' },
      { image: { path: '/images/home/gallery-4.png', fallback: '/images/home/gallery-4.png' }, alt: 'Gallery 4' },
      { image: { path: '/images/home/gallery-5.png', fallback: '/images/home/gallery-5.png' }, alt: 'Gallery 5' },
      { image: { path: '/images/home/gallery-6.png', fallback: '/images/home/gallery-6.png' }, alt: 'Gallery 6' },
      { image: { path: '/images/home/gallery-7.png', fallback: '/images/home/gallery-7.png' }, alt: 'Gallery 7' },
      { image: { path: '/images/home/gallery-8.png', fallback: '/images/home/gallery-8.png' }, alt: 'Gallery 8' },
      { image: { path: '/images/home/gallery-9.png', fallback: '/images/home/gallery-9.png' }, alt: 'Gallery 9' }
    ])],
    [fieldMap['inspiration_title'], '50+ Beautiful rooms inspiration'],
    [fieldMap['inspiration_text'], 'Our designer already made a lot of beautiful prototipe of rooms that inspire you'],
    [fieldMap['inspiration_images'], JSON.stringify([
      { image: { path: '/images/home/inspiration-1.png', fallback: '/images/home/inspiration-1.png' }, caption: 'Room 1' },
      { image: { path: '/images/home/inspiration-2.png', fallback: '/images/home/inspiration-2.png' }, caption: 'Room 2' },
      { image: { path: '/images/home/inspiration-3.png', fallback: '/images/home/inspiration-3.png' }, caption: 'Room 3' },
      { image: { path: '/images/home/inspiration-4.png', fallback: '/images/home/inspiration-4.png' }, caption: 'Room 4' }
    ])]
  ];

  values.forEach(v => {
    db.run(`INSERT INTO acf_values (field_id, value) VALUES (?, ?)`, v);
  });

  saveDatabase();
}

function seedCurrencySettings() {
  const defaults = [
    ['currency_code', 'IDR'],
    ['currency_symbol', 'Rp'],
    ['currency_locale', 'id-ID']
  ];

  defaults.forEach(([key, value]) => {
    const existing = getOne('SELECT value FROM site_settings WHERE key = ?', [key]);
    if (!existing) {
      db.run('INSERT INTO site_settings (key, value) VALUES (?, ?)', [key, value]);
    }
  });

  saveDatabase();
}

function migrateCurrencyPrices() {
  const migrated = getOne("SELECT value FROM site_settings WHERE key = 'currency_migrated'");
  if (migrated?.value === '1') return;

  const products = getAll('SELECT id, price, original_price FROM products');
  products.forEach(p => {
    if (p.price > 0 && p.price < 10000) {
      db.run('UPDATE products SET price = ?, original_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
        Math.round(p.price * 15000),
        p.original_price ? Math.round(p.original_price * 15000) : null,
        p.id
      ]);
    }
  });

  db.run("INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('currency_migrated', '1', CURRENT_TIMESTAMP)");
  saveDatabase();
}

// Helper functions matching better-sqlite3 API
export function getOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

export function getAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function run(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
  return { lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0]?.values[0][0] };
}

export default { getOne, getAll, run, initDatabase };