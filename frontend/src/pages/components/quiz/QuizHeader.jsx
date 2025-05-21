// components/QuizHeader.jsx
import React from 'react';
import { FaTrophy, FaClock } from 'react-icons/fa';

const QuizHeader = ({ category, currentIndex, totalQuestions, timeLeft }) => {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  
  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      
      <div className="relative z-10">
        {/* Header Content */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FaTrophy className="text-yellow-300 text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-black">{category?.name || 'Quiz'}</h2>
              <p className="text-blue-100 text-sm">Başarı için odaklan!</p>
            </div>
          </div>
          
          {/* Timer */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-blue-100">Kalan Süre</div>
              <div className={`text-2xl font-black ${timeLeft <= 5 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                {timeLeft}s
              </div>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={timeLeft <= 5 ? '#fca5a5' : '#ffffff'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={2 * Math.PI * 45 * (1 - timeLeft / 20)}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <FaClock className={`text-xl ${timeLeft <= 5 ? 'text-red-300' : 'text-white'}`} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-blue-100">Soru {currentIndex + 1} / {totalQuestions}</span>
            <span className="text-white font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-white to-blue-100 h-3 rounded-full transition-all duration-700 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizHeader;