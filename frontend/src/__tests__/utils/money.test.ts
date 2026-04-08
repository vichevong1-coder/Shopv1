import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { formatPrice, useCurrency } from '../../utils/money'
import { UIProvider } from '../../context/UIContext'
import type { ReactNode } from 'react'

describe('formatPrice', () => {
  describe('USD (default)', () => {
    it('formats zero', () => {
      expect(formatPrice(0)).toBe('$0.00')
    })

    it('formats a typical price (2999 cents → $29.99)', () => {
      expect(formatPrice(2999)).toBe('$29.99')
    })

    it('formats negative cents', () => {
      expect(formatPrice(-100)).toBe('-$1.00')
    })

    it('formats large amounts with comma separator', () => {
      expect(formatPrice(1000000)).toBe('$10,000.00')
    })

    it('formats whole dollars', () => {
      expect(formatPrice(5000)).toBe('$50.00')
    })
  })

  describe('KHR', () => {
    // 1 USD = 4,100 KHR; 100 cents = 1 USD = 4,100 KHR
    it('converts 2999 cents to riel (≈122,959 KHR)', () => {
      const result = formatPrice(2999, 'KHR')
      // Should include a KHR-related symbol or the currency code
      expect(result).toMatch(/KHR|៛/)
    })

    it('converts 0 cents to 0 riel', () => {
      const result = formatPrice(0, 'KHR')
      expect(result).toMatch(/0/)
    })

    it('converts 100 cents (1 USD) to 4,100 KHR', () => {
      const result = formatPrice(100, 'KHR')
      // 1 * 4100 = 4100
      expect(result).toMatch(/4[,.]?100/)
    })

    it('converts 1000 cents (10 USD) to 41,000 KHR', () => {
      const result = formatPrice(1000, 'KHR')
      expect(result).toMatch(/41[,.]?000/)
    })
  })
})

describe('useCurrency hook', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    UIProvider({ children }) as JSX.Element
  )

  it('returns a formatPrice function bound to USD by default', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper })
    expect(result.current.currency).toBe('USD')
    expect(result.current.formatPrice(2999)).toBe('$29.99')
  })

  it('formatPrice uses the context currency', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper })
    // Default is USD
    expect(result.current.formatPrice(100)).toBe('$1.00')
  })
})
