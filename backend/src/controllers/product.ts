import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';

// ─── Public ──────────────────────────────────────────────────────────────────

/**
 * GET /api/products
 * Query params: gender, category, size, color, minPrice, maxPrice,
 *               sort, page, limit, search, brand, tags
 */
export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      gender,
      category,
      size,
      color,
      minPrice,
      maxPrice,
      sort = 'createdAt_desc',
      page = '1',
      limit = '20',
      search,
      brand,
    } = req.query as Record<string, string>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { isActive: true };

    if (gender) filter.gender = gender;
    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    if (minPrice || maxPrice) {
      filter.priceInCents = {};
      if (minPrice) filter.priceInCents.$gte = Number(minPrice);
      if (maxPrice) filter.priceInCents.$lte = Number(maxPrice);
    }

    if (size || color) {
      const variantFilter: Record<string, string> = {};
      if (size) variantFilter['variants.size'] = size;
      if (color) variantFilter['variants.color'] = color;
      Object.assign(filter, variantFilter);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      createdAt_desc: { createdAt: -1 },
      createdAt_asc: { createdAt: 1 },
      price_asc: { priceInCents: 1 },
      price_desc: { priceInCents: -1 },
      name_asc: { name: 1 },
      rating_desc: { 'ratings.average': -1 },
    };
    const sortQuery = sortMap[sort] ?? { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortQuery).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/featured */
export const getFeaturedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/:id */
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

/** POST /api/products  (Admin) */
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/products/:id  (Admin) */
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Bypass the isDeleted pre-find hook so admin can update a deleted product if needed
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/products/:id/soft-delete  (Admin) */
export const softDeleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { isDeleted: true, deletedAt: new Date(), isActive: false },
      { returnDocument: 'after' }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted', product });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/products/:id/restore  (Admin) */
export const restoreProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, isDeleted: true },
      { isDeleted: false, deletedAt: undefined, isActive: true },
      { returnDocument: 'after' }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product restored', product });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/products  (Admin — includes deleted) */
export const adminListProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', search, includeDeleted } = req.query as Record<string, string>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    // Setting isDeleted explicitly bypasses the pre-find auto-exclude hook
    filter.isDeleted = includeDeleted === 'true' ? { $in: [true, false] } : { $ne: true };
    if (search) filter.$text = { $search: search };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};
