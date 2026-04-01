import axiosInstance from './axiosInstance';
import type { Product, ProductPagination } from '../types/product';
import type { AdminPagination, Order } from '../types/order';
import type { User } from '../types/user';

// ── Products ──────────────────────────────────────────────────────────────────

interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  includeDeleted?: boolean;
  category?: string;
  gender?: string;
  isActive?: boolean;
}

interface AdminListResponse {
  products: Product[];
  pagination: ProductPagination;
}

export const adminListProducts = async (params: AdminListParams): Promise<AdminListResponse> => {
  const { data } = await axiosInstance.get<AdminListResponse>('/admin/products', { params });
  return data;
};

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Order[];
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const { data } = await axiosInstance.get<AdminStats>('/admin/stats');
  return data;
};

// ── Users ─────────────────────────────────────────────────────────────────────

export interface AdminUser extends User {
  createdAt: string;
}

interface AdminUsersResponse {
  users: AdminUser[];
  pagination: AdminPagination;
}

interface AdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getAdminUsers = async (params: AdminUsersParams): Promise<AdminUsersResponse> => {
  const { data } = await axiosInstance.get<AdminUsersResponse>('/admin/users', { params });
  return data;
};

