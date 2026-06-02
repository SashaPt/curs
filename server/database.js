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
  
  saveDatabase();
  seedData();
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
      ['Modern Lounge Chair', 'modern-lounge-chair', 'Stylish and comfortable lounge chair with premium fabric', 299.99, 399.99, 'living', '/images/products/product-1.png', '[]', 1, 1, 1],
      ['Dining Table Set', 'dining-table-set', 'Elegant 6-seater dining table set', 599.99, 799.99, 'dining', '/images/products/product-2.png', '[]', 1, 1, 0],
      ['Minimalist Bookshelf', 'minimalist-bookshelf', 'Clean lines bookshelf for modern homes', 199.99, 249.99, 'living', '/images/products/product-3.png', '[]', 1, 0, 1],
      ['Bedroom Suite', 'bedroom-suite', 'Complete bedroom suite with storage', 899.99, 1199.99, 'bedroom', '/images/products/product-4.png', '[]', 1, 1, 0]
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