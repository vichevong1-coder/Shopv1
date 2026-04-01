import { Request, Response } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import Product from '../models/Product';

// GET /admin/users?search=&page=&limit=
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const search = (req.query.search as string)?.trim();

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email role avatar createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// GET /admin/stats
export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [revenueAgg, totalOrders, pendingOrders, totalUsers, totalProducts, recentOrders] =
      await Promise.all([
        Order.aggregate([
          { $match: { paymentProcessed: true } },
          { $group: { _id: null, total: { $sum: '$totalAmountInCents' } } },
        ]),
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: 'pending' }),
        User.countDocuments(),
        Product.countDocuments({ isDeleted: { $ne: true }, isActive: true }),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('user', 'name email')
          .lean(),
      ]);

    res.json({
      totalRevenue: revenueAgg[0]?.total ?? 0,
      totalOrders,
      pendingOrders,
      totalUsers,
      totalProducts,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};
