import { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabase';

const BUCKET = 'Products';

/**
 * POST /api/upload/signature  (Admin)
 * Returns a Supabase signed upload URL so the frontend can upload directly.
 * No file ever passes through this server.
 *
 * Requires: "products" bucket created in Supabase Storage with appropriate policies.
 */
export const getUploadSignature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folder = 'shopv1/products' } = req.body as { folder?: string };
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    res.json({ signedUrl: data.signedUrl, path, publicUrl });
  } catch (err) {
    next(err);
  }
};
