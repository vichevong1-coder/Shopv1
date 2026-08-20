import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';

export const formatProduct = (p: any) => {
  if (!p) return null;
  return {
    _id: p.id,
    id: p.id,
    name: p.name,
    description: p.description,
    priceInCents: p.priceInCents,
    compareAtPriceInCents: p.compareAtPriceInCents,
    category: p.category,
    gender: p.gender,
    brand: p.brand,
    tags: p.tags || [],
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    isDeleted: p.isDeleted,
    deletedAt: p.deletedAt,
    ratings: {
      average: p.ratingAverage ?? 0,
      count: p.ratingCount ?? 0,
      distribution: {
        1: p.ratingDist1 ?? 0,
        2: p.ratingDist2 ?? 0,
        3: p.ratingDist3 ?? 0,
        4: p.ratingDist4 ?? 0,
        5: p.ratingDist5 ?? 0,
      },
    },
    images: (p.images || []).map((img: any) => ({
      _id: img.id,
      id: img.id,
      url: img.url,
      publicId: img.publicId,
    })),
    variants: (p.variants || []).map((v: any) => ({
      _id: v.id,
      id: v.id,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      stock: v.stock,
      reservedStock: v.reservedStock,
      sku: v.sku,
    })),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

/**
 * GET /api/products
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
      isFeatured,
    } = req.query as Record<string, string>;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      isDeleted: false,
    };

    if (gender) where.gender = gender;
    if (category) where.category = category;
    if (brand) where.brand = { equals: brand, mode: 'insensitive' };
    if (isFeatured === 'true') where.isFeatured = true;

    if (minPrice || maxPrice) {
      where.priceInCents = {};
      if (minPrice) where.priceInCents.gte = Number(minPrice);
      if (maxPrice) where.priceInCents.lte = Number(maxPrice);
    }

    if (size || color) {
      where.variants = {
        some: {
          ...(size ? { size: { equals: size, mode: 'insensitive' } } : {}),
          ...(color ? { color: { equals: color, mode: 'insensitive' } } : {}),
        },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {
      createdAt: 'desc',
    };

    switch (sort) {
      case 'featured':
        orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'createdAt_asc':
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price_asc':
        orderBy = { priceInCents: 'asc' };
        break;
      case 'price_desc':
        orderBy = { priceInCents: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'popular':
        orderBy = [{ ratingCount: 'desc' }, { ratingAverage: 'desc' }];
        break;
      case 'rating_desc':
        orderBy = { ratingAverage: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [rawProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    const products = rawProducts.map(formatProduct);

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

/** GET /api/products/new-arrivals */
export const getNewArrivals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = await prisma.product.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
    });
    res.json({ products: raw.map(formatProduct) });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/best-sellers */
export const getBestSellers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = await prisma.product.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: [{ ratingCount: 'desc' }, { createdAt: 'desc' }],
      take: 8,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
    });
    res.json({ products: raw.map(formatProduct) });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/featured */
export const getFeaturedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = await prisma.product.findMany({
      where: { isFeatured: true, isActive: true, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
    });
    res.json({ products: raw.map(formatProduct) });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/:id */
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const raw = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
    });
    if (!raw || (raw.isDeleted && !req.query.includeDeleted)) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product: formatProduct(raw) });
  } catch (err) {
    next(err);
  }
};

/** POST /api/products (Admin) */
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { images = [], variants = [], ...data } = req.body;

    const raw = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        compareAtPriceInCents: data.compareAtPriceInCents,
        category: data.category,
        gender: data.gender,
        brand: data.brand,
        tags: data.tags || [],
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
        images: {
          create: images.map((img: any, idx: number) => ({
            url: img.url,
            publicId: img.publicId || '',
            sortOrder: idx,
          })),
        },
        variants: {
          create: variants.map((v: any) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stock: v.stock ?? 0,
            reservedStock: v.reservedStock ?? 0,
            sku: v.sku || '',
          })),
        },
      },
      include: {
        images: true,
        variants: true,
      },
    });

    res.status(201).json({ product: formatProduct(raw) });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/products/:id (Admin) */
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { images, variants, ratings, ...data } = req.body;

    const updateData: Prisma.ProductUpdateInput = {
      ...data,
    };

    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      updateData.images = {
        create: images.map((img: any, idx: number) => ({
          url: img.url,
          publicId: img.publicId || '',
          sortOrder: idx,
        })),
      };
    }

    if (variants && Array.isArray(variants)) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      updateData.variants = {
        create: variants.map((v: any) => ({
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          stock: v.stock ?? 0,
          reservedStock: v.reservedStock ?? 0,
          sku: v.sku || '',
        })),
      };
    }

    const raw = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        variants: true,
      },
    });

    res.json({ product: formatProduct(raw) });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/products/:id/soft-delete (Admin) */
export const softDeleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const raw = await prisma.product.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
      include: { images: true, variants: true },
    });
    res.json({ message: 'Product deleted', product: formatProduct(raw) });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/products/:id/restore (Admin) */
export const restoreProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const raw = await prisma.product.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        isActive: true,
      },
      include: { images: true, variants: true },
    });
    res.json({ message: 'Product restored', product: formatProduct(raw) });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/products (Admin) */
export const adminListProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', search, includeDeleted, category, gender, isActive } = req.query as Record<string, string>;

    const where: Prisma.ProductWhereInput = {};

    if (includeDeleted !== 'true') {
      where.isDeleted = false;
    }

    if (category) where.category = category;
    if (gender) where.gender = gender;
    if (isActive === 'true') where.isActive = true;
    if (isActive === 'false') where.isActive = false;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [rawProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products: rawProducts.map(formatProduct),
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};
