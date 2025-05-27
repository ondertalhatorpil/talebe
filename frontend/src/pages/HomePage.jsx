// HomePage.jsx - Kategori isimleri düzeltilmiş
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, leaderboardService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import {
  FaTrophy,
  FaBrain,
  FaCheckCircle,
  FaChartLine,
  FaPlay,
  FaArrowRight,
  FaCrown,
  FaFire,
  FaStar,
  FaBookOpen,
  FaBolt,
  FaAward,
  FaLightbulb
} from 'react-icons/fa';
import CategorySlider from './components/CategorySlider';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState({
    userStats: {
      totalPoints: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      averageScore: 0
    },
    recentActivities: [],
    topUsers: [],
    categoryPerformance: []
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Kategori isimlerini ID'den isme çeviren fonksiyon - Veritabanı verilerine göre güncellendi
  const getCategoryName = (categoryId) => {
    const categoryMap = {
      1: 'KELAM',
      2: 'TEMEL DİNİ BİLGİLER', 
      3: 'FIKIH',
      4: 'SİYER',
      5: 'TEFSİR',
      6: 'İSLAM KÜLTÜR VE MEDENİYETİ',
      7: 'Coğrafya',  // Bu ID varsa korundu
      8: 'Tarih',     // Bu ID varsa korundu
      9: 'Biyoloji',  // Bu ID varsa korundu
      10: 'Fizik',    // Bu ID varsa korundu
      11: 'Kimya',    // Bu ID varsa korundu
      12: 'Geometri'  // Bu ID varsa korundu
    };
    return categoryMap[categoryId] || `Kategori ${categoryId}`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const results = await Promise.allSettled([
          userService.getUserStats(),
          userService.getRecentActivity(),
          userService.getCategoryPerformance(),
          leaderboardService.getTopUsers({ limit: 5 })
        ]);

        const [statsResult, activityResult, performanceResult, topUsersResult] = results;

        let stats = { totalPoints: 0, totalQuestions: 0, correctAnswers: 0, averageScore: 0 };
        let activities = [];
        let performance = [];
        let topUsers = [];

        // Stats parsing
        if (statsResult.status === 'fulfilled' && statsResult.value?.data) {
          try {
            const data = statsResult.value.data;
            if (data.success === true && data.data) {
              stats = data.data;
            } else if (data.data && data.data.data) {
              stats = data.data.data;
            } else if (data.totalPoints !== undefined) {
              stats = data;
            }
          } catch (err) {
            console.error('Stats parsing error:', err);
          }
        }

        // Activities parsing
        if (activityResult.status === 'fulfilled' && activityResult.value?.data) {
          try {
            const data = activityResult.value.data;
            if (data.success === true && data.data) {
              activities = data.data.activities || data.data || [];
            } else if (data.data && data.data.data) {
              activities = data.data.data.activities || data.data.data || [];
            } else if (Array.isArray(data.activities)) {
              activities = data.activities;
            } else if (Array.isArray(data)) {
              activities = data;
            }
          } catch (err) {
            console.error('Activities parsing error:', err);
          }
        }

if (performanceResult.status === 'fulfilled') {
  try {
    console.log('🚀 DEBUG: Performance result status:', performanceResult.status);
    console.log('📦 DEBUG: Performance raw value:', performanceResult.value?.data);
    
    // Deep logging
    if (performanceResult.value?.data) {
      const data = performanceResult.value.data;
      console.log('🔍 DEBUG: data type:', typeof data);
      console.log('🔍 DEBUG: data is array?', Array.isArray(data));
      console.log('🔍 DEBUG: data.success:', data.success);
      
      if (data.data) {
        console.log('🔍 DEBUG: data.data type:', typeof data.data);
        console.log('🔍 DEBUG: data.data is array?', Array.isArray(data.data));
        
        if (data.data.categoryPerformance) {
          console.log('🔍 DEBUG: data.data.categoryPerformance type:', typeof data.data.categoryPerformance);
          console.log('🔍 DEBUG: data.data.categoryPerformance is array?', Array.isArray(data.data.categoryPerformance));
          console.log('🔍 DEBUG: data.data.categoryPerformance length:', data.data.categoryPerformance.length);
          
          if (data.data.categoryPerformance.length > 0) {
            console.log('📝 DEBUG: First categoryPerformance item:', data.data.categoryPerformance[0]);
          }
        }
      }
    }
    
    // 1. Doğrudan erişim denemeleri
    let extractedPerformance = [];
    
    // Doğrudan diziye erişim yolları
    if (Array.isArray(performanceResult.value?.data)) {
      extractedPerformance = performanceResult.value.data;
      console.log('✅ Extracted from direct array');
    }
    // 2. data.categoryPerformance erişimi
    else if (performanceResult.value?.data?.data?.categoryPerformance) {
      extractedPerformance = performanceResult.value.data.data.categoryPerformance;
      console.log('✅ Extracted from data.data.categoryPerformance');
    }
    // 3. data.data erişimi (array)
    else if (Array.isArray(performanceResult.value?.data?.data)) {
      extractedPerformance = performanceResult.value.data.data;
      console.log('✅ Extracted from data.data array');
    }
    // 4. data erişimi (objede array property)
    else if (performanceResult.value?.data?.data) {
      // Obje içindeki ilk array property'i bul
      const dataObj = performanceResult.value.data.data;
      const arrayProps = Object.keys(dataObj).filter(key => Array.isArray(dataObj[key]));
      
      if (arrayProps.length > 0) {
        extractedPerformance = dataObj[arrayProps[0]];
        console.log(`✅ Extracted from data.data.${arrayProps[0]}`);
      }
    }
    // 5. Hiçbir şey bulunamadı, boş array kullan
    else {
      console.log('⚠️ No suitable data structure found for performance');
    }
    
    console.log('📊 Extracted performance data (raw):', extractedPerformance);
    console.log('📊 Extracted performance length:', extractedPerformance.length);
    
    // Veri hazırlama
    if (extractedPerformance && extractedPerformance.length > 0) {
      performance = extractedPerformance.map(item => {
        let categoryName = item.category_name || item.categoryName;
        
        // item.category kullanımını kontrol et - bazı API'ler bu şekilde döndürür
        if (!categoryName && item.category) {
          categoryName = item.category;
        }
        
        // Eğer hala yoksa, ID'den isim çevir
        if (!categoryName || categoryName.trim() === '') {
          const categoryId = item.category_id || item.categoryId || item.id;
          categoryName = getCategoryName(categoryId);
        }
        
        console.log('🎯 Converting category:', {original: item.category_name || item.category, mapped: categoryName});
        
        // Diğer alan adlarını da kontrol et (tutarsız API'ler için)
        return {
          ...item,
          category_name: categoryName,
          category_id: item.category_id || item.categoryId || item.category || item.id || 0,
          total_questions: item.total_questions || item.totalQuestions || 0,
          correct_answers: item.correct_answers || item.correctAnswers || 0,
          score: item.score || parseInt(item.averageScore) || 0,
          total_points: item.total_points || item.totalPoints || 0
        };
      });
      
      console.log('🔄 Processed performance items:', performance.length);
      console.log('🔄 First processed item:', performance[0]);
    } else {
      console.log('📭 No performance data to process');
      performance = [];
    }
  } catch (err) {
    console.error('❌ Performance parsing error:', err);
    performance = [];
  }
}

        // Top Users parsing
        if (topUsersResult.status === 'fulfilled' && topUsersResult.value?.data) {
          try {
            const data = topUsersResult.value.data;

            if (data.success === true && data.data) {
              if (Array.isArray(data.data)) {
                topUsers = data.data;
              } else if (data.data.users) {
                topUsers = data.data.users;
              }
            } else if (data.data && data.data.data) {
              if (Array.isArray(data.data.data)) {
                topUsers = data.data.data;
              } else if (data.data.data.users) {
                topUsers = data.data.data.users;
              }
            } else if (Array.isArray(data.users)) {
              topUsers = data.users;
            } else if (Array.isArray(data)) {
              topUsers = data;
            }
          } catch (err) {
            console.error('TopUsers parsing error:', err);
          }
        }

        const finalData = {
          userStats: stats,
          recentActivities: activities,
          topUsers: topUsers,
          categoryPerformance: performance
        };

        console.log('Final category performance:', finalData.categoryPerformance); // Debug için

        setDashboardData(finalData);
        setError(null);

      } catch (error) {
        console.error('Dashboard error:', error);
        setError(`Dashboard yüklenirken hata: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full animate-spin">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 text-center">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-20 w-full">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 -translate-y-40 translate-x-40"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/10 translate-y-30 -translate-x-30"></div>

        <div className="w-full px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 sm:px-18 lg:space-y-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FaBrain className="text-white text-xl sm:text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white mb-1 sm:mb-2 leading-tight">
                  <span className="inline-block">Hoş geldin,</span>{' '}
                  <span className="text-yellow-200 inline-block">{user?.first_name || 'Kullanıcı'}</span>!
                </h1>
                <p className="text-white/90 text-base sm:text-lg lg:text-xl">İşte performansının özeti</p>
              </div>
            </div>
            <div className="w-full lg:w-auto">
              <button
                onClick={() => navigate('/categories')}
                className="group relative inline-flex items-center justify-center w-full lg:w-auto px-6 sm:px-8 py-3 sm:py-4 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-gradient-to-r from-yellow-400 to-orange-500"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <FaPlay className="mr-2 sm:mr-3 text-base sm:text-lg relative z-10" />
                <span className="relative z-10 text-sm sm:text-base">Quiz Çözmeye Başla</span>
                <FaArrowRight className="ml-2 sm:ml-3 text-xs sm:text-sm relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Toplam Puan */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 relative p-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                  <FaTrophy className="text-2xl" />
                </div>
                <div className="text-right">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FaAward className="text-white text-xs" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mt-4">Toplam Puan</h2>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-16 translate-x-16"></div>
            </div>
            <div className="p-6">
              <p className="text-3xl font-black text-gray-900 mb-2">
                {dashboardData.userStats.totalPoints?.toLocaleString() || '0'}
              </p>
              <p className="text-gray-500 text-sm">Quiz çözerek puan kazan</p>
            </div>
          </div>

          {/* Çözülen Soru */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 relative p-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                  <FaBrain className="text-2xl" />
                </div>
                <div className="text-right">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FaLightbulb className="text-white text-xs" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mt-4">Çözülen Soru</h2>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-16 translate-x-16"></div>
            </div>
            <div className="p-6">
              <p className="text-3xl font-black text-gray-900 mb-2">
                {dashboardData.userStats.totalQuestions?.toLocaleString() || '0'}
              </p>
              <p className="text-gray-500 text-sm">Toplam çözülen soru</p>
            </div>
          </div>

          {/* Doğru Cevap */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 relative p-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                  <FaCheckCircle className="text-2xl" />
                </div>
                <div className="text-right">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FaStar className="text-white text-xs" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mt-4">Doğru Cevap</h2>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-16 translate-x-16"></div>
            </div>
            <div className="p-6">
              <p className="text-3xl font-black text-gray-900 mb-2">
                {dashboardData.userStats.correctAnswers?.toLocaleString() || '0'}
              </p>
              <p className="text-gray-500 text-sm">Doğru cevapladığım soru</p>
            </div>
          </div>

          {/* Başarı Oranı */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 relative p-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                  <FaChartLine className="text-2xl" />
                </div>
                <div className="text-right">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FaFire className="text-white text-xs" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mt-4">Başarı Oranı</h2>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-16 translate-x-16"></div>
            </div>
            <div className="p-6">
              <p className="text-3xl font-black text-gray-900 mb-2">
                %{Math.round(dashboardData.userStats.averageScore || 0)}
              </p>
              <p className="text-gray-500 text-sm">Ortalama başarı yüzden</p>
            </div>
          </div>
        </div>

        {/* Kategori Slider */}
        <div className="mb-22 mt-22">
          <CategorySlider />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
  {/* Kategori Performansı - Modern Quiz Temalı Tasarım */}
  <div className="relative bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
    {/* Animated Background Pattern */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-50"></div>
    
    {/* Floating Elements */}
    <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
    <div className="absolute bottom-8 left-6 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-30 animate-bounce"></div>
    
    <div className="relative z-10">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <FaChartLine className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Kategori Performansı</h2>
            <p className="text-sm text-gray-500">Başarı analizin</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {dashboardData.categoryPerformance && dashboardData.categoryPerformance.length > 0 ? (
          <div className="space-y-4">
            {dashboardData.categoryPerformance.slice(0, 5).map((category, index) => {
              const scoreColor = category.score >= 80 ? 'from-green-500 to-emerald-600' :
                                category.score >= 60 ? 'from-blue-500 to-indigo-600' :
                                category.score >= 40 ? 'from-yellow-500 to-orange-600' :
                                'from-red-500 to-pink-600';

              return (
                <div 
                  key={category.category_id || category.id || index} 
                  className="group relative bg-white rounded-xl p-4 border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Category Card */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                        {category.category_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${scoreColor} text-white`}>
                        <span className="text-sm font-black">%{category.score || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${scoreColor} rounded-full transition-all duration-1000 ease-out`}
                      style={{ 
                        width: `${category.score || 0}%`,
                        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)'
                      }}
                    >
                      {/* Progress Bar Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FaCheckCircle className="text-green-500" />
                      <span className="font-semibold">{category.correct_answers || 0}/{category.total_questions || 0}</span>
                      <span>doğru</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaTrophy className="text-yellow-500" />
                      <span className="font-black text-purple-600">{category.total_points || 0}</span>
                      <span>puan</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl animate-spin"></div>
                <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
                  <FaBrain className="text-purple-500 text-2xl" />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Henüz başlamamışsın!</h3>
            <p className="text-gray-500 mb-6">İlk quiz'ini çözerek yolculuğuna başla</p>
            <button
              onClick={() => navigate('/categories')}
              className="group relative inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <FaBolt className="mr-2 text-lg relative z-10 group-hover:animate-pulse" />
              <span className="relative z-10">Quiz Çözmeye Başla</span>
              <FaArrowRight className="ml-2 text-sm relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Liderlik Tablosu - Podium Temalı Tasarım */}
  <div className="relative bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
    {/* Animated Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 opacity-40"></div>
    
    {/* Trophy Animation Background */}
    <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-10 animate-ping"></div>
    
    <div className="relative z-10">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <FaTrophy className="text-white text-xl animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Liderlik Tablosu</h2>
              <p className="text-sm text-gray-500">En başarılı öğrenciler</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/leaderboard')}
            className="text-orange-600 font-bold hover:text-orange-700 transition-colors hover:scale-105 transform"
          >
            Tümünü Gör
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {dashboardData.topUsers && dashboardData.topUsers.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.topUsers.slice(0, 5).map((topUser, index) => {
              const podiumColors = [
                { 
                  bg: 'from-yellow-400 via-yellow-500 to-yellow-600', 
                  icon: FaCrown,
                  badge: 'from-yellow-100 to-yellow-200 text-yellow-800',
                  border: 'border-yellow-300'
                },
                { 
                  bg: 'from-gray-400 via-gray-500 to-gray-600', 
                  icon: FaAward,
                  badge: 'from-gray-100 to-gray-200 text-gray-800',
                  border: 'border-gray-300'
                },
                { 
                  bg: 'from-orange-400 via-orange-500 to-orange-600', 
                  icon: FaAward,
                  badge: 'from-orange-100 to-orange-200 text-orange-800',
                  border: 'border-orange-300'
                },
                { 
                  bg: 'from-purple-400 via-purple-500 to-purple-600', 
                  icon: FaAward,
                  badge: 'from-purple-100 to-purple-200 text-purple-800',
                  border: 'border-purple-300'
                },
                { 
                  bg: 'from-blue-400 via-blue-500 to-blue-600', 
                  icon: FaAward,
                  badge: 'from-blue-100 to-blue-200 text-blue-800',
                  border: 'border-blue-300'
                }
              ];

              const colors = podiumColors[index] || podiumColors[4];
              const MedalIcon = colors.icon;

              return (
                <div 
                  key={topUser.id} 
                  className={`group relative flex items-center space-x-4 p-4 rounded-xl bg-white border ${colors.border} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 relative">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${colors.bg} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <MedalIcon className="text-white text-lg" />
                    </div>
                    {/* Rank Number */}
                    <div className={`absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r ${colors.badge} rounded-full flex items-center justify-center text-xs font-black`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                      {topUser.first_name} {topUser.last_name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate mt-1 flex items-center">
                      <FaBookOpen className="mr-1 text-xs" />
                      {topUser.school_name}
                    </p>
                  </div>
                  
                  {/* Points */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-lg font-black text-purple-600">
                      {topUser.points?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">puan</div>
                  </div>

                  {/* Animated Glow Effect */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 bg-gradient-to-r from-purple-400 to-pink-400 transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl animate-pulse"></div>
                <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
                  <FaTrophy className="text-yellow-500 text-2xl animate-bounce" />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Henüz veriler yüklenmedi</h3>
            <p className="text-gray-500">Liderlik tablosu yakında burada olacak</p>
          </div>
        )}
      </div>
    </div>
  </div>
</div>

<style jsx>{`
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .group:nth-child(odd) {
    animation: slideInLeft 0.6s ease-out forwards;
  }
  
  .group:nth-child(even) {
    animation: slideInRight 0.6s ease-out forwards;
  }
`}</style>
      </div>
    </div>
  );
};

export default HomePage;