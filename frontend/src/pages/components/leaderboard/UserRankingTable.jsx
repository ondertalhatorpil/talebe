// UserRankingTable - İlk Bölüm (Import'lar ve State)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 🆕 EKLENDI - Profile yönlendirme için
import { FaTrophy, FaChevronUp, FaChevronDown, FaEye, FaGraduationCap, FaSchool, FaCrown, FaAward, FaMedal, FaStar, FaFire, FaRocket } from 'react-icons/fa';
import { HiLocationMarker, HiSparkles } from 'react-icons/hi';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';

const UserRankingTable = ({ 
  users = [], 
  refreshing = false, 
  activeTab = 'turkey',
  onUserSelect = null,
  showDetails = false 
}) => {
  const navigate = useNavigate(); // 🆕 EKLENDI - Navigasyon için
  const [sortConfig, setSortConfig] = useState({ key: 'points', direction: 'desc' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [hoveredUser, setHoveredUser] = useState(null);

  // Safe getter for user properties
  const safeGet = (obj, key, defaultValue = '') => {
    return obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : defaultValue;
  };

  // Safe number formatter
  const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return Number(num).toLocaleString();
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort users based on current config
  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...users].filter(user => user && typeof user === 'object');
    if (sortConfig.key && sortableUsers.length > 0) {
      sortableUsers.sort((a, b) => {
        let aValue = safeGet(a, sortConfig.key);
        let bValue = safeGet(b, sortConfig.key);
        
        // Handle string values
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = (bValue || '').toLowerCase();
        }
        
        // Handle numbers
        if (sortConfig.key === 'points') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  // Get rank display with modern styling
  const getRankDisplay = (index) => {
    const rank = index + 1;
    if (rank === 1) return { 
      icon: FaCrown, 
      gradient: 'from-yellow-400 via-gold-500 to-yellow-600',
      shadow: 'shadow-yellow-500/30',
      bg: 'from-yellow-50 to-yellow-100',
      border: 'border-yellow-200',
      glow: 'shadow-lg shadow-yellow-500/25'
    };
    if (rank === 2) return { 
      icon: FaAward, 
      gradient: 'from-gray-400 via-gray-500 to-gray-600',
      shadow: 'shadow-gray-500/30',
      bg: 'from-gray-50 to-gray-100', 
      border: 'border-gray-200',
      glow: 'shadow-lg shadow-gray-500/25'
    };
    if (rank === 3) return { 
      icon: FaMedal, 
      gradient: 'from-orange-400 via-orange-500 to-orange-600',
      shadow: 'shadow-orange-500/30',
      bg: 'from-orange-50 to-orange-100',
      border: 'border-orange-200',
      glow: 'shadow-lg shadow-orange-500/25'
    };
    if (rank <= 10) return { 
      icon: FaStar, 
      gradient: 'from-purple-400 via-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/30',
      bg: 'from-purple-50 to-purple-100',
      border: 'border-purple-200',
      glow: 'shadow-md shadow-purple-500/20'
    };
    return { 
      icon: FaRocket, 
      gradient: 'from-blue-400 via-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/30',
      bg: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      glow: 'shadow-sm shadow-blue-500/15'
    };
  };

  // Get user type icon and styling
  const getUserTypeInfo = (userType) => {
    if (userType === 'ortaokul') {
      return {
        icon: FaGraduationCap,
        color: 'text-blue-600',
        bg: 'bg-blue-100'
      };
    }
    return {
      icon: FaSchool,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    };
  };

  // Handle user click - 🆕 UPDATED - Profile'a yönlendirme
  const handleUserClick = (user, index) => {
    setSelectedUser(user);
    
    // Profile sayfasına yönlendir
    navigate(`/profile/${user.id}`);
    
    // Eski callback'i de çağır (isteğe bağlı)
    if (onUserSelect) {
      onUserSelect(user, index + 1);
    }
  };

  // Header component for sortable columns
  const SortableHeader = ({ children, sortKey, className = '' }) => (
    <th
      onClick={() => handleSort(sortKey)}
      className={`px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300 group ${className}`}
    >
      <div className="flex items-center gap-2">
        {children}
        <div className="flex flex-col opacity-70 group-hover:opacity-100 transition-opacity">
          <FaChevronUp className={`h-2 w-2 ${
            sortConfig.key === sortKey && sortConfig.direction === 'asc' ? 'text-purple-600' : 'text-gray-400'
          }`} />
          <FaChevronDown className={`h-2 w-2 ${
            sortConfig.key === sortKey && sortConfig.direction === 'desc' ? 'text-purple-600' : 'text-gray-400'
          }`} />
        </div>
      </div>
    </th>
  );// Empty State
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
        <div className="relative p-12 text-center">
          {/* Animated Empty State */}
          <div className="relative">
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
                <FaTrophy className="text-gray-300 text-4xl" />
              </div>
              {/* Floating elements for movement */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-200 rounded-full animate-bounce opacity-50"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-200 rounded-full animate-pulse opacity-60"></div>
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-gray-700">Henüz veriye ulaşılamadı</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Seçtiğiniz kriterlere göre liderlik tablosunda görüntülenecek kullanıcı bulunamadı.
            </p>
            
            {/* Suggestions */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl inline-block">
              <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <HiSparkles className="text-yellow-500" />
                Öneriler
              </h4>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li>• Farklı şehir/ilçe kombinasyonu deneyin</li>
                <li>• Kullanıcı türü filtresini değiştirin</li>
                <li>• Tüm kategorileri seçmeyi deneyin</li>
                <li>• Sayfa yenilenerek tekrar deneyin</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 opacity-30 pointer-events-none"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-4 left-4 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-30 animate-bounce pointer-events-none"></div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <FaTrophy className="text-white text-2xl animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Liderlik Sıralaması</h3>
              <p className="text-white/80">
                {users.length} yarışmacı • <span className="capitalize">{activeTab}</span> bazında
              </p>
            </div>
          </div>
          
          {refreshing && (
            <div className="flex items-center gap-3 text-white">
              <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              <span className="text-sm font-medium">Güncelleniyor...</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden relative">
        <div className="p-4 space-y-4">
          {sortedUsers.map((user, index) => {
            const rankDisplay = getRankDisplay(index);
            const userTypeInfo = getUserTypeInfo(user.user_type);
            const RankIcon = rankDisplay.icon;
            const UserTypeIcon = userTypeInfo.icon;
            
            return (
              <div
                key={user.id}
                className={`group relative bg-white rounded-xl p-4 border-2 ${rankDisplay.border} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleUserClick(user, index)}
                onMouseEnter={() => setHoveredUser(user.id)}
                onMouseLeave={() => setHoveredUser(null)}
              >
                {/* Animated Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${rankDisplay.bg} opacity-0 group-hover:opacity-60 transition-opacity duration-300 rounded-xl pointer-events-none`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      <div className={`relative w-16 h-16 rounded-full bg-gradient-to-r ${rankDisplay.gradient} flex items-center justify-center ${rankDisplay.glow} transform group-hover:scale-110 transition-transform duration-300`}>
                        <RankIcon className="text-white text-xl" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-black text-gray-700">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-black text-gray-900 truncate">
                          {user.first_name} {user.last_name}
                        </h4>
                        {index < 3 && <HiSparkles className="text-yellow-500 animate-pulse" />}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <div className={`flex items-center space-x-1 px-2 py-1 ${userTypeInfo.bg} rounded-full`}>
                          <UserTypeIcon className={`text-xs ${userTypeInfo.color}`} />
                          <span className="font-medium capitalize">{user.user_type}</span>
                        </div>
                        {user.class && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {user.class}. Sınıf
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 truncate">
                        <div className="font-medium">{user.school_name || 'Okul bilgisi yok'}</div>
                        <div className="flex items-center space-x-1 text-xs">
                          <HiLocationMarker />
                          <span>{user.city}</span>
                          {user.district && <span>• {user.district}</span>}
                        </div>
                      </div>
                    </div>
                    
                    {/* Points */}
                    <div className="text-right">
                      <div className="text-2xl font-black text-purple-600">
                        {user.points.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">puan</div>
                      {index === 0 && (
                        <MdTrendingUp className="text-green-500 text-lg mt-1 animate-bounce" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Desktop Table View */}
      <div className="hidden lg:block relative">
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaTrophy className="text-yellow-500" />
                    Sıra
                  </div>
                </th>
                <SortableHeader sortKey="first_name" className="w-1/4">
                  <FaGraduationCap className="text-blue-500" />
                  Öğrenci
                </SortableHeader>
                <SortableHeader sortKey="school_name" className="w-1/4">
                  <FaSchool className="text-purple-500" />
                  Okul
                </SortableHeader>
                <SortableHeader sortKey="city">
                  <HiLocationMarker className="text-green-500" />
                  Şehir
                </SortableHeader>
                <SortableHeader sortKey="points">
                  <FaFire className="text-orange-500" />
                  Puan
                </SortableHeader>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <FaEye className="text-gray-500" />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedUsers.map((user, index) => {
                const rankDisplay = getRankDisplay(index);
                const userTypeInfo = getUserTypeInfo(user.user_type);
                const RankIcon = rankDisplay.icon;
                const UserTypeIcon = userTypeInfo.icon;
                const isHighlighted = index < 3;
                
                return (
                  <tr 
                    key={user.id}
                    className={`group hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300 cursor-pointer ${
                      isHighlighted ? `bg-gradient-to-r ${rankDisplay.bg} hover:from-${rankDisplay.bg.split('-')[1]}-100 hover:to-${rankDisplay.bg.split('-')[3]}-100` : ''
                    } ${selectedUser?.id === user.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleUserClick(user, index)}
                    onMouseEnter={() => setHoveredUser(user.id)}
                    onMouseLeave={() => setHoveredUser(null)}
                  >
                    {/* Rank */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`relative w-12 h-12 rounded-full bg-gradient-to-r ${rankDisplay.gradient} flex items-center justify-center ${rankDisplay.glow} transform group-hover:scale-110 transition-transform duration-300`}>
                          <RankIcon className="text-white text-lg" />
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-black text-gray-700">
                            {index + 1}
                          </div>
                        </div>
                        {index < 3 && (
                          <HiSparkles className="text-yellow-500 text-xl animate-pulse" />
                        )}
                      </div>
                    </td>

                    {/* Student Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                          {(safeGet(user, 'first_name', 'U').charAt(0) + safeGet(user, 'last_name', 'U').charAt(0)).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-gray-900 text-lg group-hover:text-purple-700 transition-colors">
                            {safeGet(user, 'first_name')} {safeGet(user, 'last_name')}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`flex items-center gap-1 px-2 py-1 ${userTypeInfo.bg} rounded-full`}>
                              <UserTypeIcon className={`text-xs ${userTypeInfo.color}`} />
                              <span className="text-xs font-medium capitalize">{safeGet(user, 'user_type', 'belirtilmemiş')}</span>
                            </div>
                            {safeGet(user, 'class') && (
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-medium">
                                {safeGet(user, 'class')}. Sınıf
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* School */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        {safeGet(user, 'school_name', 'Okul bilgisi yok')}
                      </div>
                      {safeGet(user, 'district') && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <HiLocationMarker />
                          {safeGet(user, 'district')}
                        </div>
                      )}
                    </td>

                    {/* City */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">{safeGet(user, 'city', 'Bilinmiyor')}</div>
                        {activeTab === 'city' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </td>

                    {/* Points */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-black text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text">
                          {formatNumber(safeGet(user, 'points', 0))}
                        </div>
                        {index === 0 && (
                          <MdTrendingUp className="text-green-500 text-xl animate-bounce" />
                        )}
                      </div>
                      {safeGet(user, 'monthly_points') && (
                        <div className="text-xs text-gray-500 mt-1">
                          Bu ay: +{formatNumber(safeGet(user, 'monthly_points'))}
                        </div>
                      )}
                    </td>

                    {/* Details Button - 🆕 UPDATED */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user, index);
                        }}
                        className="group p-3 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all duration-300 transform hover:scale-110"
                        title={`${user.first_name} ${user.last_name} profilini görüntüle`}
                      >
                        <FaEye className="group-hover:animate-pulse" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">
            Toplam <span className="font-black text-purple-600">{users.length}</span> yarışmacı
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
              <span className="font-medium">Altın (1-3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
              <span className="font-medium">Yıldız (4-10)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
              <span className="font-medium">Yükselen (11+)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS Animations
const styles = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  tr {
    animation: slideInUp 0.6s ease-out forwards;
    opacity: 0;
  }
  
  .group:hover .animate-pulse {
    animation-duration: 0.5s;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default UserRankingTable;