// src/components/layout/AdminLayout.jsx - WORKING VERSION
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/api';
import AdminSidebar from '../../pages/admin/AdminSidebar';

const AdminLayout = () => {
  const { user, isAuthenticated, updateProfile } = useAuthStore();
  const navigate = useNavigate();
  const [isAdminCheck, setIsAdminCheck] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  
  useEffect(() => {
    const checkAdminAccess = async () => {
      // Giriş yapmamışsa direkt login'e yönlendir
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      
      try {
        // ✅ Backend'den FRESH profil bilgilerini al
        const response = await authService.getProfile();
        const userData = response.data.user;
        
        // ✅ Store'u güncellenmiş user bilgileri ile güncelle
        updateProfile();
        
        console.log('Fresh user data:', userData); // DEBUG LOG
        
        // ✅ is_admin kontrolü
        if (userData.is_admin === 1 || userData.is_admin === true) {
          setIsAdminCheck(true);
          console.log('User is admin!'); // DEBUG LOG
        } else {
          console.log('User is NOT admin, redirecting to /'); // DEBUG LOG
          navigate('/');
        }
      } catch (error) {
        console.error('Admin kontrolü hatası:', error);
        navigate('/login');
      } finally {
        setIsLoadingAdmin(false);
      }
    };
    
    checkAdminAccess();
  }, [isAuthenticated, navigate, updateProfile]);
  
  if (isLoadingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || !isAdminCheck) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;