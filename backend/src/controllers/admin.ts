import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

import prisma from '../config/prisma';
import { formatOrder } from './order';

// GET /admin/users?search=&page=&limit=
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const search = (req.query.search as string)?.trim();

    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((u) => ({
      _id: u.id,
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));

    res.json({
      users: formattedUsers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// GET /admin/stats
export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [revenueAgg, totalOrders, pendingOrders, totalUsers, totalProducts, rawRecentOrders, potentialLowStock] =
      await Promise.all([
        prisma.order.aggregate({
          where: { paymentProcessed: true },
          _sum: { totalAmountInCents: true },
        }),
        prisma.order.count(),
        prisma.order.count({ where: { orderStatus: 'pending' } }),
        prisma.user.count(),
        prisma.product.count({ where: { isDeleted: false, isActive: true } }),
        prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            items: true,
            user: { select: { id: true, name: true, email: true } },
          },
        }),
        prisma.productVariant.findMany({
          where: { stock: { lte: 20 }, product: { isDeleted: false, isActive: true } },
          include: { product: { select: { id: true, name: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 } } } },
        }),
      ]);

    const lowStockItems = potentialLowStock
      .filter((v: any) => v.stock - v.reservedStock <= 5)
      .map((v: any) => ({
        productId: v.productId,
        variantId: v.id,
        name: v.product.name,
        image: v.product.images[0]?.url || '',
        size: v.size,
        color: v.color,
        availableStock: v.stock - v.reservedStock,
      }))
      .sort((a: any, b: any) => a.availableStock - b.availableStock);

    res.json({
      totalRevenue: revenueAgg._sum.totalAmountInCents ?? 0,
      totalOrders,
      pendingOrders,
      totalUsers,
      totalProducts,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.slice(0, 10),
      recentOrders: rawRecentOrders.map(formatOrder),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};
