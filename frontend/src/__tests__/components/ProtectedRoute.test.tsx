import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '../testUtils'
import ProtectedRoute from '../../components/common/ProtectedRoute'

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'customer' as const,
}

const adminUser = { ...mockUser, role: 'admin' as const }

describe('ProtectedRoute', () => {
  it('renders a spinner when auth is not yet initialized', () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
      {
        preloadedState: {
          auth: { user: null, accessToken: null, isLoading: false, isInitialized: false, error: null },
        },
      }
    )
    // Spinner renders an svg; protected content should not be visible
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('redirects unauthenticated users to /auth/login', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Protected content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/auth/login" element={<div>Login page</div>} />
      </Routes>,
      {
        preloadedState: {
          auth: { user: null, accessToken: null, isLoading: false, isInitialized: true, error: null },
        },
      }
    )
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects non-admin users to / when adminOnly=true', () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<div>Home page</div>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <div>Admin content</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      {
        preloadedState: {
          auth: { user: mockUser, accessToken: 'tok', isLoading: false, isInitialized: true, error: null },
        },
        initialRoute: '/admin',
      }
    )
    expect(screen.getByText('Home page')).toBeInTheDocument()
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument()
  })

  it('renders children for authenticated users', () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
      {
        preloadedState: {
          auth: { user: mockUser, accessToken: 'tok', isLoading: false, isInitialized: true, error: null },
        },
      }
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('renders children for admin users when adminOnly=true', () => {
    renderWithProviders(
      <ProtectedRoute adminOnly>
        <div>Admin content</div>
      </ProtectedRoute>,
      {
        preloadedState: {
          auth: { user: adminUser, accessToken: 'tok', isLoading: false, isInitialized: true, error: null },
        },
      }
    )
    expect(screen.getByText('Admin content')).toBeInTheDocument()
  })
})
