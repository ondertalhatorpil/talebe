import axios from 'axios';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://test.onder.org.tr/api';

  
// Axios instance oluşturma
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios interceptor - her istekte token ekler
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios response interceptor eklemesi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token süresi dolmuşsa otomatik logout
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Ağ hatası veya sunucu hatası için kullanıcıya bildirim göster
    if (!error.response || error.response.status >= 500) {
      console.error('Sunucu hatası:', error);
      // Toast notification göster
    }

    return Promise.reject(error);
  }
);

// Auth servisleri
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/users/profile'),

  // ✅ YENİ: Admin kontrolü için endpoint eklendi
  checkAdminStatus: () => api.get('/users/admin-check'),
};

// Okul servisleri
export const schoolService = {
  getAllSchools: () => api.get('/schools'),
  getCities: () => api.get('/schools/cities'),
  getDistrictsByCity: (city) => api.get(`/schools/districts/${city}`),
  getSchoolsByCity: (city) => api.get(`/schools/city/${city}`),
  getSchoolsByDistrict: (city, district, userType) => {
    // Parametreleri kodlayalım
    const encodedCity = encodeURIComponent(city);
    const encodedDistrict = encodeURIComponent(district);

    // Type parametresini opsiyonel yap
    if (userType) {
      return api.get(`/schools/city/${encodedCity}/district/${encodedDistrict}?type=${encodeURIComponent(userType)}`);
    } else {
      return api.get(`/schools/city/${encodedCity}/district/${encodedDistrict}`);
    }
  },

  // 🆕 RANKING Endpoint'leri
  // En iyi okullar (genel)
  getTopSchools: (params = {}) => {
    const queryString = new URLSearchParams();
    if (params.limit) queryString.append('limit', params.limit);

    const queryStr = queryString.toString();
    return api.get(`/schools/top${queryStr ? `?${queryStr}` : ''}`);
  },

  // İl bazında en iyi okullar
  getTopSchoolsByCity: (city, params = {}) => {
    const queryString = new URLSearchParams();
    if (params.limit) queryString.append('limit', params.limit);

    const queryStr = queryString.toString();
    return api.get(`/schools/rankings/city/${encodeURIComponent(city)}${queryStr ? `?${queryStr}` : ''}`);
  },

  // İlçe bazında en iyi okullar
  getTopSchoolsByDistrict: (city, district, params = {}) => {
    const queryString = new URLSearchParams();
    if (params.limit) queryString.append('limit', params.limit);

    const queryStr = queryString.toString();
    return api.get(`/schools/rankings/city/${encodeURIComponent(city)}/district/${encodeURIComponent(district)}${queryStr ? `?${queryStr}` : ''}`);
  },

  // Okul sıralamasını getir (Türkiye, il, ilçe bazında)
  getSchoolRankings: (schoolId) => api.get(`/schools/rankings/${schoolId}`),

  // İl/İlçe istatistiklerini getir
  getCityStats: (city) => api.get(`/schools/stats/city/${encodeURIComponent(city)}`),
  getDistrictStats: (city, district) => api.get(`/schools/stats/city/${encodeURIComponent(city)}/district/${encodeURIComponent(district)}`)
};

// Kategori servisleri
export const categoryService = {
  getCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};

// Quiz servisleri
export const quizService = {
  startQuiz: (categoryId) => api.post('/quiz/category', { categoryId }),
  answerQuestion: (questionId, answerId, responseTime) =>
    api.post('/quiz/answer', { questionId, answerId, responseTime }),
  checkDailyLimit: (categoryId) => api.get(`/quiz/limit/${categoryId}`),
};

// Joker servisleri
export const jokerService = {
  getJokerStatus: (categoryId) => api.get(`/jokers/status/${categoryId}`),
  useFiftyPercent: (categoryId, questionId) =>
    api.post('/jokers/use/fifty-percent', { categoryId, questionId }),
  useDoubleAnswer: (categoryId, questionId) =>
    api.post('/jokers/use/double-answer', { categoryId, questionId }),
};

// Leaderboard servisleri
export const leaderboardService = {
  // Genel en iyi kullanıcılar
  getTopUsers: (params = {}) => {
    const queryString = new URLSearchParams();
    if (params.type && params.type !== 'all') queryString.append('type', params.type);
    if (params.limit) queryString.append('limit', params.limit);

    const queryStr = queryString.toString();
    return api.get(`/users/top${queryStr ? `?${queryStr}` : ''}`);
  },

  // Genel en iyi okullar
  getTopSchools: (params = {}) => {
    const queryString = new URLSearchParams();
    if (params.limit) queryString.append('limit', params.limit);

    const queryStr = queryString.toString();
    return api.get(`/schools/top${queryStr ? `?${queryStr}` : ''}`);
  },

  // Aylık liderlik tablosu
  getMonthlyLeaderboard: (params = {}) => {
    const queryString = new URLSearchParams();
    if (params.type && params.type !== 'all') queryString.append('type', params.type);
    if (params.limit) queryString.append('limit', params.limit);

    const queryStr = queryString.toString();
    return api.get(`/users/monthly-leaderboard${queryStr ? `?${queryStr}` : ''}`);
  }
};

