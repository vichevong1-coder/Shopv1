import { Request, Response, NextFunction } from 'express';
import cloudinary from '../config/cloudinary';

/**
 * POST /api/upload/signature  (Admin)
 * Returns signed params so the frontend can upload directly to Cloudinary.
 * No file ever passes through this server.
 */
export const getUploadSignature = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folder = 'shopv1/products' } = req.body as { folder?: string };

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    res.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (err) {
    next(err);
  }
};
