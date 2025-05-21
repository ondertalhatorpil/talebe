import React from 'react';
import { FaTrophy, FaMedal, FaStar, FaSchool } from 'react-icons/fa';
import { HiLocationMarker } from 'react-icons/hi';
import { MdTrendingUp } from 'react-icons/md';

const MyRankingCard = ({ ranking }) => {
  // Initial validation
  if (!ranking) {
    return (
      <div className="bg-gray-100 rounded-xl p-6 text-gray-500 text-center">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
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

  // Helper function to get rank color
  const getRankBadgeColor = (rank) => {
    if (!rank || rank === '-' || isNaN(rank)) return 'bg-gray-500 text-white';
    const numRank = Number(rank);
    if (numRank === 1) return 'bg-yellow-500 text-white';
    if (numRank <= 3) return 'bg-orange-500 text-white';
    if (numRank <= 10) return 'bg-blue-500 text-white';
    return 'bg-gray-500 text-white';
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
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-2xl border border-white border-opacity-20">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full"></div>
      </div>

      {/* Content Container */}
      <div className="relative p-6 md:p-8 text-white">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <FaTrophy className="text-2xl text-yellow-300" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Benim Sıralamaları</h2>
              <p className="text-blue-100 text-sm">Anlık güncel performans verileri</p>
            </div>
          </div>
          
          {/* Total Points */}
          <div className="text-right">
            <div className="text-2xl md:text-3xl font-bold flex items-center justify-end">
              <FaStar className="inline text-yellow-300 mr-2" />
              {formatNumber(points)}
            </div>
            <div className="text-sm text-blue-100">Toplam Puan</div>
          </div>
        </div>

        {/* Rankings Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Turkey Ranking */}
          <div className="bg-gradient-to-br from-orange-600 via-purple-500 to-red-300 bg-opacity-10 backdrop-blur-sm rounded-lg p-4 transform transition-all hover:scale-105 hover:bg-opacity-15">
            <div className="flex items-center justify-between mb-2">
              <FaTrophy className="text-yellow-300 text-lg" />
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRankBadgeColor(turkey.rank)}`}>
                #{turkey.rank}
              </span>
            </div>
            <div className="text-sm text-blue-100 mb-1">Türkiye Geneli</div>
            <div className="text-lg font-bold">
              {turkey.rank}. / {formatNumber(turkey.total)}
            </div>
            <div className="text-xs text-blue-200 mt-1 flex items-center">
              <MdTrendingUp className="mr-1" />
              Top %{calculateTopPercentage(turkey.percentage)}
            </div>
          </div>

          {/* City Ranking */}
          <div className="bg-gradient-to-br from-pink-600 via-purple-500 to-red-300 bg-opacity-10 backdrop-blur-sm rounded-lg p-4 transform transition-all hover:scale-105 hover:bg-opacity-15">
            <div className="flex items-center justify-between mb-2">
              <HiLocationMarker className="text-green-300 text-lg" />
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRankBadgeColor(city.rank)}`}>
                #{city.rank}
              </span>
            </div>
            <div className="text-sm text-blue-100 mb-1">{city.name}</div>
            <div className="text-lg font-bold">
              {city.rank}. / {formatNumber(city.total)}
            </div>
            <div className="text-xs text-blue-200 mt-1 flex items-center">
              <MdTrendingUp className="mr-1" />
              Top %{calculateTopPercentage(city.percentage)}
            </div>
          </div>

          {/* District Ranking */}
          <div className="bg-gradient-to-br from-black-900 via-purple-500 to-red-300 bg-opacity-10 backdrop-blur-sm rounded-lg p-4 transform transition-all hover:scale-105 hover:bg-opacity-15">
            <div className="flex items-center justify-between mb-2">
              <HiLocationMarker className="text-blue-300 text-lg" />
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRankBadgeColor(district.rank)}`}>
                #{district.rank}
              </span>
            </div>
            <div className="text-sm text-blue-100 mb-1">{district.name}</div>
            <div className="text-lg font-bold">
              {district.rank}. / {formatNumber(district.total)}
            </div>
            <div className="text-xs text-blue-200 mt-1 flex items-center">
              <MdTrendingUp className="mr-1" />
              Top %{calculateTopPercentage(district.percentage)}
            </div>
          </div>

          {/* School Ranking */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-500 to-red-300 bg-opacity-10 backdrop-blur-sm rounded-lg p-4 transform transition-all hover:scale-105 hover:bg-opacity-15">
            <div className="flex items-center justify-between mb-2">
              <FaSchool className="text-pink-300 text-lg" />
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRankBadgeColor(school.rank)}`}>
                #{school.rank}
              </span>
            </div>
            <div className="text-sm text-blue-100 mb-1">Okulumda</div>
            <div className="text-lg font-bold flex items-center gap-2">
              {school.rank}. / {formatNumber(school.total)}
              <span className="text-2xl">{getMedalIcon(school.rank)}</span>
            </div>
            <div className="text-xs text-blue-200 mt-1 flex items-center">
              <MdTrendingUp className="mr-1" />
              Top %{calculateTopPercentage(school.percentage)}
            </div>
          </div>
        </div>

        {/* Achievement Highlights */}
        <div className="mt-6 pt-4 border-t border-white border-opacity-20">
          <div className="flex flex-wrap gap-2 justify-center">
            {school.rank === 1 && (
              <div className="bg-yellow-500 bg-opacity-90 px-3 py-1 rounded-full text-xs font-bold text-white animate-pulse">
                🏆 Okulun 1.ncisi!
              </div>
            )}
            {district.rank <= 3 && district.rank !== '-' && !isNaN(district.rank) && (
              <div className="bg-blue-500 bg-opacity-90 px-3 py-1 rounded-full text-xs font-bold text-white">
                🌟 İlçe Top 3
              </div>
            )}
            {turkey.percentage && !isNaN(turkey.percentage) && parseFloat(turkey.percentage) >= 90 && (
              <div className="bg-purple-500 bg-opacity-90 px-3 py-1 rounded-full text-xs font-bold text-white">
                ⭐ Türkiye Top %10
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRankingCard;