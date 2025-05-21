import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaLayerGroup, 
  FaTrophy, 
  FaSignOutAlt,
  FaBrain,
  FaChevronDown,
  FaUser,
  FaCog,
  FaBell
} from 'react-icons/fa';

const Header = () => {
  const { logout, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Navigation items with icons
  const navItems = [
    { path: '/', label: 'Ana Sayfa', icon: FaHome },
    { path: '/categories', label: 'Kategoriler', icon: FaLayerGroup },
    { path: '/leaderboard', label: 'Lider Tablosu', icon: FaTrophy },
  ];

  return (
    <header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 mb-3">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center gap-3 group transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <FaBrain className="text-white text-lg" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                talebe
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden group ${
                      isActive 
                        ? 'text-white shadow-lg transform scale-105' 
                        : 'text-gray-600 hover:text-white'
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive 
                      ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' 
                      : 'transparent',
                  })}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <Icon className="text-sm relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User menu and mobile menu button */}
          <div className="flex items-center space-x-4">
            {/* Notifications (Desktop) */}
            <button
              type="button"
              className="hidden md:flex p-2 rounded-lg text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200 relative"
            >
              <FaBell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu (Desktop) */}
            <div className="relative hidden md:block">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium hidden lg:block">
                  {user?.first_name || 'Kullanıcı'}
                </span>
                <FaChevronDown className={`text-xs transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-900 font-medium">
                      {user?.first_name || 'Hoş geldin!'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 w-full text-left transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FaUser className="text-sm" />
                      Profilim
                    </Link>
                    <button className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 w-full text-left transition-colors">
                      <FaCog className="text-sm" />
                      Ayarlar
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                    >
                      <FaSignOutAlt className="text-sm" />
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-4 pb-3 space-y-3 border-t border-gray-200/50 bg-white/95 backdrop-blur-md">
              {/* User info mobile */}
              <div className="px-3 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.first_name || 'Hoş geldin!'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive 
                          ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg' 
                          : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600'
                      }`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="text-lg" />
                    {item.label}
                  </NavLink>
                );
              })}
              
              {/* Mobile menu divider */}
              <hr className="my-2 border-gray-200" />
              
              {/* Mobile additional menu items */}
              <button className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200 w-full text-left">
                <FaBell className="text-lg" />
                Bildirimler
                <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <Link
                to="/profile"
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200 w-full text-left"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaUser className="text-lg" />
                Profilim
              </Link>
              
              <button className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200 w-full text-left">
                <FaCog className="text-lg" />
                Ayarlar
              </button>
              
              {/* Mobile Logout */}
              <button
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-200 w-full text-left"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                <FaSignOutAlt className="text-lg" />
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;