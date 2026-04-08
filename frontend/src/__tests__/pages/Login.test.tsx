import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '../testUtils'
import Login from '../../pages/auth/Login'

// Mock the API layer so no real HTTP calls are made
vi.mock('../../api/auth', () => ({
  login: vi.fn(),
  refreshToken: vi.fn().mockRejectedValue(new Error('no session')),
  getMe: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
}))

// mergeCart API also gets called on successful login
vi.mock('../../api/cart', () => ({
  fetchCart: vi.fn().mockResolvedValue({ items: [] }),
  mergeCart: vi.fn().mockResolvedValue({ items: [] }),
  addItem: vi.fn(),
  updateItem: vi.fn(),
  removeItem: vi.fn(),
  clearCart: vi.fn(),
}))

import * as authApi from '../../api/auth'

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'customer' as const,
}

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the sign in heading and form fields', () => {
    renderWithProviders(<Login />)
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows an error message when auth.error is set', () => {
    renderWithProviders(<Login />, {
      preloadedState: {
        auth: {
          user: null,
          accessToken: null,
          isLoading: false,
          isInitialized: true,
          error: 'Invalid credentials',
        },
      },
    })
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  it('submits email and password to loginThunk', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValue({
      user: mockUser,
      accessToken: 'access-token',
      message: 'OK',
    })

    renderWithProviders(<Login />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('shows error state when login fails', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockRejectedValue({
      response: { data: { message: 'Wrong password' } },
    })

    renderWithProviders(<Login />)

    await user.type(screen.getByLabelText(/email/i), 'bad@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Wrong password')).toBeInTheDocument()
    })
  })

  it('redirects already-logged-in users away from the login page', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/" element={<div>Home page</div>} />
      </Routes>,
      {
        preloadedState: {
          auth: {
            user: mockUser,
            accessToken: 'tok',
            isLoading: false,
            isInitialized: true,
            error: null,
          },
        },
        initialRoute: '/auth/login',
      }
    )
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /sign in/i })).not.toBeInTheDocument()
      expect(screen.getByText('Home page')).toBeInTheDocument()
    })
  })
})
