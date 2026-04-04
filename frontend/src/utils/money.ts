import { useContext } from 'react';
import type { Currency } from '../context/UIContext';
// UIContext imported lazily to avoid circular deps — use the hook below for components
import { UIContext } from '../context/UIContext';

// 1 USD = 4,100 KHR (approximate fixed rate)
const KHR_RATE = 4100;

export const formatPrice = (cents: number, currency: Currency = 'USD'): string => {
  if (currency === 'KHR') {
    const riel = Math.round((cents / 100) * KHR_RATE);
    return new Intl.NumberFormat('km-KH', {
      style: 'currency',
      currency: 'KHR',
      maximumFractionDigits: 0,
    }).format(riel);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
};

/** Returns a formatPrice function pre-bound to the currently selected currency. */
export const useCurrency = () => {
  const ctx = useContext(UIContext);
  const currency: Currency = ctx?.currency ?? 'USD';
  return {
    currency,
    formatPrice: (cents: number) => formatPrice(cents, currency),
  };
};
