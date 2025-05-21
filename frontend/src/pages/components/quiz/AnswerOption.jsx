// components/AnswerOption.jsx
import React from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AnswerOption = ({
  answer,
  index,
  isSelected,
  isCorrect,
  isDisabled,
  showResult,
  onClick,
  animationDelay
}) => {
  // Determine the visual state
  const getAnswerState = () => {
    if (!showResult) {
      return {
        className: "border-2 border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 hover:scale-102 hover:shadow-lg cursor-pointer",
        icon: null
      };
    }
    
    if (isSelected) {
      if (isCorrect) {
        return {
          className: "border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 animate-pulse",
          icon: <FaCheckCircle className="text-green-500 text-xl" />
        };
      } else {
        return {
          className: "border-2 border-red-500 bg-gradient-to-r from-red-50 to-pink-50 animate-pulse",
          icon: <FaTimesCircle className="text-red-500 text-xl" />
        };
      }
    }
    
    if (isCorrect) {
      return {
        className: "border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 animate-pulse",
        icon: <FaCheckCircle className="text-green-500 text-xl" />
      };
    }
    
    return {
      className: "border-2 border-gray-200 bg-gray-50 opacity-60",
      icon: null
    };
  };

  const answerState = getAnswerState();
  const optionLabels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div
      className={`${answerState.className} ${
        isDisabled ? 'cursor-not-allowed opacity-50' : ''
      } rounded-xl p-4 transition-all duration-300 transform group relative overflow-hidden`}
      onClick={!isDisabled ? onClick : undefined}
      style={{ 
        animationDelay: `${animationDelay}ms`,
        animation: 'slideInUp 0.5s ease-out forwards'
      }}
    >
      {/* Background animation on hover */}
      {!showResult && !isDisabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Option label */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
            showResult 
              ? isSelected || isCorrect
                ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                : 'bg-gray-400'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 group-hover:scale-110'
          } transition-transform duration-300`}>
            {optionLabels[index] || index + 1}
          </div>
          
          {/* Answer text */}
          <div className="text-lg text-gray-700 group-hover:text-gray-900 transition-colors duration-300 flex-1">
            {answer.answer_text}
          </div>
        </div>
        
        {/* Result icon */}
        {answerState.icon && (
          <div className="ml-4">
            {answerState.icon}
          </div>
        )}
      </div>
      
      {/* Pulse animation for correct answer reveal */}
      {showResult && isCorrect && (
        <div className="absolute inset-0 bg-green-400 opacity-20 rounded-xl animate-ping"></div>
      )}
      
      {/* Error animation for wrong selected answer */}
      {showResult && isSelected && !isCorrect && (
        <div className="absolute inset-0 bg-red-400 opacity-20 rounded-xl animate-pulse"></div>
      )}
    </div>
  );
};

// CSS for slide-in animation
const styles = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.querySelector('#answer-option-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'answer-option-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default AnswerOption;