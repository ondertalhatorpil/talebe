import React from 'react';
import { FaTrophy, FaUsers, FaSchool } from 'react-icons/fa';
import { HiLocationMarker } from 'react-icons/hi';
import { MdDataUsage } from 'react-icons/md';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      value: 'turkey',
      label: 'Türkiye Geneli',
      icon: <FaTrophy className="text-lg text-purple-800" />,
      description: 'Tüm Türkiye\'deki sıralama'
    },
    {
      value: 'city',
      label: 'İl Bazında',
      icon: <FaUsers className="text-lg text-purple-800" />,
      description: 'İl içindeki sıralama'
    },
    {
      value: 'district',
      label: 'İlçe Bazında',
      icon: <HiLocationMarker className="text-lg text-purple-800" />,
      description: 'İlçe içindeki sıralama'
    },
    {
      value: 'school',
      label: 'Okul Bazında',
      icon: <FaSchool className="text-lg text-purple-800" />,
      description: 'Okul içindeki sıralama'
    }
  ];

  return (
    <div className="w-full">
      {/* Desktop Navigation */}
      <div className="hidden md:flex justify-center gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`group relative px-6 py-4 rounded-xl transition-all duration-200 ${
              activeTab === tab.value
                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:scale-102 shadow-md'
            }`}
          >
            {/* Active indicator */}
            {activeTab === tab.value && (
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-800 to-purple-600 rounded-xl opacity-20 animate-pulse"></div>
            )}
            
            <div className="relative flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${
                activeTab === tab.value
                  ? 'bg-white bg-opacity-20'
                  : 'bg-gray-100 group-hover:bg-blue-100'
              }`}>
                {tab.icon}
              </div>
              
              <div className="text-left">
                <div className="font-semibold">{tab.label}</div>
                <div className={`text-xs ${
                  activeTab === tab.value ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {tab.description}
                </div>
              </div>
            </div>
            
            {/* Active tab indicator */}
            {activeTab === tab.value && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-4 h-4 bg-blue-500 rotate-45"></div>
            )}
          </button>
        ))}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="grid grid-cols-2 gap-2 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`relative p-4 rounded-lg transition-all duration-200 ${
                activeTab === tab.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-3 rounded-full transition-colors ${
                  activeTab === tab.value
                    ? 'bg-white bg-opacity-20'
                    : 'bg-white shadow-sm'
                }`}>
                  {tab.icon}
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm">{tab.label}</div>
                  <div className={`text-xs mt-1 ${
                    activeTab === tab.value ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </div>
              
              {/* Active indicator for mobile */}
              {activeTab === tab.value && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;