import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { initAuth } from './redux/slices/authSlice';
import Spinner from './components/common/Spinner';
import Toast from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

const App = () => {
  const dispatch = useAppDispatch();
  const { isInitialized } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  if (!isInitialized) return <Spinner fullPage />;

  return (
    <>
      <Toast />
      <Routes>
        {/* Auth */}
        <Route path="/auth/login"                element={<Login />} />
        <Route path="/auth/register"             element={<Register />} />
        <Route path="/auth/forgot-password"      element={<ForgotPassword />} />
        <Route path="/auth/reset-password/:token" element={<ResetPassword />} />

        {/* Protected placeholder — expanded in later build steps */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
                <h2>Home — coming soon</h2>
              </div>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
