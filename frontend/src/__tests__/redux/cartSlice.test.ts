import { describe, it, expect, beforeEach } from 'vitest'
import cartReducer, {
  addItemLocal,
  updateItemLocal,
  removeItemLocal,
  clearCartLocal,
} from '../../redux/slices/cartSlice'
import type { CartState } from '../../types/cart'

const GUEST_CART_KEY = 'nimbus_guest_cart'
const emptyState: CartState = { items: [], isLoading: false, error: null }

const item1 = {
  _id: 'item-1',
  productId: 'prod-1',
  name: 'Test Shirt',
  image: '',
  size: 'M',
  color: 'Black',
  quantity: 1,
  priceInCents: 2999,
}

const item2 = {
  _id: 'item-2',
  productId: 'prod-2',
  name: 'Test Pant',
  image: '',
  size: 'L',
  color: 'Blue',
  quantity: 2,
  priceInCents: 4999,
}

beforeEach(() => {
  localStorage.clear()
})

describe('cartSlice reducers', () => {
  describe('addItemLocal', () => {
    it('appends a new item when cart is empty', () => {
      const state = cartReducer(emptyState, addItemLocal(item1))
      expect(state.items).toHaveLength(1)
      expect(state.items[0]).toMatchObject({ _id: 'item-1', name: 'Test Shirt' })
    })

    it('appends a new item when no matching product+size+color exists', () => {
      const withItem1: CartState = { ...emptyState, items: [item1] }
      const state = cartReducer(withItem1, addItemLocal(item2))
      expect(state.items).toHaveLength(2)
    })

    it('increments quantity when same productId+size+color exists', () => {
      const withItem1: CartState = { ...emptyState, items: [{ ...item1, quantity: 2 }] }
      const state = cartReducer(withItem1, addItemLocal({ ...item1, quantity: 3 }))
      expect(state.items).toHaveLength(1)
      expect(state.items[0].quantity).toBe(5)
    })

    it('increments quantity when matched by _id', () => {
      const withItem1: CartState = { ...emptyState, items: [{ ...item1, quantity: 1 }] }
      const duplicate = { ...item1, productId: 'different-prod', quantity: 2 }
      const state = cartReducer(withItem1, addItemLocal(duplicate))
      expect(state.items[0].quantity).toBe(3)
    })

    it('persists to localStorage', () => {
      cartReducer(emptyState, addItemLocal(item1))
      expect(localStorage.getItem(GUEST_CART_KEY)).not.toBeNull()
    })
  })

  describe('updateItemLocal', () => {
    it('updates quantity of matching item', () => {
      const withItem1: CartState = { ...emptyState, items: [item1] }
      const state = cartReducer(withItem1, updateItemLocal({ _id: 'item-1', quantity: 5 }))
      expect(state.items[0].quantity).toBe(5)
    })

    it('clamps quantity to minimum of 1', () => {
      const withItem1: CartState = { ...emptyState, items: [item1] }
      const state = cartReducer(withItem1, updateItemLocal({ _id: 'item-1', quantity: 0 }))
      expect(state.items[0].quantity).toBe(1)
    })

    it('clamps negative quantity to 1', () => {
      const withItem1: CartState = { ...emptyState, items: [item1] }
      const state = cartReducer(withItem1, updateItemLocal({ _id: 'item-1', quantity: -3 }))
      expect(state.items[0].quantity).toBe(1)
    })

    it('does nothing for unknown _id', () => {
      const withItem1: CartState = { ...emptyState, items: [item1] }
      const state = cartReducer(withItem1, updateItemLocal({ _id: 'unknown', quantity: 5 }))
      expect(state.items[0].quantity).toBe(1)
    })

    it('persists the updated quantity to localStorage', () => {
      const withItem1: CartState = { ...emptyState, items: [item1] }
      cartReducer(withItem1, updateItemLocal({ _id: 'item-1', quantity: 3 }))
      const stored = JSON.parse(localStorage.getItem(GUEST_CART_KEY)!)
      expect(stored[0].quantity).toBe(3)
    })
  })

  describe('removeItemLocal', () => {
    it('removes item by _id', () => {
      const withBoth: CartState = { ...emptyState, items: [item1, item2] }
      const state = cartReducer(withBoth, removeItemLocal('item-1'))
      expect(state.items).toHaveLength(1)
      expect(state.items[0]._id).toBe('item-2')
    })

    it('does nothing for unknown _id', () => {
      const withItem1: CartState = { ...emptyState, items: [item1] }
      const state = cartReducer(withItem1, removeItemLocal('unknown'))
      expect(state.items).toHaveLength(1)
    })

    it('persists the updated cart to localStorage', () => {
      const withBoth: CartState = { ...emptyState, items: [item1, item2] }
      cartReducer(withBoth, removeItemLocal('item-1'))
      const stored = JSON.parse(localStorage.getItem(GUEST_CART_KEY)!)
      expect(stored).toHaveLength(1)
      expect(stored[0]._id).toBe('item-2')
    })
  })

  describe('clearCartLocal', () => {
    it('empties the items array', () => {
      const withBoth: CartState = { ...emptyState, items: [item1, item2] }
      const state = cartReducer(withBoth, clearCartLocal())
      expect(state.items).toHaveLength(0)
    })

    it('removes the guest cart key from localStorage', () => {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify([item1]))
      cartReducer({ ...emptyState, items: [item1] }, clearCartLocal())
      expect(localStorage.getItem(GUEST_CART_KEY)).toBeNull()
    })
  })
})
