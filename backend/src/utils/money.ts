/**
 * Convert dollars to cents
 * @param dollars - Amount in dollars (e.g., 29.99)
 * @returns Amount in cents (e.g., 2999)
 */
export const toCents = (dollars: number): number => {
  return Math.round(dollars * 100);
};

/**
 * Format cents to currency string for display
 * @param cents - Amount in cents
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted currency string (e.g., '$29.99')
 */
export const formatPrice = (
  cents: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  const dollars = cents / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(dollars);
};
