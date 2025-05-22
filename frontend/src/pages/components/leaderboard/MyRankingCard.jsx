import React from 'react';
import { Trophy, Medal, Star, School, MapPin, TrendingUp, Award } from 'lucide-react';

const MyRankingCard = ({ ranking }) => {
  // Initial validation
  if (!ranking) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 text-gray-400 text-center border border-gray-200">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-2xl w-1/3 mx-auto mb-6"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded-xl w-1/2 mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded-xl w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Safely extract data with defaults
  const points = ranking.points ?? 0;
  const rankings = ranking.rankings || {};
  
  // Validate each ranking with defaults
  const turkey = rankings.turkey || { rank: '-', total: 0, percentage: '0' };
  const city = rankings.city || { rank: '-', total: 0, percentage: '0', name: 'Bilinmiyor' };
  const district = rankings.district || { rank: '-', total: 0, percentage: '0', name: 'Bilinmiyor' };
  const school = rankings.school || { rank: '-', total: 0, percentage: '0' };

  // Helper function to get rank color with modern gradients
  const getRankBadgeColor = (rank) => {
    if (!rank || rank === '-' || isNaN(rank)) return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg';
    const numRank = Number(rank);
    if (numRank === 1) return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/25';
    if (numRank <= 3) return 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/25';
    if (numRank <= 10) return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25';
    return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25';
  };

  // Helper function to get medal emoji
  const getMedalIcon = (rank) => {
    if (!rank || rank === '-' || isNaN(rank)) return '';
    const numRank = Number(rank);
    if (numRank === 1) return '🥇';
    if (numRank === 2) return '🥈';
    if (numRank === 3) return '🥉';
    return '';
  };

  // Helper function to safely format numbers
  const formatNumber = (num) => {
    if (!num || isNaN(num)) return '0';
    return Number(num).toLocaleString();
  };

  // Helper function to safely calculate percentage
  const calculateTopPercentage = (percentage) => {
    if (!percentage || isNaN(percentage)) return '0';
    return (100 - parseFloat(percentage)).toFixed(1);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl shadow-2xl border border-white/10">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-red-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Glass Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/1 backdrop-blur-sm"></div>

      {/* Content Container */}
      <div className="relative p-8 text-white">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur-lg opacity-50"></div>
              <div className="relative p-4 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-2xl border border-white/20 backdrop-blur-sm">
                <Trophy className="text-3xl text-yellow-300" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Benim Sıralamaları
              </h2>
              <p className="text-blue-200/80 text-sm font-medium">Anlık güncel performans verileri</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20">
            <Star className="text-yellow-300 text-lg" />
            <span className="text-lg font-bold">{formatNumber(points)} Puan</span>
          </div>
        </div>

        {/* Rankings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Turkey Ranking */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-orange-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-xl blur-md opacity-50"></div>
                  <div className="relative p-2 bg-red-500/20 rounded-xl">
                    <Trophy className="text-red-300 text-xl" />
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-xl text-sm font-bold transform transition-all duration-300 ${getRankBadgeColor(turkey.rank)}`}>
                  #{turkey.rank}
                </span>
              </div>
              <div className="text-sm text-blue-200/80 mb-2 font-medium">Türkiye Geneli</div>
              <div className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                {turkey.rank}. / {formatNumber(turkey.total)}
              </div>
              <div className="text-xs text-blue-200/70 flex items-center bg-white/5 rounded-lg px-2 py-1">
                <TrendingUp className="mr-1 text-green-400" size={12} />
                Top %{calculateTopPercentage(turkey.percentage)}
              </div>
            </div>
          </div>

          {/* City Ranking */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-50"></div>
                  <div className="relative p-2 bg-blue-500/20 rounded-xl">
                    <MapPin className="text-blue-300 text-xl" />
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-xl text-sm font-bold transform transition-all duration-300 ${getRankBadgeColor(city.rank)}`}>
                  #{city.rank}
                </span>
              </div>
              <div className="text-sm text-blue-200/80 mb-2 font-medium">{city.name}</div>
              <div className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                {city.rank}. / {formatNumber(city.total)}
              </div>
              <div className="text-xs text-blue-200/70 flex items-center bg-white/5 rounded-lg px-2 py-1">
                <TrendingUp className="mr-1 text-green-400" size={12} />
                Top %{calculateTopPercentage(city.percentage)}
              </div>
            </div>
          </div>

          {/* District Ranking */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500 rounded-xl blur-md opacity-50"></div>
                  <div className="relative p-2 bg-purple-500/20 rounded-xl">
                    <MapPin className="text-purple-300 text-xl" />
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-xl text-sm font-bold transform transition-all duration-300 ${getRankBadgeColor(district.rank)}`}>
                  #{district.rank}
                </span>
              </div>
              <div className="text-sm text-blue-200/80 mb-2 font-medium">{district.name}</div>
              <div className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                {district.rank}. / {formatNumber(district.total)}
              </div>
              <div className="text-xs text-blue-200/70 flex items-center bg-white/5 rounded-lg px-2 py-1">
                <TrendingUp className="mr-1 text-green-400" size={12} />
                Top %{calculateTopPercentage(district.percentage)}
              </div>
            </div>
          </div>

          {/* School Ranking */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-teal-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-md opacity-50"></div>
                  <div className="relative p-2 bg-emerald-500/20 rounded-xl">
                    <School className="text-emerald-300 text-xl" />
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-xl text-sm font-bold transform transition-all duration-300 ${getRankBadgeColor(school.rank)}`}>
                  #{school.rank}
                </span>
              </div>
              <div className="text-sm text-blue-200/80 mb-2 font-medium">Okulumda</div>
              <div className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent flex items-center gap-2">
                {school.rank}. / {formatNumber(school.total)}
                <span className="text-3xl">{getMedalIcon(school.rank)}</span>
              </div>
              <div className="text-xs text-blue-200/70 flex items-center bg-white/5 rounded-lg px-2 py-1">
                <TrendingUp className="mr-1 text-green-400" size={12} />
                Top %{calculateTopPercentage(school.percentage)}
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Section */}
        <div className="mt-8 flex justify-center">
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center space-x-4">
            <Award className="text-yellow-300 text-2xl" />
            <div>
              <div className="text-sm text-blue-200/80">Genel Başarı Seviyesi</div>
              <div className="text-lg font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Mükemmel Performans
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRankingCard;