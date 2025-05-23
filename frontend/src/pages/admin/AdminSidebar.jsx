// src/components/admin/AdminSidebar.jsx
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-600';
  };
  
  return (
    <div className="w-64 bg-indigo-800 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-indigo-700">
        <h2 className="text-xl font-bold">talebe</h2>
        <p className="text-xs text-indigo-300">Admin Panel</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          <li>
            <Link 
              to="/admin" 
              className={`block px-4 py-2 rounded ${isActive('/admin')}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/categories" 
              className={`block px-4 py-2 rounded ${isActive('/admin/categories')}`}
            >
              Kategoriler
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/questions" 
              className={`block px-4 py-2 rounded ${isActive('/admin/questions')}`}
            >
              Sorular
            </Link>
          </li>
           <li>
            <Link 
              to="/admin/users" 
              className={`block px-4 py-2 rounded ${isActive('/admin/users')}`}
            >
              Kullanıcılar
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-indigo-700">
        <Link to="/" className="block px-4 py-2 rounded text-indigo-100 hover:bg-indigo-600">
          Siteye Dön
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;