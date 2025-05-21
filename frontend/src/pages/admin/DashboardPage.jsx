// src/pages/admin/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService, categoryService, questionService } from '../../services/api';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalCategories: 0,
    recentUsers: [],
    recentQuestions: []
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Not: Bu API endpoint'leri henüz eklenmemiş olabilir,
        // backend yapısına göre bunları da eklemeniz gerekebilir
        const [
          usersResponse,
          questionsResponse,
          categoriesResponse
        ] = await Promise.all([
          userService.getUserCount(), // Bu endpoint'i ekleyin
          questionService.getQuestions({ limit: 5 }), // Son 5 soru
          categoryService.getCategories()
        ]);
        
        setStats({
          totalUsers: usersResponse.data.count || 0,
          totalQuestions: questionsResponse.data.count || 0,
          totalCategories: categoriesResponse.data.categories.length || 0,
          recentUsers: usersResponse.data.users || [],
          recentQuestions: questionsResponse.data.questions || []
        });
      } catch (err) {
        console.error('Dashboard verileri yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/users" className="text-sm text-indigo-600 hover:text-indigo-900">
              Kullanıcıları Görüntüle →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Toplam Soru</p>
              <p className="text-2xl font-bold">{stats.totalQuestions}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/questions" className="text-sm text-indigo-600 hover:text-indigo-900">
              Soruları Görüntüle →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Toplam Kategori</p>
              <p className="text-2xl font-bold">{stats.totalCategories}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/categories" className="text-sm text-indigo-600 hover:text-indigo-900">
              Kategorileri Görüntüle →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Son Eklenen Sorular */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Son Eklenen Sorular</h2>
        </div>
        <div className="p-6">
          {stats.recentQuestions.length === 0 ? (
            <p className="text-gray-500">Henüz soru eklenmemiş.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {stats.recentQuestions.map((question) => (
                <li key={question.id} className="py-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{question.question_text}</p>
                      <p className="text-sm text-gray-500">
                        {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)} - 
                        {question.user_type === 'ortaokul' ? ' Ortaokul' : 
                          question.user_type === 'lise' ? ' Lise' : ' Her İkisi'}
                      </p>
                    </div>
                    <Link 
                      to={`/admin/questions/edit/${question.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Düzenle
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Hızlı Erişim */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Hızlı Erişim</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/admin/categories/create"
              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 p-4 rounded-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Kategori Ekle
            </Link>
            
            <Link
              to="/admin/questions/create"
              className="bg-green-50 text-green-700 hover:bg-green-100 p-4 rounded-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Soru Ekle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;