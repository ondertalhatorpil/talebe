// src/pages/admin/QuestionsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { questionService, categoryService } from '../../services/api';

const AdminQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    user_type: '',
    category: '',
    difficulty: ''
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Questions ve Categories getiriliyor...');
      
      const [questionsResponse, categoriesResponse] = await Promise.all([
        questionService.getQuestions(),
        categoryService.getCategories()
      ]);
      
      console.log('📊 Questions Response:', questionsResponse);
      console.log('📊 Categories Response:', categoriesResponse);
      
      // ✅ DÜZELTME: Response parsing
      const questionsData = questionsResponse?.data?.questions || [];
      const categoriesData = categoriesResponse?.data?.categories || [];
      
      console.log('📋 Parsed questions:', questionsData.length);
      console.log('📋 Parsed categories:', categoriesData.length);
      
      setQuestions(questionsData);
      setCategories(categoriesData);
      
    } catch (err) {
      console.error('❌ Veriler yüklenirken hata:', err);
      setError('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    console.log('🔧 Filter changed:', name, '=', value);
  };
  
  const applyFilters = () => {
    console.log('🔍 Filtreler uygulanıyor:', filters);
    fetchFilteredQuestions();
  };
  
  const resetFilters = () => {
    console.log('🔄 Filtreler sıfırlanıyor');
    setFilters({
      user_type: '',
      category: '',
      difficulty: ''
    });
    fetchData();
  };
  
  const fetchFilteredQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Boş olmayan filtreleri al
      const activeFilters = Object.entries(filters)
        .filter(([_, value]) => value && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      console.log('🎯 Active filters:', activeFilters);
      
      const response = await questionService.getQuestions(activeFilters);
      console.log('📊 Filtered Questions Response:', response);
      
      // ✅ DÜZELTME: Response parsing for filtered data
      const questionsData = response?.data?.questions || [];
      setQuestions(questionsData);
      
    } catch (err) {
      console.error('❌ Filtreleme sırasında hata:', err);
      setError('Filtreleme sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (question) => {
    setQuestionToDelete(question);
    setDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!questionToDelete) return;
    
    try {
      await questionService.deleteQuestion(questionToDelete.id);
      setQuestions(questions.filter(q => q.id !== questionToDelete.id));
      setDeleteModalOpen(false);
      setQuestionToDelete(null);
    } catch (err) {
      console.error('Soru silinirken hata:', err);
      alert('Soru silinirken bir hata oluştu.');
    }
  };
  
  // ✅ DÜZELTME: Kategori adını güvenli şekilde bul
  const getCategoryName = (categoryId) => {
    if (!categoryId || !categories.length) return 'Bilinmeyen Kategori';
    
    // categoryId hem string hem number olabilir, her ikisini de kontrol et
    const category = categories.find(c => 
      c.id == categoryId || c.name === categoryId
    );
    
    return category ? category.name : categoryId;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Sorular yükleniyor...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <div className="flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={fetchData}
            className="bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-sm"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sorular ({questions.length})</h1>
        <Link
          to="/admin/questions/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Yeni Soru Ekle
        </Link>
      </div>
      
      {/* Filtreler */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-1">
              Kullanıcı Tipi
            </label>
            <select
              id="user_type"
              name="user_type"
              value={filters.user_type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Tümü</option>
              <option value="ortaokul">Ortaokul</option>
              <option value="lise">Lise</option>
              <option value="both">Her İkisi</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Tümü</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              Zorluk
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={filters.difficulty}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Tümü</option>
              <option value="kolay">Kolay</option>
              <option value="orta">Orta</option>
              <option value="zor">Zor</option>
            </select>
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={applyFilters}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Filtrele
            </button>
            <button
              onClick={resetFilters}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Sıfırla
            </button>
          </div>
        </div>
      </div>
      
      {questions.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          Listelenecek soru bulunamadı.
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {questions.map((question) => (
              <li key={question.id}>
                <div className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* ✅ DÜZELTME: Badge'ler için daha iyi tasarım */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          question.difficulty === 'kolay' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'orta' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty?.charAt(0).toUpperCase() + question.difficulty?.slice(1) || 'Orta'}
                        </span>
                        
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {question.user_type === 'ortaokul' ? 'Ortaokul' :
                           question.user_type === 'lise' ? 'Lise' : 
                           question.user_type === 'both' ? 'Her İkisi' : 'Belirsiz'}
                        </span>
                        
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          {getCategoryName(question.category)}
                        </span>
                        
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
                          {question.points || 10} Puan
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-2 leading-relaxed">
                        {question.question_text}
                      </h3>
                      
                      <div className="text-sm text-gray-500">
                        ID: {question.id}
                        {question.created_at && (
                          <span className="ml-3">
                            Oluşturulma: {new Date(question.created_at).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 ml-4">
                      <Link
                        to={`/admin/questions/edit/${question.id}`}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(question)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Silme Onay Modalı */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Soruyu Sil</h3>
            <p className="text-gray-500 mb-4">
              "<strong>{questionToDelete?.question_text?.substring(0, 50)}...</strong>" sorusunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setQuestionToDelete(null);
                }}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestionsPage;