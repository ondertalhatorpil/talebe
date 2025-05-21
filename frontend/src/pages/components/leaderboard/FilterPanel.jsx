import React, { useState } from 'react';
import { FaFilter, FaUsers, FaGraduationCap, FaSort, FaSearch, FaRedo } from 'react-icons/fa';
import { HiLocationMarker, HiDownload } from 'react-icons/hi';
import { MdSwapVert, MdClear } from 'react-icons/md';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  availableCities = [], 
  availableDistricts = [],
  activeTab = 'turkey',
  isLoading = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFilterChange({
      userType: 'all',
      limit: 25,
      city: '',
      district: '',
      sortBy: 'points',
      sortOrder: 'desc'
    });
    setSearchTerm('');
  };

  const exportData = () => {
    // Export functionality placeholder
    console.log('Exporting data...');
  };

  const activeFilterCount = Object.values(filters).filter(value => 
    value && value !== 'all' && value !== ''
  ).length;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FaFilter className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Filtreler</h3>
              <p className="text-sm text-gray-600">
                {activeFilterCount > 0 ? `${activeFilterCount} filtre aktif` : 'Filtreleme yapın'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Active filter count badge */}
            {activeFilterCount > 0 && (
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {activeFilterCount}
              </div>
            )}
            
            {/* Reset button */}
            <button
              onClick={resetFilters}
              className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Tüm filtreleri temizle"
            >
              <MdClear />
            </button>
            
            {/* Expand/Collapse button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <MdSwapVert className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0'} overflow-hidden`}>
        <div className="p-4 space-y-4">
          {/* Quick Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* User Type Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaUsers className="text-blue-500" />
                Öğrenci Tipi
              </label>
              <select
                value={filters.userType || 'all'}
                onChange={(e) => handleFilterChange('userType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              >
                <option value="all">Tümü</option>
                <option value="ortaokul">Ortaokul</option>
                <option value="lise">Lise</option>
              </select>
            </div>

            {/* Limit Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaSort className="text-green-500" />
                Gösterilecek Sayı
              </label>
              <select
                value={filters.limit || 25}
                onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* City Filter (for city, district, school tabs) */}
            {(activeTab === 'city' || activeTab === 'district' || activeTab === 'school') && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <HiLocationMarker className="text-orange-500" />
                  İl Seçin
                </label>
                <select
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isLoading}
                >
                  <option value="">İl seçin...</option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            )}

            {/* District Filter (for district and school tabs) */}
            {(activeTab === 'district' || activeTab === 'school') && filters.city && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <HiLocationMarker className="text-purple-500" />
                  İlçe Seçin
                </label>
                <select
                  value={filters.district || ''}
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isLoading}
                >
                  <option value="">İlçe seçin...</option>
                  {availableDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Search and Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            {/* Search */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaSearch className="text-indigo-500" />
                Ara
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="İsim, okul ara..."
                  className="w-full p-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isLoading}
                />
                <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500"
                  >
                    <MdClear />
                  </button>
                )}
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MdSwapVert className="text-pink-500" />
                Sıralama
              </label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy || 'points'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isLoading}
                >
                  <option value="points">Puan</option>
                  <option value="name">İsim</option>
                  <option value="school">Okul</option>
                </select>
                <button
                  onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className={`p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                    filters.sortOrder === 'desc' ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                  disabled={isLoading}
                >
                  <MdSwapVert className={`transform transition-transform ${
                    filters.sortOrder === 'desc' ? 'rotate-180' : ''
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gray-50 p-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaRedo className={`${isLoading ? 'animate-spin' : ''}`} />
            <span>
              {isLoading ? 'Filtreleniyor...' : 'Hazır'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              <HiDownload />
              <span className="hidden sm:inline">Dışa Aktar</span>
            </button>
            
            <button
              onClick={() => onFilterChange(filters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              <FaFilter />
              <span className="hidden sm:inline">Uygula</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;