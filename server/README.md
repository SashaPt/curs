# Backend & Admin Panel

## Quick Start

```bash
npm install
npm run dev
```

This starts both the Express server (port 3001) and Vite dev server (port 5173).

## Admin Panel

Access at: **http://localhost:5173/admin**

### Features
- **Dashboard**: Overview of products, categories, and features
- **Products**: CRUD operations for products (name, price, image, featured, new, stock status)
- **Categories**: Manage shop categories
- **Homepage**: Edit homepage sections (hero, gallery, banners)
- **Features**: Edit the 4 feature icons (delivery, return, payment, support)
- **Footer**: Edit footer content and links

## API Endpoints

### Products
- `GET /api/content/products` - List all products
- `GET /api/content/products/:slug` - Get product by slug
- `POST /api/content/products` - Create product
- `PUT /api/content/products/:id` - Update product
- `DELETE /api/content/products/:id` - Delete product

### Categories
- `GET /api/content/categories` - List categories
- `POST /api/content/categories` - Create category
- `PUT /api/content/categories/:id` - Update category
- `DELETE /api/content/categories/:id` - Delete category

### Homepage
- `GET /api/content/homepage` - Get visible homepage sections
- `GET /api/content/homepage/all` - Get all sections
- `POST /api/content/homepage` - Create section
- `PUT /api/content/homepage/:id` - Update section
- `DELETE /api/content/homepage/:id` - Delete section

### Features
- `GET /api/content/features` - Get visible features
- `GET /api/content/features/all` - Get all features
- `POST /api/content/features` - Create feature
- `PUT /api/content/features/:id` - Update feature
- `DELETE /api/content/features/:id` - Delete feature

### Footer
- `GET /api/content/footer` - Get footer content grouped by section
- `POST /api/content/footer` - Create footer link
- `PUT /api/content/footer/:id` - Update footer item
- `DELETE /api/content/footer/:id` - Delete footer item

### Settings
- `GET /api/content/settings` - Get all settings
- `POST /api/content/settings` - Set a setting

### Media
- `GET /api/media/list?folder=products` - List images in folder
- `POST /api/media/upload` - Upload image

## Database

SQLite database at `server/data/database.sqlite`. Contains tables:
- `products`
- `categories`
- `homepage_content`
- `features`
- `footer_content`
- `site_settings`