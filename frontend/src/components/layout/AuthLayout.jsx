import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <Outlet />;
};

export default AuthLayout;