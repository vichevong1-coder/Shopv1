import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

/**
 * POST /api/upload/signature (Admin)
 * Returns a self-hosted upload URL so the frontend can upload directly.
 */
export const getUploadSignature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folder = 'products' } = req.body as { folder?: string };
    const cleanFolder = folder.replace(/^shopv1\//, '');
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.png`;
    const relativePath = `${cleanFolder}/${filename}`;

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    const signedUrl = `${baseUrl}/api/upload/file/${encodeURIComponent(relativePath)}`;
    const publicUrl = `${baseUrl}/uploads/${relativePath}`;

    res.json({
      signedUrl,
      path: relativePath,
      publicUrl,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/upload/file/*filePath
 * Receives raw binary image data and writes it to disk in uploads directory.
 */
export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = (req.params as any).filePath;
    const pathStr = Array.isArray(raw) ? raw.join('/') : String(raw || '');
    const filePathParam = decodeURIComponent(pathStr);
    if (!filePathParam || filePathParam.includes('..')) {
      return res.status(400).json({ message: 'Invalid file path' });
    }

    const destination = path.join(UPLOADS_DIR, filePathParam);
    fs.mkdirSync(path.dirname(destination), { recursive: true });

    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      fs.writeFileSync(destination, buffer);
      res.status(200).json({ message: 'File uploaded successfully', path: filePathParam });
    });
    req.on('error', (err) => next(err));
  } catch (err) {
    next(err);
  }
};
