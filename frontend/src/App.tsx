import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { initAuth } from './redux/slices/authSlice';
import { fetchCartThunk, setCartItems, loadGuestCart } from './redux/slices/cartSlice';
import Spinner from './components/common/Spinner';
import Toast from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/common/CartDrawer';
import SearchDialog from './components/common/SearchDialog';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminProducts from './pages/admin/Products';
import EditProduct from './pages/admin/EditProduct';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Profile from './pages/profile/Profile';
import OrderHistory from './pages/profile/OrderHistory';

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

      <Routes>
        {/* Auth — no layout */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password/:token" element={<ResetPassword />} />

        {/* Admin — self-contained layout */}
        <Route
          path="/admin/products/new"
          element={
            <ProtectedRoute adminOnly>
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <ProtectedRoute adminOnly>
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute adminOnly>
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Navigate to="/admin/products" replace />
            </ProtectedRoute>
          }
        />

        {/* Public catalog */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
        <Route path="/shop/:gender" element={<PublicLayout><Shop /></PublicLayout>} />
        <Route path="/shop/category/:cat" element={<PublicLayout><Shop /></PublicLayout>} />
        <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />

        {/* Protected customer routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-confirmation/:id"
          element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
