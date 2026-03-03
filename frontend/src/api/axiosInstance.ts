import axios from 'axios';
import { setAccessToken, clearAuth } from '../redux/slices/authSlice';


let storeRef: any;

export const setupAxios = (store: any) => { storeRef = store; };

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
});

// Attach access token — skip if request already has an Authorization header
axiosInstance.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const token: string | null = storeRef?.getState()?.auth?.accessToken ?? null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Silent token refresh on 401 with concurrent-request queuing
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    // Skip refresh for auth endpoints — they use 401 as a normal response (e.g. wrong password)
    const isAuthEndpoint = original?.url?.includes('/auth/');
    if (error.response?.status !== 401 || original._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      const newToken: string = data.accessToken;
      storeRef?.dispatch(setAccessToken(newToken));
      processQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      storeRef?.dispatch(clearAuth());
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
