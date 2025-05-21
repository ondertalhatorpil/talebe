// src/pages/ProfilePage.jsx - Birinci Bölüm (Imports ve State)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { 
  FaUser as UserIcon, 
  FaTrophy as TrophyIcon, 
  FaBook as BookOpenIcon, 
  FaChartBar as ChartBarIcon,
  FaCalendar as CalendarIcon,
  FaGraduationCap as AcademicCapIcon,
  FaMapMarkerAlt as MapPinIcon,
  FaStar as StarIcon,
  FaSchool as SchoolIcon,
  FaAward as AwardIcon,
  FaPercent as PercentIcon,
  FaQuestion as QuestionIcon
} from 'react-icons/fa';

const ProfilePage = () => {
  const { userId } = useParams(); // URL'den user ID'yi al
  const { user, updateProfile } = useAuthStore();
  const [profileUser, setProfileUser] = useState(null); // Görüntülenen profil kullanıcısı
  const [stats, setStats] = useState(null);
  const [rankings, setRankings] = useState(null);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hangi kullanıcının profilini göstereceğimizi belirle
  const isOwnProfile = !userId; // userId yoksa kendi profili
  const targetUserId = userId || user?.id; // userId varsa onu, yoksa kendi id'ni kullan

  useEffect(() => {
    fetchProfileData();
  }, [userId, user?.id]); // userId değişince veya login değişince yeniden çek
  

const fetchProfileData = async () => {
  try {
    setLoading(true);
    console.log('🚀 ProfilePage - fetchProfileData started');
    console.log('📍 ProfilePage - isOwnProfile:', isOwnProfile);
    console.log('📍 ProfilePage - targetUserId:', targetUserId);
    
    // Profil bilgilerini yükle
    if (isOwnProfile) {
      console.log('👤 Loading own profile...');
      await updateProfile();
      setProfileUser(user);
    } else {
      console.log('👤 Loading other user profile...');
      const profileResponse = await userService.getUserProfile(targetUserId);
      console.log('📥 Profile response:', profileResponse.data);
      setProfileUser(profileResponse.data.data);
    }
    
    // API çağrıları
    console.log('📊 Making parallel API calls...');
    const [
      statsResponse,
      rankingsResponse,
      performanceResponse,
      activityResponse
    ] = await Promise.all([
      userService.getUserStats(isOwnProfile ? null : targetUserId),
      userService.getComprehensiveRanking(isOwnProfile ? null : targetUserId),
      userService.getCategoryPerformance(isOwnProfile ? null : targetUserId),
      userService.getRecentActivity(isOwnProfile ? null : targetUserId)
    ]);

    // Response'ları logla
    console.log('📊 Stats response:', statsResponse.data);
    console.log('🏆 Rankings response:', rankingsResponse.data);
    console.log('📈 Performance response:', performanceResponse.data);
    console.log('📋 Activity response:', activityResponse.data);

    // State'leri güncelle
    console.log('💾 Updating states...');
    setStats(statsResponse.data.data || statsResponse.data || statsResponse.data.stats);
    setRankings(rankingsResponse.data.data);
    setCategoryPerformance(performanceResponse.data.data.categoryPerformance);
    setRecentActivity(activityResponse.data.data.activities);
    
    // Final states'i logla
    console.log('✅ Final stats:', statsResponse.data.data || statsResponse.data || statsResponse.data.stats);
    console.log('✅ Final categoryPerformance:', performanceResponse.data.data.categoryPerformance);
    console.log('✅ Final recentActivity:', activityResponse.data.data.activities);
    
    setError(null);
  } catch (err) {
    console.error('❌ Profil verileri yüklenirken hata:', err);
    console.error('❌ Error details:', err.response?.data);
    setError('Profil verileri yüklenirken bir hata oluştu.');
  } finally {
    setLoading(false);
    console.log('🏁 ProfilePage - fetchProfileData finished');
  }
};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAccuracyPercentage = () => {
    if (!stats || !stats.totalQuestions) return 0;
    return ((stats.correctAnswers / stats.totalQuestions) * 100).toFixed(1);
  };

  // DEBUG: Hangi kullanıcının profilini gösterdiğimizi logla
  console.log('ProfilePage - URL userId:', userId);
  console.log('ProfilePage - Login user:', user?.id);
  console.log('ProfilePage - Target userId:', targetUserId);
  console.log('ProfilePage - Is own profile:', isOwnProfile);
  console.log('ProfilePage - Profile user:', profileUser);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mb-4 mx-auto"></div>
          <p className="text-gray-600">
            {isOwnProfile ? 'Profiliniz yükleniyor...' : 'Kullanıcı profili yükleniyor...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex justify-center items-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-3xl mb-3">⚠️</div>
          {error}
        </div>
      </div>
    );
  }

  // Görüntülenecek kullanıcı bilgilerini belirle
  const displayUser = profileUser || user;
  // src/pages/ProfilePage.jsx - Üçüncü Bölüm (Render - JSX)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Profile Type Indicator */}
        {!isOwnProfile && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-center">
            <span className="font-medium">
              {displayUser?.first_name} {displayUser?.last_name} kullanıcısının profilini görüntülüyorsunuz
            </span>
          </div>
        )}
        
        {/* Profil Header - Geliştirilmiş */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative overflow-hidden">
          {/* Arka plan dekorasyon */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100 to-pink-100 rounded-full -mr-16 -mt-16 opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full -ml-12 -mb-12 opacity-30"></div>
          
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  {displayUser?.first_name && displayUser?.last_name ? (
                    <span className="text-white text-2xl sm:text-3xl font-black">
                      {displayUser.first_name.charAt(0).toUpperCase()}{displayUser.last_name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <UserIcon className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <StarIcon className="w-4 h-4 text-white" />
                </div>
              </div>
              
              {/* Kullanıcı Bilgileri */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {displayUser?.first_name} {displayUser?.last_name}
                </h1>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center sm:justify-start text-gray-600">
                    <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-500" />
                    <span className="font-medium">
                      {displayUser?.user_type === 'ortaokul' ? 'Ortaokul' : 'Lise'} • {displayUser?.class}. Sınıf
                    </span>
                  </div>
                  
                  {/* Okul İsmi */}
                  {displayUser?.school ? (
                    <div className="flex items-center justify-center sm:justify-start text-gray-600">
                      <SchoolIcon className="w-5 h-5 mr-2 text-purple-500" />
                      <span>{displayUser.school.name}</span>
                    </div>
                  ) : displayUser?.school_name ? (
                    <div className="flex items-center justify-center sm:justify-start text-gray-600">
                      <SchoolIcon className="w-5 h-5 mr-2 text-purple-500" />
                      <span>{displayUser.school_name}</span>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      Okul bilgisi bulunmuyor
                    </div>
                  )}
                  
                  {/* Şehir ve İlçe */}
                  {(displayUser?.school?.city || displayUser?.city) && (
                    <div className="flex items-center justify-center sm:justify-start text-gray-500">
                      <MapPinIcon className="w-5 h-5 mr-2 text-pink-500" />
                      <span>
                        {displayUser?.school?.city || displayUser?.city}
                        {(displayUser?.school?.district || displayUser?.district) && 
                          ` • ${displayUser?.school?.district || displayUser?.district}`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Puan Badge */}
              <div className="text-center bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl px-6 py-4 text-white shadow-lg">
                <div className="text-3xl sm:text-4xl font-bold">{displayUser?.points || 0}</div>
                <div className="text-sm sm:text-base opacity-90">Toplam Puan</div>
                {!isOwnProfile && (
                  <div className="text-xs opacity-75 mt-1">#{targetUserId}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ana İstatistikler - Geliştirilmiş Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <QuestionIcon className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats?.totalQuestions || 0}
            </div>
            <div className="text-gray-600 font-medium">Toplam Soru</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <TrophyIcon className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats?.correctAnswers || 0}
            </div>
            <div className="text-gray-600 font-medium">Doğru Cevap</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <PercentIcon className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              %{getAccuracyPercentage()}
            </div>
            <div className="text-gray-600 font-medium">Başarı Oranı</div>
          </div>
        </div>

        {/* Sıralamalar - Geliştirilmiş */}
        {rankings && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <AwardIcon className="w-7 h-7 mr-3 text-yellow-500" />
              {isOwnProfile ? 'Sıralamalarım' : `${displayUser?.first_name}'in Sıralamaları`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-200 hover:shadow-md transition-all duration-300">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    #{rankings.rankings.turkey.rank}
                  </div>
                  <div className="text-gray-700 font-semibold mb-1">Türkiye</div>
                  <div className="text-sm text-gray-600">
                    {rankings.rankings.turkey.total} kişi içinde
                  </div>
                  <div className="text-xs text-yellow-600 mt-2 font-medium">
                    %{rankings.rankings.turkey.percentage} ön
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 hover:shadow-md transition-all duration-300">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    #{rankings.rankings.city.rank}
                  </div>
                  <div className="text-gray-700 font-semibold mb-1">{rankings.rankings.city.name}</div>
                  <div className="text-sm text-gray-600">
                    {rankings.rankings.city.total} kişi içinde
                  </div>
                  <div className="text-xs text-blue-600 mt-2 font-medium">
                    %{rankings.rankings.city.percentage} ön
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 hover:shadow-md transition-all duration-300">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    #{rankings.rankings.district.rank}
                  </div>
                  <div className="text-gray-700 font-semibold mb-1">{rankings.rankings.district.name}</div>
                  <div className="text-sm text-gray-600">
                    {rankings.rankings.district.total} kişi içinde
                  </div>
                  <div className="text-xs text-green-600 mt-2 font-medium">
                    %{rankings.rankings.district.percentage} ön
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200 hover:shadow-md transition-all duration-300">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    #{rankings.rankings.school.rank}
                  </div>
                  <div className="text-gray-700 font-semibold mb-1">Okul</div>
                  <div className="text-sm text-gray-600">
                    {rankings.rankings.school.total} kişi içinde
                  </div>
                  <div className="text-xs text-purple-600 mt-2 font-medium">
                    %{rankings.rankings.school.percentage} ön
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kategori Performansı ve Son Aktiviteler - İyileştirilmiş */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="w-6 h-6 mr-3 text-blue-500" />
              Kategori Performansı
            </h2>
            <div className="space-y-4">
              {categoryPerformance.length > 0 ? (
                categoryPerformance.map((category, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-300">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-900">{category.category_name}</span>
                      <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                        {category.correct_answers}/{category.total_questions}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${category.score}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600 font-medium">%{category.score} başarı</span>
                      <span className="text-purple-600 font-medium">{category.total_points} puan</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz kategori performansı bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <CalendarIcon className="w-6 h-6 mr-3 text-green-500" />
              Son Aktiviteler
            </h2>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border-l-4 border-green-500 hover:bg-gray-100 transition-all duration-300">
                    <div className="font-semibold text-gray-900 mb-2">
                      {activity.category} kategorisinde quiz çözüldü
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{activity.totalQuestions} soru</span>
                      <span className="text-green-600 font-medium">{activity.totalPoints} puan</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz aktivite bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Geri Dön Butonu (Kendi profili değilse) */}
        {!isOwnProfile && (
          <div className="text-center">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Geri Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;