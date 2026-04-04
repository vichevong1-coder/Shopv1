import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { initAuth } from './redux/slices/authSlice';
import { fetchCartThunk, setCartItems, loadGuestCart } from './redux/slices/cartSlice';
import Spinner from './components/common/Spinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import Toast from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/common/CartDrawer';
import SearchDialog from './components/common/SearchDialog';
import ScrollToTopButton from './components/common/ScrollToTopButton';

// Eagerly loaded — critical path / above the fold
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Home from './pages/Home';
import Shop from './pages/Shop';

// Lazily loaded — heavier or less frequently visited
const About            = lazy(() => import('./pages/About'));
const Contact          = lazy(() => import('./pages/Contact'));
const ProductDetail    = lazy(() => import('./pages/ProductDetail'));
const Cart             = lazy(() => import('./pages/Cart'));
const Checkout         = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Profile          = lazy(() => import('./pages/profile/Profile'));
const OrderHistory     = lazy(() => import('./pages/profile/OrderHistory'));
const NotFound         = lazy(() => import('./pages/NotFound'));

const AdminDashboard   = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts    = lazy(() => import('./pages/admin/Products'));
const AdminOrders      = lazy(() => import('./pages/admin/Orders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const AdminUsers       = lazy(() => import('./pages/admin/Users'));
const EditProduct      = lazy(() => import('./pages/admin/EditProduct'));

const PageSpinner = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Spinner size="lg" />
  </div>
);

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Navbar />
    <main style={{ flex: 1 }}>{children}</main>
    <Footer />
  </div>
);

const App = () => {
  const dispatch = useAppDispatch();
  const { isInitialized } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(initAuth()).then((result) => {
      if (initAuth.fulfilled.match(result)) {
        dispatch(fetchCartThunk());
      } else {
        dispatch(setCartItems(loadGuestCart()));
      }
    });
  }, [dispatch]);

  if (!isInitialized) return <Spinner fullPage />;

  return (
    <>
      <Toast />
      <CartDrawer />
      <SearchDialog />
      <ScrollToTopButton />

      <ErrorBoundary>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            {/* Auth — no layout */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password/:token" element={<ResetPassword />} />

            {/* Admin — self-contained layout */}
            <Route path="/admin/products/new" element={<ProtectedRoute adminOnly><EditProduct /></ProtectedRoute>} />
            <Route path="/admin/products/:id/edit" element={<ProtectedRoute adminOnly><EditProduct /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/orders/:id" element={<ProtectedRoute adminOnly><AdminOrderDetail /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

            {/* Public catalog */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
            <Route path="/shop/:gender" element={<PublicLayout><Shop /></PublicLayout>} />
            <Route path="/shop/category/:cat" element={<PublicLayout><Shop /></PublicLayout>} />
            <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
            <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

            {/* Protected customer routes */}
            <Route path="/profile" element={<ProtectedRoute><PublicLayout><Profile /></PublicLayout></ProtectedRoute>} />
            <Route path="/profile/orders" element={<ProtectedRoute><PublicLayout><OrderHistory /></PublicLayout></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

export default App;