// Kullanıcı servisleri - Güncellenmiş ve genişletilmiş versiyonu
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwordData) => api.post('/users/change-password', passwordData),

  // 🆕 YENİ EKLENEN: Belirli bir kullanıcının profilini getir
  getUserProfile: (userId) => api.get(`/users/profile/${userId}`),

  // Admin işlemleri
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  getUserCount: () => api.get('/users/count'),
  toggleUserStatus: (id, active) => api.put(`/users/${id}/status`, { is_active: active }),

  // 🆕 GÜNCELLENEN: İstatistik ve etkinlik servisleri - userId parametresi eklendi
  getUserStats: (userId = null) => {
    const endpoint = userId ? `/users/stats/${userId}` : '/users/stats';
    return api.get(endpoint);
  },
  
  getRecentActivity: (userId = null) => {
    const endpoint = userId ? `/users/activity/${userId}` : '/users/activity';
    return api.get(endpoint);
  },
  
  getCategoryPerformance: (userId = null) => {
    const endpoint = userId ? `/users/category-performance/${userId}` : '/users/category-performance';
    return api.get(endpoint);
  },
  
  getQuizHistory: () => api.get('/users/quiz-history'),

  // 🆕 GÜNCELLENEN: RANKING Endpoint'leri - userId parametresi eklendi
  // Kullanıcının kapsamlı sıralaması (Türkiye, İl, İlçe, Okul)
  getComprehensiveRanking: (userId = null) => {
    const endpoint = userId ? `/users/rankings/comprehensive/${userId}` : '/users/rankings/comprehensive';
    return api.get(endpoint);
  },

  // Kullanıcının kendi ranking bilgileri (alternatif endpoint)
  getMyRankings: () => api.get('/users/rankings/my'),

  // İl bazında en iyi kullanıcılar
  getTopUsersByCity: (city, params = {}) => {
    const queryString = new URLSearchParams();
    if (params.type && params.type !== 'all') queryString.append('type', params.type);
    if (params.limit) queryString.append('limit', params.limit);

    const queryStr = queryString.toString();
    return api.get(`/users/rankings/city/${encodeURIComponent(city)}${queryStr ? `?${queryStr}` : ''}`);
  },

  getTopUsers: (params = {}) => {
    const queryString = new URLSearchParams();
    if (params.type && params.type !== 'all') queryString.append('type', params.type);
    if (params.limit) queryString.append('limit', params.limit);

    const queryStr = queryString.toString();
    return api.get(`/users/top${queryStr ? `?${queryStr}` : ''}`);
  },

  // İlçe bazında en iyi kullanıcılar
  getTopUsersByDistrict: (city, district, params = {}) => {
    const queryString = new URLSearchParams();
    if (params.type && params.type !== 'all') queryString.append('type', params.type);
    if (params.limit) queryString.append('limit', params.limit);

    const queryStr = queryString.toString();
    return api.get(`/users/rankings/city/${encodeURIComponent(city)}/district/${encodeURIComponent(district)}${queryStr ? `?${queryStr}` : ''}`);
  },

  // Eski ranking endpoint'i (backward compatibility için korundu)
  getUserRanking: (userId) => api.get(`/users/rankings/${userId}`)
};

// İstatistik servisleri
export const statsService = {
  getDailyTrends: () => api.get('/stats/daily-trends'),
  getSchoolComparisonStats: (schoolId) => api.get(`/stats/school/${schoolId}`),
  getUserProgressByCategory: (categoryId) => api.get(`/stats/user/category/${categoryId}`)
};

// src/services/api.js - soru servisleri 
export const questionService = {
  getQuestions: (filters = {}) => {
    // Filtreleri URL parametrelerine dönüştür
    const params = new URLSearchParams();

    if (filters.user_type) params.append('user_type', filters.user_type);
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    return api.get(`/questions?${params.toString()}`);
  },
  getQuestionById: (id) => api.get(`/questions/${id}`),
  createQuestion: (data) => api.post('/questions', data),
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
  answerQuestion: (questionId, answerId, responseTime) => api.post('/questions/answer', { questionId, answerId, responseTime })
};

export default api;