import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'upload', 'images');

export function ensureUploadDir() {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function processAndSaveImage(buffer, originalName = 'image') {
  ensureUploadDir();

  const timestamp = Date.now();
  const baseName = `image-${timestamp}`;
  const ext = extname(originalName).toLowerCase() || '.png';
  const validExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) ? ext : '.png';
  const originalFilename = `${baseName}${validExt === '.jpeg' ? '.jpg' : validExt}`;
  const originalPath = join(UPLOAD_DIR, originalFilename);

  writeFileSync(originalPath, buffer);

  let webpPath = null;
  let webpSupported = true;

  try {
    const webpFilename = `${baseName}.webp`;
    const webpFullPath = join(UPLOAD_DIR, webpFilename);

    await sharp(buffer)
      .webp({ quality: 85 })
      .toFile(webpFullPath);

    webpPath = `/upload/images/${webpFilename}`;
  } catch {
    webpSupported = false;
  }

  const fallbackPath = `/upload/images/${originalFilename}`;

  return {
    path: webpSupported ? webpPath : fallbackPath,
    fallback: fallbackPath,
    webp: webpPath,
    webp_supported: webpSupported
  };
}
