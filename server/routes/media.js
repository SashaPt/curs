import express from 'express';
import { mkdirSync, readdirSync, unlinkSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { processAndSaveImage, ensureUploadDir } from '../utils/imageProcessor.js';

const router = express.Router();

const uploadDir = join(process.cwd(), 'upload', 'images');
const legacyDir = join(process.cwd(), 'public', 'images');

ensureUploadDir();

router.get('/list', (req, res) => {
  const { folder } = req.query;
  const targetDir = folder ? join(legacyDir, folder) : uploadDir;

  if (!existsSync(targetDir)) {
    return res.json([]);
  }

  const files = readdirSync(targetDir).map(file => {
    const path = join(targetDir, file);
    const stats = statSync(path);
    const isUpload = targetDir === uploadDir;
    return {
      name: file,
      path: isUpload ? `/upload/images/${file}` : `/images/${folder ? folder + '/' : ''}${file}`,
      size: stats.size,
      modified: stats.mtime
    };
  });

  res.json(files);
});

router.post('/upload', async (req, res) => {
  try {
    if (!req.body || !req.body.image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const { image, filename } = req.body;
    let buffer;

    if (typeof image === 'string' && image.startsWith('data:image')) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    } else if (Buffer.isBuffer(image)) {
      buffer = image;
    } else {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    const result = await processAndSaveImage(buffer, filename || 'image.png');

    res.json({
      success: true,
      path: result.path,
      fallback: result.fallback,
      webp: result.webp,
      webp_supported: result.webp_supported
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete', (req, res) => {
  const { path: filePath } = req.body;
  const fullPath = filePath.startsWith('/upload/')
    ? join(process.cwd(), filePath.replace(/^\//, ''))
    : join(process.cwd(), 'public', filePath.replace(/^\//, ''));

  if (existsSync(fullPath)) {
    unlinkSync(fullPath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
