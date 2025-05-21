// CategorySlider.jsx - Animasyonlu Quiz Temalı Tasarım
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/api';
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
  FaBrain,
  FaStar,
  FaFire,
  FaGamepad,
  FaRocket,
  FaTrophy,
  FaLightbulb,
  FaGem,
  FaBolt,
  FaQuestion
} from 'react-icons/fa';

const CategorySlider = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  // Kategori ikonları mapping
  const categoryIcons = {
    'KELAM': FaStar,
    'TEMEL DİNİ BİLGİLER': FaBook,
    'FIKIH': FaLanguage,
    'SİYER': FaChartLine,
    'TEFSİR': FaBrain,
    'İSLAM KÜLTÜR VE MEDENİYETİ': FaGlobeAmericas,
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

  // Animasyonlu quiz temalı gradient renkleri
  const categoryGradients = [
    { 
      gradient: 'from-indigo-500 via-purple-500 to-pink-500', 
      bg: 'from-indigo-50 to-purple-50',
      glow: 'shadow-purple-500/30',
      accent: 'purple'
    },
    { 
      gradient: 'from-emerald-500 via-green-500 to-teal-500', 
      bg: 'from-emerald-50 to-green-50',
      glow: 'shadow-emerald-500/30',
      accent: 'emerald'
    },
    { 
      gradient: 'from-orange-500 via-red-500 to-pink-500', 
      bg: 'from-orange-50 to-red-50',
      glow: 'shadow-orange-500/30',
      accent: 'orange'
    },
    { 
      gradient: 'from-blue-500 via-cyan-500 to-teal-500', 
      bg: 'from-blue-50 to-cyan-50',
      glow: 'shadow-blue-500/30',
      accent: 'blue'
    },
    { 
      gradient: 'from-purple-500 via-pink-500 to-rose-500', 
      bg: 'from-purple-50 to-pink-50',
      glow: 'shadow-pink-500/30',
      accent: 'pink'
    },
    { 
      gradient: 'from-yellow-500 via-orange-500 to-red-500', 
      bg: 'from-yellow-50 to-orange-50',
      glow: 'shadow-yellow-500/30',
      accent: 'yellow'
    },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        if (response.data && response.data.categories) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + getVisibleCount() >= categories.length ? 0 : prevIndex + getVisibleCount()
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.max(0, categories.length - getVisibleCount()) : prevIndex - getVisibleCount()
    );
  };

  const getVisibleCount = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width >= 1024) return 4; // lg
      if (width >= 768) return 3;  // md
      if (width >= 640) return 2;  // sm
      return 1; // mobile
    }
    return 4;
  };

  const handleStartQuiz = (categoryId) => {
    navigate(`/quiz/${categoryId}`);
  };

  const handleGoToCategory = (categoryId) => {
    navigate(`/categories`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-2xl animate-spin"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-48"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-64 bg-gray-200 rounded-xl animate-pulse" 
                   style={{ animationDelay: `${index * 0.2}s` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center animate-bounce">
            <FaPuzzlePiece className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Quiz Kategorileri</h2>
            <p className="text-sm text-gray-500">Aklını test etmeye hazır mısın?</p>
          </div>
        </div>
        
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
            <FaGamepad className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Henüz kategori yok</h3>
          <p className="text-gray-500">Yakında quiz kategorileri burada olacak</p>
        </div>
      </div>
    );
  }

  const visibleCategories = categories.slice(currentIndex, currentIndex + getVisibleCount());

  return (
    <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full animate-float-slow"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full animate-float-medium"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full animate-float-fast"></div>
      </div>

      {/* Floating Quiz Icons */}
      <div className="absolute top-4 right-4 text-purple-400 animate-bounce" style={{ animationDelay: '0s' }}>
        <FaQuestion className="text-lg" />
      </div>
      <div className="absolute top-8 left-1/3 text-indigo-400 animate-bounce" style={{ animationDelay: '0.5s' }}>
        <FaLightbulb className="text-sm" />
      </div>
      <div className="absolute bottom-4 left-4 text-pink-400 animate-bounce" style={{ animationDelay: '1s' }}>
        <FaGem className="text-lg" />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="px-6 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center animate-pulse-custom">
                <FaGamepad className="text-white text-xl" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-spin-slow opacity-30"></div>
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 animate-slide-in">Quiz Kategorileri</h2>
                <p className="text-sm text-gray-500 animate-slide-in" style={{ animationDelay: '0.1s' }}>Aklını test etmeye hazır mısın? 🧠</p>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-purple-600">
                <FaTrophy className="text-yellow-500 animate-bounce" />
                <span className="text-sm font-bold animate-pulse">Level Up!</span>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            {categories.length > getVisibleCount() && (
              <div className="flex space-x-2">
                <button
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                  className={`w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center group ${
                    currentIndex === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 hover:from-purple-200 hover:to-pink-200 hover:scale-110 hover:rotate-3'
                  }`}
                >
                  <FaArrowLeft className="text-sm group-hover:animate-pulse" />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentIndex + getVisibleCount() >= categories.length}
                  className={`w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center group ${
                    currentIndex + getVisibleCount() >= categories.length 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 hover:from-purple-200 hover:to-pink-200 hover:scale-110 hover:-rotate-3'
                  }`}
                >
                  <FaArrowRight className="text-sm group-hover:animate-pulse" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleCategories.map((category, index) => {
              const Icon = categoryIcons[category.name] || FaBrain;
              const colorSet = categoryGradients[(currentIndex + index) % categoryGradients.length];
              
              return (
                <CategoryCard
                  key={category.id}
                  category={category}
                  Icon={Icon}
                  colorSet={colorSet}
                  index={currentIndex + index}
                  onStartQuiz={handleStartQuiz}
                  onGoToCategory={handleGoToCategory}
                  hoveredCard={hoveredCard}
                  setHoveredCard={setHoveredCard}
                  animationDelay={index * 0.1}
                />
              );
            })}
          </div>

          {/* Mobile Scroll Indicator */}
          {window.innerWidth < 640 && categories.length > 1 && (
            <div className="mt-6 flex justify-center space-x-2">
              {Array.from({ length: Math.ceil(categories.length / 1) }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    Math.floor(currentIndex / 1) === i 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 w-8 animate-pulse' 
                      : 'bg-gray-300 w-2'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Category Card Component - Animasyonlu Quiz Temalı
const CategoryCard = ({ category, Icon, colorSet, index, onStartQuiz, onGoToCategory, hoveredCard, setHoveredCard, animationDelay }) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 200);
    onGoToCategory(category.id);
  };

  const handleQuizStart = (e) => {
    e.stopPropagation();
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
      onStartQuiz(category.id);
    }, 100);
  };

  return (
    <div
      className={`group cursor-pointer transform transition-all duration-500 hover:-translate-y-2 hover:scale-105 animate-slide-up ${
        clicked ? 'scale-95' : ''
      }`}
      style={{ 
        animationDelay: `${animationDelay}s`,
        filter: hoveredCard === category.id ? 'brightness(1.1)' : hoveredCard ? 'brightness(0.9)' : 'brightness(1)'
      }}
      onClick={handleClick}
      onMouseEnter={() => setHoveredCard(category.id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      {/* Hover Glow Effect */}
      <div className={`absolute -inset-1 rounded-xl bg-gradient-to-r ${colorSet.gradient} opacity-0 group-hover:opacity-30 transition-all duration-500 blur-lg ${colorSet.glow}`}></div>
      
      {/* Card Container */}
      <div className="relative h-64 bg-white rounded-xl border border-gray-100 shadow-md group-hover:shadow-2xl transition-all duration-500 overflow-hidden">
        {/* Animated Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colorSet.bg} opacity-30 group-hover:opacity-50 transition-all duration-500`}></div>
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-2 right-2 text-xs opacity-20 group-hover:opacity-40 transition-opacity duration-300">
          <FaBolt className={`text-${colorSet.accent}-500 animate-pulse`} />
        </div>
        <div className="absolute bottom-2 left-2 text-xs opacity-20 group-hover:opacity-40 transition-opacity duration-300" style={{ animationDelay: '0.5s' }}>
          <FaStar className={`text-${colorSet.accent}-400 animate-pulse`} />
        </div>

        {/* Card Content */}
        <div className="relative h-full flex flex-col p-4">
          
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            {/* Icon with Rotation Animation */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorSet.gradient} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
              <Icon className="text-white text-lg animate-bounce-subtle" />
            </div>
            
            {/* Index Badge with Pulse */}
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-sm transform group-hover:scale-110 transition-all duration-300 ${
                hoveredCard === category.id ? 'animate-pulse' : ''
              }`}>
                <span className="text-xs font-black text-white">{index + 1}</span>
              </div>
              <FaRocket className={`text-orange-500 text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 animate-bounce-custom`} />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Category Name with Gradient Text */}
            <div className="mb-4">
              <h3 className={`font-black text-lg text-gray-900 leading-tight group-hover:bg-gradient-to-r group-hover:${colorSet.gradient} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 line-clamp-2 min-h-14 flex items-center animate-fade-in`}>
                {category.name}
              </h3>
            </div>

            {/* Stats Section with Icons */}
            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-500 space-x-3">
                <div className="flex items-center space-x-1 group-hover:text-purple-600 transition-colors duration-300">
                  <FaBrain className={`text-purple-500 text-sm group-hover:animate-pulse`} />
                  <span>Quiz</span>
                </div>
                <div className="flex items-center space-x-1 group-hover:text-orange-600 transition-colors duration-300">
                  <FaFire className={`text-orange-500 text-sm group-hover:animate-pulse`} />
                  <span>Popüler</span>
                </div>
              </div>
            </div>

            {/* Animated Play Button */}
            <div>
              <button
                onClick={handleQuizStart}
                className={`w-full relative overflow-hidden flex items-center justify-center gap-2 bg-gradient-to-r ${colorSet.gradient} text-white rounded-lg px-4 py-3 text-sm font-bold transition-all duration-300 hover:shadow-2xl transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 group-hover:animate-pulse-button`}
              >
                {/* Button Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                
                <FaPlay className="text-sm animate-bounce-subtle" />
                <span>Quiz'e Başla</span>
                
                {/* Button Glow */}
                <div className={`absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS Animations
const style = document.createElement('style');
style.textContent = `
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
  
  @keyframes float-medium {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(-5deg); }
  }
  
  @keyframes float-fast {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(10deg); }
  }
  
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes pulse-custom {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  @keyframes bounce-subtle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }
  
  @keyframes bounce-custom {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes pulse-button {
    0%, 100% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(147, 51, 234, 0); }
  }
  
  @keyframes slide-in {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
  .animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
  .animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
  .animate-spin-slow { animation: spin-slow 8s linear infinite; }
  .animate-pulse-custom { animation: pulse-custom 2s ease-in-out infinite; }
  .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
  .animate-bounce-custom { animation: bounce-custom 1.5s ease-in-out infinite; }
  .animate-pulse-button { animation: pulse-button 2s infinite; }
  .animate-slide-in { animation: slide-in 0.6s ease-out; }
  .animate-slide-up { animation: slide-up 0.8s ease-out; }
  .animate-fade-in { animation: fade-in 1s ease-out; }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

document.head.appendChild(style);

export default CategorySlider;