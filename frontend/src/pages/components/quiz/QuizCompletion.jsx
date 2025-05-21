// components/QuizCompletion.jsx
import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTrophy, FaStar, FaArrowLeft, FaFire } from 'react-icons/fa';

const QuizCompletion = ({ userAnswers, onBack }) => {
  const [animationStep, setAnimationStep] = useState(0);
  
  // Calculate results
  const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
  const totalPoints = userAnswers.reduce((sum, answer) => sum + answer.points, 0);
  const percentage = Math.round((correctAnswers / userAnswers.length) * 100);
  
  // Performance feedback
  const getPerformanceFeedback = () => {
    if (percentage >= 90) return { message: "Mükemmel!", color: "from-green-500 to-emerald-600", icon: FaTrophy };
    if (percentage >= 75) return { message: "Harika!", color: "from-blue-500 to-purple-600", icon: FaStar };
    if (percentage >= 60) return { message: "İyi!", color: "from-yellow-500 to-orange-600", icon: FaFire };
    return { message: "Tekrar dene!", color: "from-red-500 to-pink-600", icon: FaCheckCircle };
  };
  
  const feedback = getPerformanceFeedback();
  const PerformanceIcon = feedback.icon;
  
  // Trigger animations in sequence
  useEffect(() => {
    const timeouts = [
      setTimeout(() => setAnimationStep(1), 500),
      setTimeout(() => setAnimationStep(2), 1000),
      setTimeout(() => setAnimationStep(3), 1500),
      setTimeout(() => setAnimationStep(4), 2000),
      setTimeout(() => setAnimationStep(5), 2500),
    ];
    
    return () => timeouts.forEach(timeout => clearTimeout(timeout));
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex justify-center items-center">
      <div className="max-w-lg mx-auto p-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Success Animation */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-50"></div>
            <div className="relative z-10">
              <div className={`transform transition-all duration-1000 ${animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-green-500 text-4xl" />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Quiz Tamamlandı!</h2>
                <p className="text-green-100">{feedback.message}</p>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full animate-bounce"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/30 rounded-full animate-pulse"></div>
          </div>
          
          {/* Results Grid */}
          <div className="p-8">
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Correct Answers */}
              <div className={`transform transition-all duration-700 delay-300 ${animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <div className="bg-gradient-to-br from-green-100 to-emerald-200 p-4 rounded-2xl text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaCheckCircle className="text-white text-xl" />
                  </div>
                  <div className="text-3xl font-black text-green-800 mb-1">{correctAnswers}</div>
                  <div className="text-sm text-green-600">Doğru</div>
                </div>
              </div>
              
              {/* Wrong Answers */}
              <div className={`transform transition-all duration-700 delay-500 ${animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <div className="bg-gradient-to-br from-red-100 to-pink-200 p-4 rounded-2xl text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-xl font-bold">✗</span>
                  </div>
                  <div className="text-3xl font-black text-red-800 mb-1">{userAnswers.length - correctAnswers}</div>
                  <div className="text-sm text-red-600">Yanlış</div>
                </div>
              </div>
              
              {/* Total Points */}
              <div className={`transform transition-all duration-700 delay-700 ${animationStep >= 4 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <div className="bg-gradient-to-br from-purple-100 to-blue-200 p-4 rounded-2xl text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaTrophy className="text-white text-xl" />
                  </div>
                  <div className="text-3xl font-black text-purple-800 mb-1">{totalPoints}</div>
                  <div className="text-sm text-purple-600">Puan</div>
                </div>
              </div>
            </div>
            
            {/* Performance Bar */}
            <div className={`transform transition-all duration-1000 delay-900 ${animationStep >= 5 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600">Başarı Oranı</span>
                  <span className="text-lg font-black text-gray-900">{percentage}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div 
                    className={`h-6 rounded-full bg-gradient-to-r ${feedback.color} transition-all duration-2000 ease-out relative`}
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Performance Badge */}
            <div className="text-center mb-8">
              <div className={`transform transition-all duration-700 delay-1100 ${animationStep >= 5 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                <div className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${feedback.color} text-white rounded-full font-bold shadow-lg`}>
                  <PerformanceIcon className="mr-2" />
                  {feedback.message}
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <div className={`transform transition-all duration-500 delay-1300 ${animationStep >= 5 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
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
    </div>
  );
};

export default QuizCompletion;