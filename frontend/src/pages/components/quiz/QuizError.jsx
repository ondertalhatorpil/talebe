// components/QuizError.jsx
import React from 'react';
import { FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

const QuizError = ({ error, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex justify-center items-center">
      <div className="max-w-md mx-auto p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
          {/* Animated Error Icon */}
          <div className="text-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-red-400 to-orange-500 flex items-center justify-center animate-pulse">
                <FaExclamationTriangle className="text-white text-4xl" />
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-4 border-red-300 animate-ping opacity-75"></div>
            </div>
          </div>
          
          {/* Error Content */}
          <div className="text-center">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Bir Sorun Oluştu</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
            
            {/* Action Button */}
            <button
              onClick={onBack}
              className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center justify-center">
                <FaArrowLeft className="mr-3 group-hover:animate-pulse" />
                Kategorilere Dön
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizError;