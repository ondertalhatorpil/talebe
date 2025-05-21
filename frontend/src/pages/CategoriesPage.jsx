import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService, quizService } from '../services/api';
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaCode, 
  FaChartLine, 
  FaFlag,
  FaGlobeAmericas,
  FaAtom,
  FaHeartbeat,
  FaDna,
  FaLanguage,
  FaBook,
  FaCalculator,
  FaPuzzlePiece,
  FaPlay,
  FaLock,
  FaCheckCircle,
  FaTrophy,
  FaClock,
  FaUsers,
  FaBrain
} from 'react-icons/fa';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryLimits, setCategoryLimits] = useState({});
  
  const navigate = useNavigate();

  // Kategori ikonları mapping
  const categoryIcons = {
    'Matematik': FaCalculator,
    'Fen Bilgisi': FaAtom,
    'Türkçe': FaLanguage,
    'Sosyal Bilgiler': FaGlobeAmericas,
    'İngilizce': FaFlag,
    'Geometri': FaPuzzlePiece,
    'Coğrafya': FaGlobeAmericas,
    'Tarih': FaBook,
    'Biyoloji': FaDna,
    'Fizik': FaAtom,
    'Kimya': FaHeartbeat,
    'Din Kültürü': FaBook
  };

  // Gradient renkleri
  const categoryGradients = [
    { gradient: 'from-blue-500 to-purple-600', shadow: 'shadow-blue-500/25', bg: 'bg-blue-50/50' },
    { gradient: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/25', bg: 'bg-green-50/50' },
    { gradient: 'from-purple-500 to-indigo-600', shadow: 'shadow-purple-500/25', bg: 'bg-purple-50/50' },
    { gradient: 'from-orange-500 to-pink-600', shadow: 'shadow-orange-500/25', bg: 'bg-orange-50/50' },
    { gradient: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/25', bg: 'bg-pink-50/50' },
    { gradient: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-500/25', bg: 'bg-indigo-50/50' },
    { gradient: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/25', bg: 'bg-cyan-50/50' },
    { gradient: 'from-red-500 to-orange-600', shadow: 'shadow-red-500/25', bg: 'bg-red-50/50' },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        console.log('Categories response:', response.data);
        setCategories(response.data.categories);
        
        // Her kategori için limit bilgilerini al
        const limits = {};
        for (const category of response.data.categories) {
          console.log('Processing category:', category);
          try {
            const limitResponse = await quizService.checkDailyLimit(category.id);
            limits[category.id] = limitResponse.data;
          } catch (err) {
            console.error(`Kategori ${category.id} için limit bilgisi alınamadı:`, err);
          }
        }
        
        setCategoryLimits(limits);
      } catch (err) {
        setError('Kategoriler yüklenirken bir hata oluştu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleStartQuiz = (categoryId) => {
    console.log('handleStartQuiz called with:', categoryId);
    console.log('Navigating to:', `/quiz/${categoryId}`);
    navigate(`/quiz/${categoryId}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full animate-spin">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 text-center">Kategoriler yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-12">
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-6">
              <FaPuzzlePiece className="text-white text-4xl" />
            </div>
            <p className="text-gray-500 text-lg">Henüz kategori bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              console.log('Rendering category:', category);
              
              const Icon = categoryIcons[category.name] || FaPuzzlePiece;
              const colorSet = categoryGradients[index % categoryGradients.length];
              const limitInfo = categoryLimits[category.id];
              const limitReached = limitInfo?.limit_reached || false;
              const remainingQuestions = limitInfo?.remaining || 0;
              const totalLimit = limitInfo?.limit || 30;
              
              // İlerleme yüzdesini hesapla
              const progressPercentage = limitInfo 
                ? ((totalLimit - remainingQuestions) / totalLimit) * 100 
                : 0;
              
              return (
                <div key={category.id} className="group">
                  <div className="relative h-full">
                    {/* Card */}
                    <div className={`relative h-full bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-gray-200 ${colorSet.shadow}`}>
                      {/* Header - Icon Section */}
                      <div className={`${colorSet.bg} relative p-6 ${colorSet.gradient} bg-gradient-to-br`}>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between">
                            <div className={`w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white`}>
                              <Icon className="text-2xl" />
                            </div>
                            <div className="text-right">
                              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-sm font-bold">
                                {index + 1}
                              </div>
                            </div>
                          </div>
                          
                          {/* Category Name */}
                          <h2 className="text-2xl font-bold text-white mt-4 leading-tight">
                            {category.name}
                          </h2>
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-16 translate-x-16"></div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        {/* Description */}
                        <div className="mb-6">
                          <p className="text-gray-600 leading-relaxed">
                            {category.description || 'Bu kategoride bilgilerinizi test edin ve yeni şeyler öğrenin.'}
                          </p>
                        </div>
                        
                        {/* Progress Section */}
                        <div className="space-y-4">
                          {/* Progress Bar */}
                          <div>
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                              <span>Günlük İlerleme</span>
                              <span className="font-medium">
                                {totalLimit - remainingQuestions}/{totalLimit}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`bg-gradient-to-r ${colorSet.gradient} h-3 rounded-full transition-all duration-500 relative overflow-hidden`}
                                style={{ width: `${progressPercentage}%` }}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Status */}
                          <div className="flex items-center gap-2">
                            {limitReached ? (
                              <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                                <FaTrophy className="text-sm" />
                                <span className="text-sm font-medium">Günlük limit tamamlandı</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                                <FaCheckCircle className="text-sm" />
                                <span className="text-sm font-medium">{remainingQuestions} soru kaldı</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Start Button */}
                          <button
                            onClick={() => {
                              console.log('Button clicked for category:', category);
                              handleStartQuiz(category.id);
                            }}
                            disabled={limitReached}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                              limitReached
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                : `bg-gradient-to-r ${colorSet.gradient} text-white hover:scale-[1.02] hover:shadow-lg transform-gpu`
                            }`}
                          >
                            {limitReached ? (
                              <>
                                <FaLock className="text-sm" />
                                Quiz Tamamlandı
                              </>
                            ) : (
                              <>
                                <FaPlay className="text-sm" />
                                Quiz'e Başla
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;