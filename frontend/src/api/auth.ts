import axios from 'axios';
import axiosInstance from './axiosInstance';
import type { User } from '../types/user';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

interface AuthResponse {
  user: User;
  accessToken: string;
  message: string;
}

export const register = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const { data: res } = await axiosInstance.post<AuthResponse>('/auth/register', data);
  return res;
};

export const login = async (credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const { data: res } = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
  return res;
};

export const logout = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout');
};

export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const { data } = await axios.post<{ accessToken: string }>(
    `${BASE_URL}/auth/token`,
    {},
    { withCredentials: true }
  );
  return data;
};

export const getMe = async (token?: string): Promise<{ user: User }> => {
  const { data } = await axiosInstance.get<{ user: User }>('/auth/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return data;
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const { data } = await axiosInstance.post<{ message: string }>('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (
  token: string,
  password: string
): Promise<{ message: string }> => {
  const { data } = await axiosInstance.post<{ message: string }>(
    `/auth/reset-password/${token}`,
    { password }
  );
  return data;
};
