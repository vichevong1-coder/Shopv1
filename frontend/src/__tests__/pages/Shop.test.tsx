import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../testUtils'
import Shop from '../../pages/Shop'
import type { Product } from '../../types/product'

// productSlice calls productApi.listProducts() — mock the API module
vi.mock('../../api/product', () => ({
  listProducts: vi.fn(),
  getFeaturedProducts: vi.fn().mockResolvedValue({ products: [] }),
  getNewArrivals: vi.fn().mockResolvedValue({ products: [] }),
  getBestSellers: vi.fn().mockResolvedValue({ products: [] }),
  getProduct: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  softDeleteProduct: vi.fn(),
  restoreProduct: vi.fn(),
}))

import * as productApi from '../../api/product'

function makeProduct(id: string, name: string): Product {
  return {
    _id: id,
    name,
    description: '',
    priceInCents: 2999,
    compareAtPriceInCents: undefined,
    category: 'shirt',
    gender: 'unisex',
    brand: 'Nimbus',
    images: [{ url: 'https://example.com/img.jpg', publicId: 'img1' }],
    variants: [{ _id: 'v1', size: 'M', color: 'Black', colorHex: '#000', stock: 5, reservedStock: 0, sku: 'SKU' }],
    tags: [],
    isFeatured: false,
    isActive: true,
    isDeleted: false,
    ratings: { average: 0, count: 0 },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  }
}

const twoProducts = [makeProduct('p1', 'Alpha Tee'), makeProduct('p2', 'Beta Hoodie')]

describe('Shop page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the product grid when items are returned from API', async () => {
    vi.mocked(productApi.listProducts).mockResolvedValue({
      products: twoProducts,
      pagination: { page: 1, limit: 16, total: 2, pages: 1 },
    })
    renderWithProviders(<Shop />)
    await waitFor(() => {
      expect(screen.getByText('Alpha Tee')).toBeInTheDocument()
      expect(screen.getByText('Beta Hoodie')).toBeInTheDocument()
    })
  })

  it('shows skeleton cards while products are loading (API never resolves)', () => {
    // Never-resolving promise keeps the thunk in pending state → isLoading=true
    vi.mocked(productApi.listProducts).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<Shop />)
    // Product names and empty state should both be absent during loading
    expect(screen.queryByText('Alpha Tee')).not.toBeInTheDocument()
    expect(screen.queryByText(/no products found/i)).not.toBeInTheDocument()
  })

  it('shows "No products found" when API returns empty list', async () => {
    vi.mocked(productApi.listProducts).mockResolvedValue({
      products: [],
      pagination: { page: 1, limit: 16, total: 0, pages: 0 },
    })
    renderWithProviders(<Shop />)
    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument()
    })
  })

  it('shows a "Clear filters" button in the empty state', async () => {
    vi.mocked(productApi.listProducts).mockResolvedValue({
      products: [],
      pagination: { page: 1, limit: 16, total: 0, pages: 0 },
    })
    renderWithProviders(<Shop />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument()
    })
  })

  it('changing the sort dropdown triggers fetchProducts with the new sort value', async () => {
    const user = userEvent.setup()
    vi.mocked(productApi.listProducts).mockResolvedValue({
      products: twoProducts,
      pagination: { page: 1, limit: 16, total: 2, pages: 1 },
    })
    renderWithProviders(<Shop />, { initialRoute: '/shop' })

    // Wait for the initial render and sort select to appear
    const sortSelect = await screen.findByRole('combobox')
    await user.selectOptions(sortSelect, 'price_asc')

    await waitFor(() => {
      expect(vi.mocked(productApi.listProducts)).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'price_asc' })
      )
    })
  })

  it('shows the total product count in the toolbar', async () => {
    vi.mocked(productApi.listProducts).mockResolvedValue({
      products: twoProducts,
      pagination: { page: 1, limit: 16, total: 2, pages: 1 },
    })
    renderWithProviders(<Shop />)
    await waitFor(() => {
      expect(screen.getByText(/2 products/i)).toBeInTheDocument()
    })
  })
})
