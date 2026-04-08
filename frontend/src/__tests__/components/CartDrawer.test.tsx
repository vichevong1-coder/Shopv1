import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import CartDrawer from '../../components/common/CartDrawer'
import { UIProvider, useUI } from '../../context/UIContext'
import { makeStore } from '../testUtils'
import type { CartItem } from '../../types/cart'

// Helper: a component that opens the cart on mount then renders CartDrawer
const CartOpener = () => {
  const { openCart } = useUI()
  // Use a ref-style approach: render a button that opens cart
  return (
    <>
      <button onClick={openCart} data-testid="open-cart">Open</button>
      <CartDrawer />
    </>
  )
}

function renderCartDrawer(
  cartItems: CartItem[] = [],
  authUser: object | null = null
) {
  const store = makeStore({
    cart: { items: cartItems, isLoading: false, error: null },
    auth: {
      user: authUser as never,
      accessToken: null,
      isLoading: false,
      isInitialized: true,
      error: null,
    },
  })

  const result = render(
    <Provider store={store}>
      <UIProvider>
        <MemoryRouter>
          <CartOpener />
        </MemoryRouter>
      </UIProvider>
    </Provider>
  )

  return { store, ...result }
}

const makeItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  _id: 'item-1',
  productId: 'prod-1',
  name: 'Test Shirt',
  image: '',
  size: 'M',
  color: 'Black',
  quantity: 2,
  priceInCents: 2999,
  ...overrides,
})

describe('CartDrawer', () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {})
  })

  it('does not render the drawer when cart is closed', () => {
    const store = makeStore()
    render(
      <Provider store={store}>
        <UIProvider>
          <MemoryRouter>
            <CartDrawer />
          </MemoryRouter>
        </UIProvider>
      </Provider>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog when cart is opened', async () => {
    const user = userEvent.setup()
    renderCartDrawer()
    await user.click(screen.getByTestId('open-cart'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows empty state when there are no items', async () => {
    const user = userEvent.setup()
    renderCartDrawer([])
    await user.click(screen.getByTestId('open-cart'))
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })

  it('shows item name when cart has items', async () => {
    const user = userEvent.setup()
    renderCartDrawer([makeItem({ name: 'Cool Hoodie' })])
    await user.click(screen.getByTestId('open-cart'))
    expect(screen.getByText('Cool Hoodie')).toBeInTheDocument()
  })

  it('shows item count in the header', async () => {
    const user = userEvent.setup()
    renderCartDrawer([makeItem(), makeItem({ _id: 'item-2', productId: 'prod-2' })])
    await user.click(screen.getByTestId('open-cart'))
    expect(screen.getByText(/\(2\)/)).toBeInTheDocument()
  })

  it('shows size and color for each item', async () => {
    const user = userEvent.setup()
    renderCartDrawer([makeItem({ size: 'L', color: 'Red' })])
    await user.click(screen.getByTestId('open-cart'))
    expect(screen.getByText(/L.*Red/)).toBeInTheDocument()
  })

  it('calculates subtotal, 10% tax, and total correctly', async () => {
    const user = userEvent.setup()
    // 1 item, qty 2: subtotal = 2999*2 = 5998 = $59.98
    // tax = Math.round(5998 * 0.1) = 600 = $6.00; total = 6598 = $65.98
    // Note: $59.98 appears twice (line total + subtotal row) so use getAllByText
    renderCartDrawer([makeItem({ priceInCents: 2999, quantity: 2 })])
    await user.click(screen.getByTestId('open-cart'))
    expect(screen.getAllByText('$59.98').length).toBeGreaterThanOrEqual(1) // subtotal
    expect(screen.getByText('$6.00')).toBeInTheDocument()  // tax
    expect(screen.getByText('$65.98')).toBeInTheDocument() // total
  })

  it('closes when the X button is clicked', async () => {
    const user = userEvent.setup()
    renderCartDrawer([makeItem()])
    await user.click(screen.getByTestId('open-cart'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Close cart'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('dispatches removeItemLocal when guest clicks Remove', async () => {
    const user = userEvent.setup()
    const { store } = renderCartDrawer([makeItem()])
    await user.click(screen.getByTestId('open-cart'))
    await user.click(screen.getByText('Remove'))
    expect(store.getState().cart.items).toHaveLength(0)
  })

  it('dispatches updateItemLocal when guest clicks + button', async () => {
    const user = userEvent.setup()
    const { store } = renderCartDrawer([makeItem({ quantity: 1 })])
    await user.click(screen.getByTestId('open-cart'))
    const plusBtn = screen.getAllByRole('button').find(b => b.textContent === '+')!
    await user.click(plusBtn)
    expect(store.getState().cart.items[0].quantity).toBe(2)
  })
})
