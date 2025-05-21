// QuizPage.jsx - Responsive Quiz Teması (Sabitlenmiş Layout + Bug Fix)
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService, categoryService, jokerService } from '../services/api';
import QuizLoader from './components/quiz/QuizLoader';
import QuizError from './components/quiz/QuizError';
import QuizCompletion from './components/quiz/QuizCompletion';
import QuizCountdown from './components/quiz/QuizCountdown';
import QuizHeader from './components/quiz/QuizHeader';
import QuizContent from './components/quiz/QuizContent';
import QuizFooter from './components/quiz/QuizFooter';

const QuizPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answerSelected, setAnswerSelected] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [jokers, setJokers] = useState({
    fiftyPercent: { active: false, used: false, eliminated: [] },
    doubleAnswer: { active: false, used: false, firstAttemptUsed: false }
  });
  const [animations, setAnimations] = useState({
    questionTransition: false,
    jokerActivation: null,
    answerReveal: false
  });
  
  const timerRef = useRef(null);
  
  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch category data
        const categoryResponse = await categoryService.getCategoryById(categoryId);
        setCategory(categoryResponse.data.category);
        
        // Check joker status
        const jokerStatusResponse = await jokerService.getJokerStatus(categoryId);
        const jokerStatus = jokerStatusResponse.data.joker_status;
        
        // Start quiz
        const quizResponse = await quizService.startQuiz(categoryId);
        setQuiz(quizResponse.data.quiz);
        
        // Show countdown after data is loaded
        setLoading(false);
        setShowCountdown(true);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Quiz yüklenirken bir hata oluştu.';
        setError(errorMessage);
        setLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [categoryId]);
  
  // Handle countdown completion
  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setQuestionStartTime(Date.now());
  };
  
  // Timer logic
  useEffect(() => {
    if (loading || quizComplete || !quiz || answerSelected || showCountdown) return;
    
    setTimeLeft(20);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestionIndex, loading, quizComplete, answerSelected, showCountdown]);
  
  // Handle time expiration
  const handleTimeExpired = async () => {
    if (answerSelected || !quiz) return;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const elapsedTime = 21;
    
    try {
      const randomAnswerId = currentQuestion.answers[0].id;
      await quizService.answerQuestion(currentQuestion.id, randomAnswerId, elapsedTime);
      
      setAnswerSelected(true);
      setUserAnswer({
        id: randomAnswerId,
        isCorrect: false,
        points: 0
      });
      
      setUserAnswers(prev => [...prev, {
        questionId: currentQuestion.id,
        answerId: randomAnswerId,
        isCorrect: false,
        points: 0,
        responseTime: elapsedTime
      }]);
      
      // Trigger answer reveal animation
      setAnimations(prev => ({ ...prev, answerReveal: true }));
      
      setTimeout(() => {
        goToNextQuestion();
      }, 2000);
    } catch (err) {
      console.error('Süre aşımı işlenirken hata:', err);
    }
  };
  
  // Handle answer click - ÇİFT CEVAP JOKERİ BUG FİX
  const handleAnswerClick = async (answerId) => {
    if (answerSelected || !quiz) return;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const elapsedTime = (Date.now() - questionStartTime) / 1000;
    
    clearInterval(timerRef.current);
    setAnswerSelected(true);
    
    try {
      const response = await quizService.answerQuestion(
        currentQuestion.id, 
        answerId, 
        elapsedTime
      );
      
      const isCorrect = response.data.is_correct;
      const points = response.data.points_earned;
      const secondChance = response.data.second_chance; // Backend'den gelen değer
      
      setUserAnswer({
        id: answerId,
        isCorrect,
        points,
        // Sadece ikinci deneme veya doğru cevap verildiyse doğru cevabı göster
        correctAnswerId: secondChance ? null : response.data.correct_answer_id
      });
      
      // Handle double answer joker - BUG FİX
      if (secondChance) {
        // İlk yanlış deneme - doğru cevabı gösterme
        setUserAnswers(prev => [...prev, {
          questionId: currentQuestion.id,
          answerId,
          isCorrect,
          points: 0,
          responseTime: elapsedTime,
          isFirstAttempt: true
        }]);
        
        setJokers(prev => ({
          ...prev,
          doubleAnswer: {
            ...prev.doubleAnswer,
            firstAttemptUsed: true
          }
        }));
        
        // Trigger answer reveal animation (yanlış cevap olarak)
        setAnimations(prev => ({ ...prev, answerReveal: true }));
        
        setTimeout(() => {
          // İkinci şans için hazırla
          setAnswerSelected(false);
          setUserAnswer(null);
          setQuestionStartTime(Date.now());
          setAnimations(prev => ({ ...prev, answerReveal: false }));
          // Timer'ı tekrar başlat
          setTimeLeft(20);
        }, 2000);
      } else {
        // Normal cevap veya çift cevap jokerinin ikinci denemesi
        setUserAnswers(prev => {
          if (response.data.is_second_attempt) {
            // İkinci deneme ise önceki cevabı güncelle
            const newAnswers = [...prev];
            const lastAnswerIndex = newAnswers.length - 1;
            newAnswers[lastAnswerIndex] = {
              ...newAnswers[lastAnswerIndex],
              answerId,
              isCorrect,
              points,
              responseTime: elapsedTime,
              isSecondAttempt: true,
              correctAnswerId: response.data.correct_answer_id
            };
            return newAnswers;
          } else {
            // Normal cevap
            return [...prev, {
              questionId: currentQuestion.id,
              answerId,
              isCorrect,
              points,
              responseTime: elapsedTime,
              correctAnswerId: response.data.correct_answer_id
            }];
          }
        });
        
        // Trigger answer reveal animation
        setAnimations(prev => ({ ...prev, answerReveal: true }));
        
        setTimeout(() => {
          goToNextQuestion();
        }, 2000);
      }
    } catch (err) {
      console.error('Cevap işlenirken hata:', err);
      setTimeout(() => {
        goToNextQuestion();
      }, 1500);
    }
  };
  
  // Go to next question
  const goToNextQuestion = () => {
    if (!quiz) return;
    
    // Trigger question transition animation
    setAnimations(prev => ({ ...prev, questionTransition: true }));
    
    setTimeout(() => {
      // Reset jokers
      setJokers({
        fiftyPercent: { active: false, used: false, eliminated: [] },
        doubleAnswer: { active: false, used: false, firstAttemptUsed: false }
      });
      
      // Move to next question or complete quiz
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setAnswerSelected(false);
        setUserAnswer(null);
        setQuestionStartTime(Date.now());
        setAnimations({ questionTransition: false, jokerActivation: null, answerReveal: false });
      } else {
        setQuizComplete(true);
      }
    }, 500);
  };
  
  // Handle fifty percent joker
  const handleUseFiftyPercentJoker = async () => {
    if (answerSelected || jokers.fiftyPercent.used || !quiz) return;
    
    try {
      const currentQuestion = quiz.questions[currentQuestionIndex];
      
      // Trigger joker animation
      setAnimations(prev => ({ ...prev, jokerActivation: 'fiftyPercent' }));
      
      const response = await jokerService.useFiftyPercent(
        categoryId, 
        currentQuestion.id
      );
      
      setTimeout(() => {
        setJokers(prev => ({
          ...prev,
          fiftyPercent: {
            active: true,
            used: true,
            eliminated: response.data.eliminated_answer_ids
          }
        }));
        
        setAnimations(prev => ({ ...prev, jokerActivation: null }));
      }, 1000);
    } catch (err) {
      console.error('%50 jokeri kullanılırken hata:', err);
      setAnimations(prev => ({ ...prev, jokerActivation: null }));
      alert(err.response?.data?.message || '%50 jokeri kullanılamadı.');
    }
  };
  
  // Handle double answer joker
  const handleUseDoubleAnswerJoker = async () => {
    if (answerSelected || jokers.doubleAnswer.used || !quiz) return;
    
    try {
      const currentQuestion = quiz.questions[currentQuestionIndex];
      
      // Trigger joker animation
      setAnimations(prev => ({ ...prev, jokerActivation: 'doubleAnswer' }));
      
      const response = await jokerService.useDoubleAnswer(
        categoryId, 
        currentQuestion.id
      );
      
      setTimeout(() => {
        setJokers(prev => ({
          ...prev,
          doubleAnswer: {
            active: true,
            used: true,
            firstAttemptUsed: false
          }
        }));
        
        setAnimations(prev => ({ ...prev, jokerActivation: null }));
      }, 1000);
    } catch (err) {
      console.error('Çift cevap jokeri kullanılırken hata:', err);
      setAnimations(prev => ({ ...prev, jokerActivation: null }));
      alert(err.response?.data?.message || 'Çift cevap jokeri kullanılamadı.');
    }
  };
  
  // Handle back to categories
  const handleBackToCategories = () => {
    navigate('/categories');
  };
  
  // Render different states
  if (loading) {
    return <QuizLoader />;
  }
  
  if (error) {
    return <QuizError error={error} onBack={handleBackToCategories} />;
  }
  
  if (quizComplete) {
    return <QuizCompletion userAnswers={userAnswers} onBack={handleBackToCategories} />;
  }
  
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <QuizError error="Bu kategoride çözülecek soru kalmadı." onBack={handleBackToCategories} />;
  }
  
  // Show countdown before quiz starts
  if (showCountdown) {
    return <QuizCountdown category={category} onCountdownComplete={handleCountdownComplete} />;
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-10 animate-float-1"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-10 animate-float-2"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-10 animate-float-3"></div>
        <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-10 animate-float-4"></div>
      </div>
      
      {/* Responsive Container - Sabitlenmiş Layout */}
      <div className="h-full flex flex-col max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className={`flex-1 flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 ${
          animations.questionTransition ? 'transform scale-105 opacity-0' : 'transform scale-100 opacity-100'
        }`}>
          {/* Header - Sabit */}
          <QuizHeader
            category={category}
            currentIndex={currentQuestionIndex}
            totalQuestions={quiz.questions.length}
            timeLeft={timeLeft}
          />
          
          {/* Content - Scrollable sadece gerektiğinde */}
          <div className="flex-1 overflow-y-auto">
            <QuizContent
              question={currentQuestion}
              userAnswer={userAnswer}
              answerSelected={answerSelected}
              jokers={jokers}
              animations={animations}
              onAnswerClick={handleAnswerClick}
              onUseFiftyPercent={handleUseFiftyPercentJoker}
              onUseDoubleAnswer={handleUseDoubleAnswerJoker}
              userAnswers={userAnswers}
            />
          </div>
          
          {/* Footer - Sabit */}
          <QuizFooter
            currentIndex={currentQuestionIndex}
            totalQuestions={quiz.questions.length}
            onBack={handleBackToCategories}
          />
        </div>
      </div>
    </div>
  );
};

// CSS Animations for Quiz Theme
const styles = `
  @keyframes float-1 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
  
  @keyframes float-2 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-30px) rotate(-180deg); }
  }
  
  @keyframes float-3 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(90deg); }
  }
  
  @keyframes float-4 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-25px) rotate(-90deg); }
  }
  
  .animate-float-1 { animation: float-1 6s ease-in-out infinite; }
  .animate-float-2 { animation: float-2 8s ease-in-out infinite; }
  .animate-float-3 { animation: float-3 4s ease-in-out infinite; }
  .animate-float-4 { animation: float-4 7s ease-in-out infinite; }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.querySelector('#quiz-page-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'quiz-page-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default QuizPage;