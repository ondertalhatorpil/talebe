// components/JokerButton.jsx
import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const JokerButton = ({
  type,
  used,
  disabled,
  active,
  onClick,
  icon: Icon,
  label,
  description,
  gradient
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!used && !disabled) {
      onClick();
    }
  };

  if (used) {
    return (
      <div className="relative group">
        <div className="bg-gray-200 text-gray-500 px-6 py-4 rounded-xl border-2 border-gray-300 cursor-not-allowed opacity-60">
          <div className="flex items-center justify-center">
            <Icon className="mr-2 text-lg" />
            <div className="text-center">
              <div className="font-bold text-sm">Kullanıldı</div>
              <div className="text-xs">{label}</div>
            </div>
          </div>
        </div>
        
        {/* Used overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">✓</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Main button */}
      <div
        className={`relative overflow-hidden cursor-pointer transition-all duration-300 transform ${
          disabled 
            ? 'scale-95 opacity-60 cursor-not-allowed' 
            : isHovered 
              ? 'scale-105 shadow-2xl' 
              : 'hover:scale-105 hover:shadow-xl'
        }`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`bg-gradient-to-r ${gradient} text-white px-6 py-4 rounded-xl border-2 border-transparent ${
          active ? 'animate-pulse' : ''
        }`}>
          {/* Animated background when active */}
          {active && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50 animate-pulse"></div>
          )}
          
          {/* Button content */}
          <div className="relative z-10 flex items-center justify-center">
            <Icon className={`mr-2 text-xl ${active ? 'animate-spin' : ''}`} />
            <div className="text-center">
              <div className="font-bold text-sm">{label}</div>
              <div className="text-xs opacity-90">{description}</div>
            </div>
          </div>
          
          {/* Sparkle effect on hover */}
          {isHovered && !disabled && (
            <React.Fragment>
              <HiSparkles className="absolute top-2 right-2 text-yellow-300 animate-ping text-xs" />
              <FaStar className="absolute bottom-2 left-2 text-yellow-300 animate-pulse text-xs" />
            </React.Fragment>
          )}
        </div>
        
        {/* Shine effect */}
        {!disabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
        )}
      </div>
      
      {/* Activation animation */}
      {active && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 opacity-30 animate-ping"></div>
      )}
      
      {/* Tooltip */}
      {isHovered && !disabled && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap z-50">
          {description}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default JokerButton;