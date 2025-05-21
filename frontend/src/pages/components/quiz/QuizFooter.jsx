// components/QuizFooter.jsx
import React from 'react';
import { FaArrowLeft, FaGamepad } from 'react-icons/fa';

const QuizFooter = ({ currentIndex, totalQuestions, onBack }) => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-t border-gray-200">
      <div className="flex justify-between items-center">
        {/* Back button */}
        <button
          onClick={onBack}
          className="group flex items-center text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
        >
          <FaArrowLeft className="mr-2 group-hover:animate-pulse" />
          Kategorilere Dön
        </button>
        
        {/* Progress indicator */}
        <div className="flex items-center space-x-3">
          <FaGamepad className="text-purple-500" />
          <div className="text-sm text-gray-600">
            <span className="font-bold text-purple-600">{currentIndex + 1}</span>
            <span className="mx-1">/</span>
            <span>{totalQuestions}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizFooter;