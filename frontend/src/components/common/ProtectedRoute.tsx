import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAppSelector } from '../../redux/hooks';
import Spinner from './Spinner';

interface Props {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: Props) => {
  const { user, isInitialized } = useAppSelector((s) => s.auth);

  if (!isInitialized) return <Spinner fullPage />;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
