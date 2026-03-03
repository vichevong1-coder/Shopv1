export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  avatar?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null; // memory only — never persisted to localStorage
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}
