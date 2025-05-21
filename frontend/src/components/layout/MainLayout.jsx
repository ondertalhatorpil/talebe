import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Header from './Header';

const MainLayout = () => {
  const { isAuthenticated, loading } = useAuthStore();
  const location = useLocation();
  
  const hideHeaderPaths = ['/quiz'];
  
  const shouldHideHeader = hideHeaderPaths.some(path => 
    location.pathname.startsWith(path)
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header'ı sadece gerekli sayfalarda göster */}
      {!shouldHideHeader && <Header />}
      
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;