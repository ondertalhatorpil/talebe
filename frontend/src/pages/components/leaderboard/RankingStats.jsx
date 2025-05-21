import React from 'react';
import { 
  FaTrophy, 
  FaUsers, 
  FaSchool, 
  FaMapMarkedAlt,
  FaMedal,
  FaUserGraduate,
  FaChartLine,
  FaBalanceScale
} from 'react-icons/fa';
import { 
  HiSparkles, 
  HiTrendingUp, 
  HiTrendingDown,
  HiLightningBolt
} from 'react-icons/hi';
import { MdLeaderboard, MdTrendingFlat } from 'react-icons/md';

const RankingStats = ({ 
  stats = {},
  activeTab = 'turkey',
  location = null,
  isLoading = false 
}) => {
  // Default stats if none provided
  const defaultStats = {
    totalUsers: 0,
    totalSchools: 0,
    averagePoints: 0,
    topPerformer: null,
    distribution: {}
  };

  const currentStats = { ...defaultStats, ...stats };

  // Format number with proper locale
  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString('tr-TR');
  };

  // Calculate percentage change (mock data for demo)
  const getPercentageChange = (type) => {
    // In real app, this would come from API
    const changes = {
      users: Math.floor(Math.random() * 20) - 10, // -10 to +10
      schools: Math.floor(Math.random() * 15) - 5, // -5 to +15
      points: Math.floor(Math.random() * 30) - 15  // -15 to +30
    };
    return changes[type] || 0;
  };

  // Get trend icon
  const getTrendIcon = (change) => {
    if (change > 0) return <HiTrendingUp className="text-green-500" />;
    if (change < 0) return <HiTrendingDown className="text-red-500" />;
    return <MdTrendingFlat className="text-gray-500" />;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  // Stats cards configuration
  const statsCards = [
    {
      id: 'participants',
      title: activeTab === 'school' ? 'Toplam Okul' : 'Toplam Katılımcı',
      value: activeTab === 'school' ? currentStats.totalSchools : currentStats.totalUsers,
      icon: activeTab === 'school' ? FaSchool : FaUsers,
      color: 'blue',
      change: getPercentageChange('users'),
      description: 'Son aya göre değişim'
    },
    {
      id: 'average_points',
      title: 'Ortalama Puan',
      value: Math.round(currentStats.averagePoints || 0),
      icon: FaChartLine,
      color: 'green',
      change: getPercentageChange('points'),
      description: 'Genel ortalama'
    },
    {
      id: 'top_performer',
      title: 'En Yüksek Puan',
      value: currentStats.topPerformer?.points || 0,
      icon: FaTrophy,
      color: 'yellow',
      subtitle: currentStats.topPerformer?.name || 'Veri yok',
      description: currentStats.topPerformer ? 'Lider' : 'Henüz veri yok'
    },
    {
      id: 'distribution',
      title: 'Puan Dağılımı',
      value: Object.keys(currentStats.distribution).length,
      icon: FaBalanceScale,
      color: 'purple',
      description: 'Farklı puan aralığı',
      extraInfo: 'Dengeli dağılım'
    }
  ];

  // Color schemes for cards
  const colorSchemes = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-200',
      icon: 'bg-blue-500 text-white',
      text: 'text-blue-900',
      secondary: 'text-blue-600'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      border: 'border-green-200',
      icon: 'bg-green-500 text-white',
      text: 'text-green-900',
      secondary: 'text-green-600'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      border: 'border-yellow-200',
      icon: 'bg-yellow-500 text-white',
      text: 'text-yellow-900',
      secondary: 'text-yellow-600'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      border: 'border-purple-200',
      icon: 'bg-purple-500 text-white',
      text: 'text-purple-900',
      secondary: 'text-purple-600'
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Header */}
      {location && (
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <FaMapMarkedAlt className="text-blue-500 text-xl" />
            <div>
              <h3 className="font-semibold text-gray-800">Lokasyon Bazında İstatistikler</h3>
              <p className="text-gray-600">
                {location.city && <span className="font-medium">{location.city}</span>}
                {location.city && location.district && <span> • </span>}
                {location.district && <span className="font-medium">{location.district}</span>}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const colorScheme = colorSchemes[stat.color];
          const Icon = stat.icon;
          
          return (
            <div 
              key={stat.id}
              className={`${colorScheme.bg} ${colorScheme.border} rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg hover:scale-105`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorScheme.icon} shadow-md`}>
                  <Icon className="text-xl" />
                </div>
                {stat.change !== undefined && (
                  <div className="flex items-center gap-1">
                    {getTrendIcon(stat.change)}
                    <span className={`text-sm font-medium ${
                      stat.change > 0 ? 'text-green-600' : 
                      stat.change < 0 ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </span>
                  </div>
                )}
              </div>

              {/* Main Value */}
              <div className="mb-2">
                <div className={`text-3xl font-bold ${colorScheme.text}`}>
                  {formatNumber(stat.value)}
                </div>
                {stat.subtitle && (
                  <div className={`text-sm ${colorScheme.secondary} truncate`}>
                    {stat.subtitle}
                  </div>
                )}
              </div>

              {/* Title and Description */}
              <div>
                <h3 className={`font-semibold ${colorScheme.text} mb-1`}>
                  {stat.title}
                </h3>
                <p className={`text-sm ${colorScheme.secondary}`}>
                  {stat.description}
                </p>
                {stat.extraInfo && (
                  <p className={`text-xs ${colorScheme.secondary} mt-1 opacity-80`}>
                    {stat.extraInfo}
                  </p>
                )}
              </div>

              {/* Progress indicator for some cards */}
              {stat.id === 'distribution' && (
                <div className="mt-4">
                  <div className="h-2 bg-white bg-opacity-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white bg-opacity-80 rounded-full transition-all duration-500"
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <MdLeaderboard className="text-white text-xl" />
            </div>
            <h3 className="font-semibold text-gray-800">Hızlı İstatistikler</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">En aktif gün</span>
              <span className="font-semibold text-gray-900">Pazartesi</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ortalama katılım</span>
              <span className="font-semibold text-gray-900">78%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">En çok puan kazanılan saat</span>
              <span className="font-semibold text-gray-900">15:00-16:00</span>
            </div>
          </div>
        </div>

        {/* Award Stats */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <FaMedal className="text-white text-xl" />
            </div>
            <h3 className="font-semibold text-gray-800">Başarı Dağılımı</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🥇</span>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">1. lik</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-yellow-500 rounded-full w-3/4"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🥈</span>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">2. lik</span>
                  <span className="font-semibold">18</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-gray-400 rounded-full w-2/3"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🥉</span>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">3. lük</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-orange-500 rounded-full w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top School Stats */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500 rounded-lg">
              <HiSparkles className="text-white text-xl" />
            </div>
            <h3 className="font-semibold text-gray-800">En Başarılı Okul</h3>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <FaSchool className="text-white text-2xl" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Fen Lisesi</h4>
            <p className="text-gray-600 mb-2">İstanbul • Kadıköy</p>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatNumber(15847)}
            </div>
            <p className="text-gray-500 text-sm">Toplam puan</p>
            <div className="mt-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <HiLightningBolt className="inline mr-1" />
              Bu ayki şampiyon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingStats;