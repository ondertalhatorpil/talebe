// components/QuizCountdown.jsx - Minimal ve Şık Tasarım
import React, { useState, useEffect } from 'react';
import { FaPlay, FaRocket, FaBrain, FaStar, FaBolt } from 'react-icons/fa';

const QuizCountdown = ({ category, onCountdownComplete }) => {
  const [countdown, setCountdown] = useState(3);
  const [phase, setPhase] = useState('intro'); // 'intro', 'counting', 'launch'

  useEffect(() => {
    // İlk başta intro fazı
    const introTimer = setTimeout(() => {
      setPhase('counting');
      startCountdown();
    }, 1500);

    return () => clearTimeout(introTimer);
  }, []);

  const startCountdown = () => {
    let currentCount = 3;
    setCountdown(currentCount);

    const timer = setInterval(() => {
      currentCount -= 1;
      setCountdown(currentCount);

      if (currentCount === 0) {
        clearInterval(timer);
        setPhase('launch');
        
        // Launch fazından sonra quiz'e geç
        setTimeout(() => {
          onCountdownComplete();
        }, 1000);
      }
    }, 1000);
  };

  const getCountdownText = () => {
    switch (countdown) {
      case 3: return 'Hazırlan';
      case 2: return 'Odaklan';
      case 1: return 'Başlıyor';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
      
      {/* Minimal Floating Elements */}
      <div className="absolute top-20 left-20 w-3 h-3 bg-purple-200 rounded-full animate-float opacity-60"></div>
      <div className="absolute top-32 right-32 w-2 h-2 bg-blue-200 rounded-full animate-float-delay opacity-40"></div>
      <div className="absolute bottom-24 left-24 w-4 h-4 bg-indigo-200 rounded-full animate-float-slow opacity-30"></div>
      <div className="absolute bottom-40 right-20 w-2 h-2 bg-purple-300 rounded-full animate-float opacity-50"></div>
      
      <div className="text-center px-4 relative z-10 max-w-lg w-full">
        
        {/* Intro Phase */}
        {phase === 'intro' && (
          <div className="animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 rounded-3xl flex items-center justify-center animate-gentle-pulse">
              <FaBrain className="text-gray-600 text-3xl" />
            </div>
            <h1 className="text-3xl font-light text-gray-800 mb-3 animate-slide-up">
              Quiz Başlıyor
            </h1>
            <p className="text-lg text-gray-500 font-normal animate-slide-up-delay">
              {category?.name || 'Hazırlan'}
            </p>
          </div>
        )}
        
        {/* Countdown Phase */}
        {phase === 'counting' && countdown > 0 && (
          <div className="animate-fade-in">
            {/* Minimal Number Display */}
            <div className="relative mb-8">
              <div className="text-8xl font-extralight text-gray-800 animate-scale-pulse">
                {countdown}
              </div>
              
              {/* Simple Progress Ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border border-gray-200 relative">
                  <div 
                    className="absolute inset-0 rounded-full border-2 border-purple-400 transition-all duration-1000"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, ${
                        countdown === 3 ? '100% 0%, 100% 50%' :
                        countdown === 2 ? '100% 0%, 100% 100%, 50% 100%' :
                        '100% 0%, 100% 100%, 0% 100%, 0% 50%'
                      })`
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Simple Text */}
            <p className="text-xl text-gray-600 font-light animate-fade-in-out">
              {getCountdownText()}
            </p>
          </div>
        )}
        
        {/* Launch Phase */}
        {phase === 'launch' && (
          <div className="animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center animate-gentle-bounce">
              <FaRocket className="text-white text-3xl transform rotate-45" />
            </div>
            <h2 className="text-4xl font-light text-gray-800 mb-6 animate-zoom-in">
              Başlayalım!
            </h2>
            
            {/* Elegant Progress Bar */}
            <div className="w-64 h-1 mx-auto bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 animate-fill-bar rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Minimal CSS Animations
const styles = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes scale-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes gentle-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.02); opacity: 0.9; }
  }
  
  @keyframes gentle-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes zoom-in {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes fill-bar {
    from { width: 0%; }
    to { width: 100%; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes fade-in-out {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0.8; }
  }
  
  .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
  .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
  .animate-slide-up-delay { animation: slide-up 0.6s ease-out 0.2s forwards; opacity: 0; }
  .animate-scale-pulse { animation: scale-pulse 1s ease-in-out; }
  .animate-gentle-pulse { animation: gentle-pulse 3s ease-in-out infinite; }
  .animate-gentle-bounce { animation: gentle-bounce 0.8s ease-out; }
  .animate-zoom-in { animation: zoom-in 0.5s ease-out forwards; }
  .animate-fill-bar { animation: fill-bar 1s ease-out forwards; }
  .animate-float { animation: float 4s ease-in-out infinite; }
  .animate-float-delay { animation: float 4s ease-in-out 0.5s infinite; }
  .animate-float-slow { animation: float 6s ease-in-out infinite; }
  .animate-fade-in-out { animation: fade-in-out 1s ease-in-out forwards; }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.querySelector('#quiz-countdown-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'quiz-countdown-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default QuizCountdown;