import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { initDatabase } from './database.js';
import contentRoutes from './routes/content.js';
import mediaRoutes from './routes/media.js';
import acfRoutes from './routes/acf.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/upload', express.static(join(process.cwd(), 'upload')));
app.use('/images', express.static(join(process.cwd(), 'public', 'images')));

// Initialize database then start server
async function startServer() {
  try {
    await initDatabase();
    console.log('Database initialized');
    
    // Routes
    app.use('/api/content', contentRoutes);
    app.use('/api/media', mediaRoutes);
    app.use('/api/acf', acfRoutes);
    
    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();