// src/components/admin/AdminHeader.jsx
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

const AdminHeader = () => {
  const { user, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold">
              {user?.first_name?.[0] || 'A'}
            </div>
            <span>{user?.first_name} {user?.last_name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg z-10">
              <button
                onClick={logout}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;