import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface UIState {
  cartDrawerOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  toast: Toast | null;
}

type UIAction =
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'OPEN_MOBILE_MENU' }
  | { type: 'CLOSE_MOBILE_MENU' }
  | { type: 'OPEN_SEARCH' }
  | { type: 'CLOSE_SEARCH' }
  | { type: 'SHOW_TOAST'; payload: { message: string; type: ToastType } }
  | { type: 'CLEAR_TOAST' };

interface UIContextValue extends UIState {
  openCart: () => void;
  closeCart: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  showToast: (message: string, type?: ToastType) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

const initialState: UIState = {
  cartDrawerOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
  toast: null,
};

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case 'OPEN_CART':        return { ...state, cartDrawerOpen: true };
    case 'CLOSE_CART':       return { ...state, cartDrawerOpen: false };
    case 'OPEN_MOBILE_MENU': return { ...state, mobileMenuOpen: true };
    case 'CLOSE_MOBILE_MENU':return { ...state, mobileMenuOpen: false };
    case 'OPEN_SEARCH':      return { ...state, searchOpen: true };
    case 'CLOSE_SEARCH':     return { ...state, searchOpen: false };
    case 'SHOW_TOAST':
      return { ...state, toast: { id: Date.now().toString(), ...action.payload } };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
  }
};

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  useEffect(() => {
    if (!state.toast) return;
    const timer = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3000);
    return () => clearTimeout(timer);
  }, [state.toast]);

  const value: UIContextValue = {
    ...state,
    openCart:        () => dispatch({ type: 'OPEN_CART' }),
    closeCart:       () => dispatch({ type: 'CLOSE_CART' }),
    openMobileMenu:  () => dispatch({ type: 'OPEN_MOBILE_MENU' }),
    closeMobileMenu: () => dispatch({ type: 'CLOSE_MOBILE_MENU' }),
    openSearch:      () => dispatch({ type: 'OPEN_SEARCH' }),
    closeSearch:     () => dispatch({ type: 'CLOSE_SEARCH' }),
    showToast: (message, type = 'info') =>
      dispatch({ type: 'SHOW_TOAST', payload: { message, type } }),
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = (): UIContextValue => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};
