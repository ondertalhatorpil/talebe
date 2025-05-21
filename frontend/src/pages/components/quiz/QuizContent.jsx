// components/QuizContent.jsx
import React from 'react';
import { FaBolt, FaRedoAlt, FaLightbulb, FaFire, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import JokerButton from './JokerButton';
import AnswerOption from './AnswerOption';

const QuizContent = ({
  question,
  userAnswer,
  answerSelected,
  jokers,
  animations,
  onAnswerClick,
  onUseFiftyPercent,
  onUseDoubleAnswer,
  userAnswers
}) => {
  // Difficulty colors
  const getDifficultyStyle = (difficulty) => {
    const styles = {
      kolay: {
        gradient: 'from-green-500 to-emerald-600',
        icon: FaLightbulb,
        bgGradient: 'from-green-50 to-emerald-50'
      },
      orta: {
        gradient: 'from-yellow-500 to-orange-600',
        icon: FaFire,
        bgGradient: 'from-yellow-50 to-orange-50'
      },
      zor: {
        gradient: 'from-red-500 to-pink-600',
        icon: FaBolt,
        bgGradient: 'from-red-50 to-pink-50'
      }
    };
    return styles[difficulty] || styles.kolay;
  };

  const difficultyStyle = getDifficultyStyle(question.difficulty);
  const DifficultyIcon = difficultyStyle.icon;

  return (
    <div className="p-8 space-y-8">
      {/* Question Section */}
      <div className={`transform transition-all duration-500 ${animations.questionTransition ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        {/* Difficulty Badge */}
        <div className="flex justify-between items-center mb-6">
          <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${difficultyStyle.gradient} text-white rounded-full font-bold shadow-lg transform hover:scale-105 transition-transform duration-300`}>
            <DifficultyIcon className="mr-2" />
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
          </div>
          
          {/* Question Number Badge */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full font-bold">
            #{userAnswers.length + 1}
          </div>
        </div>
        
        {/* Question Text */}
        <div className={`bg-gradient-to-r ${difficultyStyle.bgGradient} p-6 rounded-2xl border-2 border-gray-100 shadow-lg`}>
          <h3 className="text-2xl font-bold text-gray-900 leading-relaxed">
            {question.question_text}
          </h3>
        </div>
      </div>
      
      {/* Jokers Section */}
      <div className="flex flex-wrap gap-4 justify-center">
        <JokerButton
          type="fiftyPercent"
          used={jokers.fiftyPercent.used}
          disabled={answerSelected}
          active={animations.jokerActivation === 'fiftyPercent'}
          onClick={onUseFiftyPercent}
          icon={FaBolt}
          label="50:50 Jokeri"
          description="2 yanlış şık elensin"
          gradient="from-blue-500 to-cyan-600"
        />
        
        <JokerButton
          type="doubleAnswer"
          used={jokers.doubleAnswer.used}
          disabled={answerSelected}
          active={animations.jokerActivation === 'doubleAnswer'}
          onClick={onUseDoubleAnswer}
          icon={FaRedoAlt}
          label="Çift Cevap Jokeri"
          description="İkinci şans hakkı"
          gradient="from-purple-500 to-pink-600"
        />
      </div>
      
      {/* Double Answer Joker Status */}
      {jokers.doubleAnswer.active && jokers.doubleAnswer.firstAttemptUsed && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200 rounded-xl p-4 text-center animate-pulse">
          <div className="flex items-center justify-center text-purple-700">
            <FaRedoAlt className="mr-2 animate-spin" />
            <span className="font-bold">İkinci cevap hakkınızı kullanın!</span>
          </div>
        </div>
      )}
      
      {/* Answer Options */}
      <div className="grid gap-4">
        {question.answers.map((answer, index) => {
          // Hide eliminated answers for 50:50 joker
          if (jokers.fiftyPercent.active && jokers.fiftyPercent.eliminated.includes(answer.id)) {
            return (
              <div
                key={answer.id}
                className="opacity-0 scale-95 transition-all duration-500 pointer-events-none"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-16 bg-gray-100 rounded-xl"></div>
              </div>
            );
          }
          
          return (
            <AnswerOption
              key={answer.id}
              answer={answer}
              index={index}
              isSelected={userAnswer?.id === answer.id}
              isCorrect={userAnswer?.correctAnswerId === answer.id && answerSelected}
              isDisabled={answerSelected || (jokers.doubleAnswer.firstAttemptUsed && userAnswers[userAnswers.length - 1]?.answerId === answer.id)}
              showResult={answerSelected}
              onClick={() => onAnswerClick(answer.id)}
              animationDelay={index * 100}
            />
          );
        })}
      </div>
      
      {/* Answer Result Animation */}
      {answerSelected && userAnswer && animations.answerReveal && (
        <div className="text-center">
          <div className={`inline-flex items-center px-6 py-3 rounded-full font-bold text-white shadow-lg transform scale-110 animate-bounce ${
            userAnswer.isCorrect 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-red-500 to-pink-600'
          }`}>
            {userAnswer.isCorrect ? (
              <>
                <FaCheckCircle className="mr-2 text-xl" />
                Tebrikler! +{userAnswer.points} puan
              </>
            ) : (
              <>
                <FaTimesCircle className="mr-2 text-xl" />
                {jokers.doubleAnswer.active && !jokers.doubleAnswer.firstAttemptUsed ? 'İkinci şansınız var!' : 'Yanlış cevap'}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizContent;