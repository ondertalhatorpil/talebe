import React, { useState } from 'react';
import { FaSchool, FaUsers, FaTrophy, FaChevronUp, FaChevronDown, FaEye, FaMapMarkedAlt } from 'react-icons/fa';
import { HiLocationMarker, HiSparkles, HiAcademicCap } from 'react-icons/hi';
import { MdTrendingUp, MdAssessment, MdSchool } from 'react-icons/md';
import { BiBuildings } from 'react-icons/bi';

const SchoolRankingTable = ({ 
  schools = [], 
  refreshing = false, 
  activeTab = 'turkey',
  onSchoolSelect = null,
  showDetails = false 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'total_points', direction: 'desc' });
  const [selectedSchool, setSelectedSchool] = useState(null);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort schools based on current config
  const sortedSchools = React.useMemo(() => {
    let sortableSchools = [...schools];
    if (sortConfig.key) {
      sortableSchools.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle string values
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
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
    return sortableSchools;
  }, [schools, sortConfig]);

  // Get rank display
  const getRankDisplay = (index, points) => {
    const rank = index + 1;
    if (rank === 1) return { 
      emoji: '🥇', 
      class: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
      badge: 'ŞAMPİYON'
    };
    if (rank === 2) return { 
      emoji: '🥈', 
      class: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white',
      badge: 'İKİNCİ'
    };
    if (rank === 3) return { 
      emoji: '🥉', 
      class: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white',
      badge: 'ÜÇÜNCÜ'
    };
    if (rank <= 10) return { 
      emoji: '⭐', 
      class: 'bg-gradient-to-r from-blue-500 to-blue-700 text-white',
      badge: 'TOP 10'
    };
    return { 
      emoji: '', 
      class: 'bg-gradient-to-r from-gray-500 to-gray-700 text-white',
      badge: ''
    };
  };

  // Get school type color
  const getSchoolTypeColor = (type) => {
    if (!type) return 'text-gray-500';
    if (type.includes('ortaokul')) return 'text-green-600';
    if (type.includes('lise')) return 'text-blue-600';
    return 'text-purple-600';
  };

  // Calculate average points per student
  const calculateAvgPointsPerStudent = (school) => {
    if (!school.total_students || school.total_students === 0) return 0;
    return Math.round(school.total_points / school.total_students);
  };

  // Handle school click
  const handleSchoolClick = (school, index) => {
    setSelectedSchool(school);
    if (onSchoolSelect) {
      onSchoolSelect(school, index + 1);
    }
  };

  // Header component for sortable columns
  const SortableHeader = ({ children, sortKey, className = '' }) => (
    <th
      onClick={() => handleSort(sortKey)}
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
    >
      <div className="flex items-center gap-2">
        {children}
        <div className="flex flex-col">
          <FaChevronUp className={`h-2 w-2 ${
            sortConfig.key === sortKey && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'
          }`} />
          <FaChevronDown className={`h-2 w-2 ${
            sortConfig.key === sortKey && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'
          }`} />
        </div>
      </div>
    </th>
  );

  if (schools.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <FaSchool className="mx-auto text-4xl" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Henüz okul verisi bulunmuyor</h3>
        <p className="text-gray-500">Liderlik tablosunda görüntülenecek okul bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <FaSchool className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Okul Sıralaması</h3>
              <p className="text-sm text-gray-600">
                {schools.length} okul • {activeTab} bazında
              </p>
            </div>
          </div>
          
          {refreshing && (
            <div className="flex items-center gap-2 text-purple-600">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
              <span className="text-sm">Güncelleniyor...</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sıra
              </th>
              <SortableHeader sortKey="name" className="w-1/3">
                Okul Adı
              </SortableHeader>
              <SortableHeader sortKey="city">
                Lokasyon
              </SortableHeader>
              <SortableHeader sortKey="total_students">
                Öğrenci Sayısı
              </SortableHeader>
              <SortableHeader sortKey="total_points">
                Toplam Puan
              </SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ortalama
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detay
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSchools.map((school, index) => {
              const rankDisplay = getRankDisplay(index, school.total_points);
              const isHighlighted = index < 3;
              const avgPoints = calculateAvgPointsPerStudent(school);
              
              return (
                <tr 
                  key={school.id}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                    isHighlighted ? 'bg-purple-50 hover:bg-purple-100' : ''
                  } ${selectedSchool?.id === school.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''}`}
                  onClick={() => handleSchoolClick(school, index)}
                >
                  {/* Rank */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${rankDisplay.class} shadow-lg`}>
                        {index + 1}
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        {rankDisplay.emoji && (
                          <span className="text-2xl">{rankDisplay.emoji}</span>
                        )}
                        {rankDisplay.badge && (
                          <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                            {rankDisplay.badge}
                          </span>
                        )}
                      </div>
                      {index < 5 && (
                        <HiSparkles className="text-purple-500 animate-pulse" />
                      )}
                    </div>
                  </td>

                  {/* School Name */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white">
                        <FaSchool className="text-xl" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 line-clamp-2">
                          {school.name}
                        </div>
                        {school.type && (
                          <div className={`text-sm font-medium ${getSchoolTypeColor(school.type)}`}>
                            <MdSchool className="inline mr-1" />
                            {school.type}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <HiLocationMarker className="text-red-500" />
                      <div>
                        <div className="font-medium text-gray-900">{school.city}</div>
                        {school.district && (
                          <div className="text-sm text-gray-500">{school.district}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Student Count */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-blue-500" />
                      <div className="text-lg font-semibold text-gray-900">
                        {school.total_students?.toLocaleString() || 0}
                      </div>
                    </div>
                  </td>

                  {/* Total Points */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FaTrophy className="text-yellow-500" />
                      <div>
                        <div className="text-xl font-bold text-purple-600">
                          {school.total_points?.toLocaleString() || 0}
                        </div>
                        {index === 0 && (
                          <div className="text-xs text-green-600 flex items-center gap-1">
                            <MdTrendingUp />
                            En Yüksek Puan
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Average Points */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MdAssessment className="text-indigo-500" />
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {avgPoints.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Öğrenci başına
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Details Button */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSchoolClick(school, index);
                      }}
                      className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Toplam {schools.length} okul
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-50 border border-purple-200 rounded"></div>
              <span>İlk 3</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
              <span>Top 10</span>
            </div>
            {schools.length > 0 && (
              <div className="text-purple-600 font-semibold">
                En Yüksek Puan: {Math.max(...schools.map(s => s.total_points || 0)).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolRankingTable;