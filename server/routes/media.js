import express from 'express';
import { mkdirSync, readdirSync, writeFileSync, unlinkSync, existsSync, statSync } from 'fs';
import { join, relative, extname } from 'path';

const router = express.Router();

// Serve static media files
const mediaDir = './public/images';

// List all images
router.get('/list', (req, res) => {
  const { folder } = req.query;
  const targetDir = folder ? join(mediaDir, folder) : mediaDir;
  
  if (!existsSync(targetDir)) {
    return res.json([]);
  }
  
  const files = readdirSync(targetDir).map(file => {
    const path = join(targetDir, file);
    const stats = statSync(path);
    return {
      name: file,
      path: `/images/${folder ? folder + '/' : ''}${file}`,
      size: stats.size,
      modified: stats.mtime
    };
  });
  
  res.json(files);
});

// Upload image (multipart form data)
router.post('/upload', (req, res) => {
  if (!req.body || !req.body.image) {
    return res.status(400).json({ error: 'No image data provided' });
  }
  
  const { folder, image } = req.body;
  const targetDir = join(mediaDir, folder || '');
  const filename = `image-${Date.now()}.png`;
  
  mkdirSync(targetDir, { recursive: true });
  
  // Handle base64 image data
  let buffer;
  if (typeof image === 'string' && image.startsWith('data:image')) {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    buffer = Buffer.from(base64Data, 'base64');
  } else if (Buffer.isBuffer(image)) {
    buffer = image;
  } else {
    return res.status(400).json({ error: 'Invalid image data' });
  }
  
  const targetPath = join(targetDir, filename);
  writeFileSync(targetPath, buffer);
  
  res.json({ 
    success: true, 
    path: `/images/${folder ? folder + '/' : ''}${filename}` 
  });
});

// Delete image
router.delete('/delete', (req, res) => {
  const { path: filePath } = req.body;
  const fullPath = join('./public', filePath);
  
  if (existsSync(fullPath)) {
    unlinkSync(fullPath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;