import { FaTrophy, FaMedal, FaSchool, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import { HiSparkles, HiLocationMarker } from 'react-icons/hi';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';

const RankingCard = ({ 
  data,
  rank,
  type = 'user', // 'user' or 'school'
  onClick = null,
  showDetails = true,
  className = '',
  isHighlighted = false
}) => {
  // Get rank display info
  const getRankDisplay = (rank) => {
    if (rank === 1) return { 
      emoji: '🥇', 
      class: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      badge: 'ŞAMPİYON'
    };
    if (rank === 2) return { 
      emoji: '🥈', 
      class: 'bg-gradient-to-r from-gray-400 to-gray-600',
      badge: 'İKİNCİ'
    };
    if (rank === 3) return { 
      emoji: '🥉', 
      class: 'bg-gradient-to-r from-orange-400 to-orange-600',
      badge: 'ÜÇÜNCÜ'
    };
    if (rank <= 10) return { 
      emoji: '⭐', 
      class: 'bg-gradient-to-r from-blue-500 to-blue-700',
      badge: 'TOP 10'
    };
    return { 
      emoji: '', 
      class: 'bg-gradient-to-r from-gray-500 to-gray-700',
      badge: ''
    };
  };

  const rankDisplay = getRankDisplay(rank);

  // Format numbers
  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString('tr-TR');
  };

  if (type === 'school') {
    return (
      <div 
        className={`bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-purple-300 transform hover:scale-102 ${
          isHighlighted ? 'ring-2 ring-purple-500 shadow-lg' : ''
        } ${className} ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-r from-purple-50 to-indigo-50 p-4">
          {/* Rank Badge */}
          <div className="absolute top-3 right-3">
            <div className={`${rankDisplay.class} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}>
              #{rank}
            </div>
          </div>
          
          {/* Medal or Trophy */}
          {rankDisplay.emoji && (
            <div className="absolute top-3 left-3 text-2xl">
              {rankDisplay.emoji}
            </div>
          )}
          
          {/* Sparkles for top performers */}
          {rank <= 5 && (
            <HiSparkles className="absolute bottom-3 right-3 text-purple-500 animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* School Info */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg">
              <FaSchool className="text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 line-clamp-2 text-lg">
                {data.name || 'Okul Adı'}
              </h3>
              {rankDisplay.badge && (
                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full mt-1">
                  {rankDisplay.badge}
                </span>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <HiLocationMarker className="text-red-500" />
            <span className="text-sm">
              {data.city}{data.district && `, ${data.district}`}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(data.total_points || 0)}
              </div>
              <div className="text-xs text-purple-500 font-medium">Toplam Puan</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(data.total_students || 0)}
              </div>
              <div className="text-xs text-blue-500 font-medium">Öğrenci</div>
            </div>
          </div>

          {/* Additional Info */}
          {showDetails && data.total_students > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700">
                  {Math.round((data.total_points || 0) / data.total_students)} puan
                </div>
                <div className="text-xs text-gray-500">öğrenci başına ortalama</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // User Card
  return (
    <div 
      className={`bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-blue-300 transform hover:scale-102 ${
        isHighlighted ? 'ring-2 ring-blue-500 shadow-lg' : ''
      } ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-r from-blue-50 to-purple-50 p-4">
        {/* Rank Badge */}
        <div className="absolute top-3 right-3">
          <div className={`${rankDisplay.class} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}>
            #{rank}
          </div>
        </div>
        
        {/* Medal or Trophy */}
        {rankDisplay.emoji && (
          <div className="absolute top-3 left-3 text-2xl">
            {rankDisplay.emoji}
          </div>
        )}
        
        {/* Sparkles for top performers */}
        {rank <= 5 && (
          <HiSparkles className="absolute bottom-3 right-3 text-blue-500 animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* User Info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {data.first_name?.charAt(0)}{data.last_name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg">
              {data.first_name} {data.last_name}
            </h3>
            {rankDisplay.badge && (
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full mt-1">
                {rankDisplay.badge}
              </span>
            )}
          </div>
        </div>

        {/* User Type & Class */}
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <FaUser className="text-green-500" />
          <span className="text-sm capitalize">
            {data.user_type}{data.class && ` - ${data.class}. Sınıf`}
          </span>
        </div>

        {/* School */}
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <FaSchool className="text-purple-500" />
          <span className="text-sm line-clamp-1">{data.school_name || 'Okul bilgisi yok'}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <FaMapMarkerAlt className="text-red-500" />
          <span className="text-sm">{data.city}</span>
        </div>

        {/* Points */}
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(data.points || 0)}
          </div>
          <div className="text-xs text-blue-500 font-medium">Toplam Puan</div>
          
          {/* Trend indicator */}
          {data.trend && (
            <div className="flex items-center justify-center gap-1 mt-1">
              {data.trend > 0 ? (
                <MdTrendingUp className="text-green-500" />
              ) : (
                <MdTrendingDown className="text-red-500" />
              )}
              <span className={`text-xs font-medium ${
                data.trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.trend > 0 ? '+' : ''}{data.trend}%
              </span>
            </div>
          )}
        </div>

        {/* Achievement badges */}
        {showDetails && (
          <div className="mt-3 flex flex-wrap gap-1 justify-center">
            {rank === 1 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                🏆 Lider
              </span>
            )}
            {rank <= 3 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                🎖️ Podium
              </span>
            )}
            {rank <= 10 && (
              <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">
                ⭐ Top 10
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingCard;