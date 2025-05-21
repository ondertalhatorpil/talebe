import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaMedal, FaSync, FaClock, FaUsers, FaSchool } from 'react-icons/fa';
import { HiLocationMarker } from 'react-icons/hi';

// Components
import MyRankingCard from './components/leaderboard/MyRankingCard';
import TabNavigation from './components/leaderboard/TabNavigation';
import FilterPanel from './components/leaderboard/FilterPanel';
import UserRankingTable from './components/leaderboard/UserRankingTable';
import SchoolRankingTable from './components/leaderboard/SchoolRankingTable';
import LocationSelector from './components/leaderboard/LocationSelector';
import RankingStats from './components/leaderboard/RankingStats';
import LeaderboardSkeleton from './components/leaderboard/LeaderboardSkeleton';

// API service
import { userService, schoolService } from '../services/api';

const LeaderboardPage = () => {
  // State management
  const [activeTab, setActiveTab] = useState('turkey'); // turkey, city, district, school
  const [userType, setUserType] = useState('all'); // all, ortaokul, lise
  const [limit, setLimit] = useState(25); // 10, 25, 50, 100
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState(null);
  
  // Data states
  const [myRanking, setMyRanking] = useState(null);
  const [myRankingLoading, setMyRankingLoading] = useState(true);
  const [myRankingError, setMyRankingError] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [stats, setStats] = useState(null);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  const navigate = useNavigate();

  // Fetch user's own ranking
  const fetchMyRanking = useCallback(async () => {
    try {
      setMyRankingLoading(true);
      setMyRankingError(null);
      
      const response = await userService.getComprehensiveRanking();
      console.log('MyRanking response:', response); // Debug log
      
      if (response && response.data && response.data.success && response.data.data) {
        setMyRanking(response.data.data);
      } else {
        console.warn('No ranking data received');
        setMyRankingError('Ranking verisi alınamadı');
      }
    } catch (error) {
      console.error('Error fetching my ranking:', error);
      setMyRankingError('Ranking verisi yüklenirken hata oluştu');
      
      // Eğer 401 hatası alırsak, kullanıcı giriş yapmamış olabilir
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
    } finally {
      setMyRankingLoading(false);
    }
  }, [navigate]);

  // Fetch leaderboard data based on current tab and filters
  const fetchLeaderboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      let response;
      const params = { limit };
      if (userType !== 'all') params.type = userType;
      
      switch (activeTab) {
        case 'turkey':
          response = await userService.getTopUsers(params);
          break;
          
        case 'city':
          if (!selectedCity) {
            setError('Lütfen bir il seçin');
            return;
          }
          response = await userService.getTopUsersByCity(selectedCity, params);
          break;
          
        case 'district':
          if (!selectedCity || !selectedDistrict) {
            setError('Lütfen il ve ilçe seçin');
            return;
          }
          response = await userService.getTopUsersByDistrict(selectedCity, selectedDistrict, params);
          break;
          
        case 'school':
          if (!selectedCity || !selectedDistrict) {
            setError('Lütfen okul seçin');
            return;
          }
          response = await schoolService.getTopSchoolsByDistrict(selectedCity, selectedDistrict, { limit });
          break;
          
        default:
          response = await userService.getTopUsers(params);
      }
      
      console.log('Leaderboard response:', response); // Debug log
      
      if (response && response.data) {
        // API response format kontrolü
        if (response.data.success && response.data.data) {
          // {success: true, data: [...]} format
          setLeaderboardData(response.data.data);
        } else if (response.data.users || response.data.schools) {
          // Direct array format
          setLeaderboardData(response.data.users || response.data.schools);
        } else if (Array.isArray(response.data)) {
          // Direct array
          setLeaderboardData(response.data);
        } else {
          setLeaderboardData([]);
        }
      } else {
        setLeaderboardData([]);
      }
      
      setError(null);
      setLastUpdated(new Date());
    } catch (error) {
      setError('Veriler yüklenirken bir hata oluştu');
      console.error('Error fetching leaderboard:', error);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, userType, limit, selectedCity, selectedDistrict]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboardData(true);
      fetchMyRanking();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchLeaderboardData, fetchMyRanking]);

  // Initial data fetch
  useEffect(() => {
    fetchMyRanking();
    fetchLeaderboardData();
  }, [activeTab, userType, limit, selectedCity, selectedDistrict]);

  // Fetch cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await schoolService.getCities();
        if (response && response.data) {
          if (response.data.success && response.data.data) {
            setCities(response.data.data.cities || response.data.data);
          } else if (response.data.cities) {
            setCities(response.data.cities);
          } else if (Array.isArray(response.data)) {
            setCities(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    loadCities();
  }, []);

  // Fetch districts when city changes
  useEffect(() => {
    if (selectedCity) {
      const loadDistricts = async () => {
        try {
          const response = await schoolService.getDistrictsByCity(selectedCity);
          if (response && response.data) {
            if (response.data.success && response.data.data) {
              setDistricts(response.data.data.districts || response.data.data);
            } else if (response.data.districts) {
              setDistricts(response.data.districts);
            } else if (Array.isArray(response.data)) {
              setDistricts(response.data);
            }
          }
          setSelectedDistrict(''); // Reset district when city changes
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      };
      loadDistricts();
    }
  }, [selectedCity]);

  const handleManualRefresh = () => {
    fetchLeaderboardData(true);
    fetchMyRanking();
  };

  const formatLastUpdated = () => {
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000);
    if (diff < 60) return `${diff} saniye önce güncellendi`;
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce güncellendi`;
    return lastUpdated.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Liderlik Tablosu
          </h1>
          <p className="text-gray-600">En başarılı öğrenciler ve okullar</p>
          
          {/* Last Updated */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-2">
            <FaClock />
            <span>{formatLastUpdated()}</span>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className={`ml-2 p-1.5 rounded-full transition-all ${
                refreshing 
                  ? 'bg-blue-100 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-110'
              }`}
            >
              <FaSync className={`text-sm ${refreshing ? 'animate-spin text-blue-500' : 'text-white'}`} />
            </button>
          </div>
        </div>

        {/* My Ranking Card */}
        <div className="mb-8">
          {myRankingLoading ? (
            <div className="bg-gray-100 rounded-xl p-6 text-gray-500 text-center">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            </div>
          ) : myRankingError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {myRankingError}
            </div>
          ) : myRanking ? (
            <MyRankingCard ranking={myRanking} />
          ) : (
            <div className="bg-gray-100 rounded-xl p-6 text-gray-500 text-center">
              <p>Ranking verisi bulunamadı</p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />

        {/* Controls Row */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Öğrenci Tipi
              </label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tümü</option>
                <option value="ortaokul">Ortaokul</option>
                <option value="lise">Lise</option>
              </select>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gösterilecek Sayı
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* City Selector (for city, district, school tabs) */}
            {(activeTab === 'city' || activeTab === 'district' || activeTab === 'school') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İl Seçin
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">İl seçin...</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            )}

            {/* District Selector (for district and school tabs) */}
            {(activeTab === 'district' || activeTab === 'school') && selectedCity && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İlçe Seçin
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">İlçe seçin...</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <LeaderboardSkeleton />
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {activeTab === 'school' ? (
              <SchoolRankingTable 
                schools={leaderboardData}
                refreshing={refreshing}
              />
            ) : (
              <UserRankingTable 
                users={leaderboardData}
                refreshing={refreshing}
                activeTab={activeTab}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;