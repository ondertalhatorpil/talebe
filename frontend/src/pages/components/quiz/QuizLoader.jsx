// components/QuizLoader.jsx
import React from 'react';
import { FaBrain, FaGamepad } from 'react-icons/fa';

const QuizLoader = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex justify-center items-center">
      <div className="text-center">
        {/* Animated Brain Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
            <FaBrain className="text-white text-5xl" />
          </div>
          <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-purple-300 animate-spin border-t-transparent"></div>
          
          {/* Floating elements */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
        </div>
        
        {/* Loading text with typing animation */}
        <div className="overflow-hidden">
          <h2 className="text-3xl font-black text-gray-800 mb-4 animate-pulse">
            Quiz Hazırlanıyor
          </h2>
        </div>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-200"></div>
        </div>
        
        <p className="text-gray-600 text-lg">Sorular yükleniyor, lütfen bekleyiniz...</p>
      </div>
    </div>
  );
};

export default QuizLoader;