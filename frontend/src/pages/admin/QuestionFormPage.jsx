// src/pages/admin/QuestionFormPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionService, categoryService } from '../../services/api';

const AdminQuestionFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    question_text: '',
    user_type: 'both',
    category: '',
    difficulty: 'orta',
    answers: [
      { answer_text: '', is_correct: true },
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false }
    ]
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchCategories();
    
    if (isEditing) {
      fetchQuestion();
    }
  }, [id]);
  
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data.categories);
      
      // İlk kategoriyi varsayılan olarak seç (eğer henüz seçilmediyse)
      if (!formData.category && response.data.categories.length > 0) {
        setFormData(prev => ({
          ...prev,
          category: response.data.categories[0].id
        }));
      }
    } catch (err) {
      console.error('Kategoriler yüklenirken hata:', err);
    }
  };
  
  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await questionService.getQuestionById(id);
      const question = response.data.question;
      
      // Yanıtları düzenle - her zaman 4 seçenek olmalı
      let answers = [...question.answers];
      while (answers.length < 4) {
        answers.push({ answer_text: '', is_correct: false });
      }
      
      setFormData({
        question_text: question.question_text,
        user_type: question.user_type,
        category: question.category,
        difficulty: question.difficulty,
        answers
      });
      
      setError(null);
    } catch (err) {
      setError('Soru bilgileri yüklenirken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAnswerChange = (index, field, value) => {
    setFormData(prev => {
      const updatedAnswers = [...prev.answers];
      updatedAnswers[index] = { 
        ...updatedAnswers[index], 
        [field]: field === 'is_correct' ? value === 'true' : value 
      };
      
      // Eğer bir yanıt doğru olarak işaretlendiyse, diğerlerini yanlış yap
      if (field === 'is_correct' && value === 'true') {
        updatedAnswers.forEach((answer, i) => {
          if (i !== index) {
            updatedAnswers[i] = { ...updatedAnswers[i], is_correct: false };
          }
        });
      }
      
      return { ...prev, answers: updatedAnswers };
    });
  };
  
  const validateForm = () => {
    // Soru metni kontrolü
    if (!formData.question_text.trim()) {
      setError('Soru metni gereklidir.');
      return false;
    }
    
    // Kategori kontrolü
    if (!formData.category) {
      setError('Lütfen bir kategori seçin.');
      return false;
    }
    
    // Cevaplar kontrolü
    let hasCorrectAnswer = false;
    let emptyAnswers = 0;
    
    for (const answer of formData.answers) {
      if (!answer.answer_text.trim()) {
        emptyAnswers++;
      }
      
      if (answer.is_correct) {
        hasCorrectAnswer = true;
      }
    }
    
    // En az 2 cevap olmalı ve en az 1 doğru cevap olmalı
    if (formData.answers.length - emptyAnswers < 2) {
      setError('En az 2 cevap seçeneği gereklidir.');
      return false;
    }
    
    if (!hasCorrectAnswer) {
      setError('En az bir doğru cevap seçeneği işaretlemelisiniz.');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Boş cevapları filtrele
      const cleanedFormData = {
        ...formData,
        answers: formData.answers.filter(answer => answer.answer_text.trim())
      };
      
      if (isEditing) {
        await questionService.updateQuestion(id, cleanedFormData);
      } else {
        await questionService.createQuestion(cleanedFormData);
      }
      
      navigate('/admin/questions');
    } catch (err) {
      setError('Soru kaydedilirken bir hata oluştu.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Soru Düzenle' : 'Yeni Soru'}
      </h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="question_text" className="block text-sm font-medium text-gray-700 mb-1">
              Soru Metni
            </label>
            <textarea
              id="question_text"
              name="question_text"
              value={formData.question_text}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-1">
                Kullanıcı Tipi
              </label>
              <select
                id="user_type"
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="both">Her İkisi</option>
                <option value="ortaokul">Ortaokul</option>
                <option value="lise">Lise</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Kategori Seçin</option>
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
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="kolay">Kolay (5 Puan)</option>
                <option value="orta">Orta (10 Puan)</option>
                <option value="zor">Zor (20 Puan)</option>
              </select>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-3">Cevap Seçenekleri</h3>
          <p className="text-sm text-gray-500 mb-4">
            En az 2 cevap seçeneği ekleyin ve bir tanesini doğru olarak işaretleyin.
          </p>
          
          {formData.answers.map((answer, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
              <div className="flex items-start">
                <div className="flex-1">
                  <label htmlFor={`answer_${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Cevap {index + 1}
                  </label>
                  <input
                    type="text"
                    id={`answer_${index}`}
                    value={answer.answer_text}
                    onChange={(e) => handleAnswerChange(index, 'answer_text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="ml-4 mt-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="correct_answer"
                      value="true"
                      checked={answer.is_correct}
                      onChange={(e) => handleAnswerChange(index, 'is_correct', e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Doğru</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/questions')}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              disabled={saving}
            >
              İptal
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="animate-spin inline-block h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminQuestionFormPage;