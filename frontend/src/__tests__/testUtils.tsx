import { render, type RenderOptions } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { UIProvider } from '../context/UIContext'
import authReducer from '../redux/slices/authSlice'
import cartReducer from '../redux/slices/cartSlice'
import productReducer from '../redux/slices/productSlice'
import orderReducer from '../redux/slices/orderSlice'
import type { RootState } from '../redux/store'

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>
  initialRoute?: string
}

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      products: productReducer,
      orders: orderReducer,
    },
    preloadedState,
  })
}

export function renderWithProviders(
  ui: ReactNode,
  { preloadedState, initialRoute = '/', ...options }: RenderWithProvidersOptions = {}
) {
  const store = makeStore(preloadedState)

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <UIProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          {children}
        </MemoryRouter>
      </UIProvider>
    </Provider>
  )

  return { store, ...render(ui, { wrapper: Wrapper, ...options }) }
}
