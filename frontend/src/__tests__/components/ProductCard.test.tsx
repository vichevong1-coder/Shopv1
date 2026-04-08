import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import ProductCard from '../../components/product/ProductCard'
import { renderWithProviders } from '../testUtils'
import type { Product } from '../../types/product'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    _id: 'prod-1',
    name: 'Classic Tee',
    description: 'A classic t-shirt',
    priceInCents: 2999,
    compareAtPriceInCents: undefined,
    category: 'shirt',
    gender: 'unisex',
    brand: 'Nimbus',
    images: [{ url: 'https://example.com/img.jpg', publicId: 'img1' }],
    variants: [
      { _id: 'v1', size: 'M', color: 'Black', colorHex: '#000000', stock: 10, reservedStock: 0, sku: 'SKU-1' },
    ],
    tags: [],
    isFeatured: false,
    isActive: true,
    isDeleted: false,
    ratings: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    ...overrides,
  }
}

describe('ProductCard', () => {
  it('renders the product name', () => {
    renderWithProviders(<ProductCard product={makeProduct()} />)
    expect(screen.getByText('Classic Tee')).toBeInTheDocument()
  })

  it('renders the product brand', () => {
    renderWithProviders(<ProductCard product={makeProduct()} />)
    expect(screen.getByText('Nimbus')).toBeInTheDocument()
  })

  it('renders the formatted price', () => {
    renderWithProviders(<ProductCard product={makeProduct({ priceInCents: 2999 })} />)
    expect(screen.getAllByText('$29.99').length).toBeGreaterThan(0)
  })

  it('shows sale badge when compareAtPriceInCents > priceInCents', () => {
    renderWithProviders(
      <ProductCard product={makeProduct({ priceInCents: 2000, compareAtPriceInCents: 4000 })} />
    )
    expect(screen.getByText(/save 50%/i)).toBeInTheDocument()
  })

  it('does not show sale badge when no compareAtPriceInCents', () => {
    renderWithProviders(<ProductCard product={makeProduct({ compareAtPriceInCents: undefined })} />)
    expect(screen.queryByText(/save/i)).not.toBeInTheDocument()
  })

  it('does not show sale badge when compareAtPriceInCents <= priceInCents', () => {
    renderWithProviders(
      <ProductCard product={makeProduct({ priceInCents: 4000, compareAtPriceInCents: 2000 })} />
    )
    expect(screen.queryByText(/save/i)).not.toBeInTheDocument()
  })

  it('shows star rating when ratings.count > 0', () => {
    renderWithProviders(
      <ProductCard product={makeProduct({ ratings: { average: 4.5, count: 12, distribution: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 8 } } })} />
    )
    expect(screen.getByText(/4\.5.*12/)).toBeInTheDocument()
  })

  it('does not show star rating when ratings.count = 0', () => {
    renderWithProviders(<ProductCard product={makeProduct({ ratings: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } } })} />)
    // StarRating returns null when count=0
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument()
  })

  it('renders color swatches for each unique variant color', () => {
    const variants = [
      { _id: 'v1', size: 'M', color: 'Black', colorHex: '#000', stock: 5, reservedStock: 0, sku: 'A' },
      { _id: 'v2', size: 'L', color: 'Black', colorHex: '#000', stock: 5, reservedStock: 0, sku: 'B' }, // duplicate color
      { _id: 'v3', size: 'M', color: 'White', colorHex: '#fff', stock: 5, reservedStock: 0, sku: 'C' },
    ]
    renderWithProviders(<ProductCard product={makeProduct({ variants })} />)
    // 2 unique colors → 2 swatch buttons
    const swatches = screen.getAllByRole('button').filter(b => b.getAttribute('title'))
    expect(swatches).toHaveLength(2)
  })
})
