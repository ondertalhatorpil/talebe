import React, { useState, useRef, useEffect } from 'react';
import { FaMapMarkerAlt, FaChevronDown, FaSearch, FaTimes, FaCheck } from 'react-icons/fa';
import { HiLocationMarker } from 'react-icons/hi';

const LocationSelector = ({ 
  selectedCity, 
  selectedDistrict, 
  onCityChange, 
  onDistrictChange,
  availableCities = [],
  availableDistricts = [],
  disabled = false,
  required = false,
  className = ''
}) => {
  // State for dropdowns
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [districtSearchTerm, setDistrictSearchTerm] = useState('');

  // Refs for dropdowns
  const cityDropdownRef = useRef(null);
  const districtDropdownRef = useRef(null);

  // Filter cities and districts based on search
  const filteredCities = availableCities.filter(city =>
    city.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  const filteredDistricts = availableDistricts.filter(district =>
    district.toLowerCase().includes(districtSearchTerm.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setCityDropdownOpen(false);
        setCitySearchTerm('');
      }
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target)) {
        setDistrictDropdownOpen(false);
        setDistrictSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle city selection
  const handleCitySelect = (city) => {
    onCityChange(city);
    setCityDropdownOpen(false);
    setCitySearchTerm('');
    // Reset district when city changes
    if (selectedDistrict && onDistrictChange) {
      onDistrictChange('');
    }
  };

  // Handle district selection
  const handleDistrictSelect = (district) => {
    onDistrictChange(district);
    setDistrictDropdownOpen(false);
    setDistrictSearchTerm('');
  };

  // Custom Dropdown Component
  const CustomDropdown = ({ 
    value, 
    placeholder, 
    options, 
    onSelect, 
    isOpen, 
    onToggle, 
    searchTerm, 
    onSearchChange, 
    ref,
    disabled,
    required,
    label,
    icon: Icon
  }) => (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <div className="flex items-center gap-2">
          <Icon className="text-blue-500" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </div>
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:border-gray-400'
          } ${value ? 'text-gray-900' : 'text-gray-500'}`}
        >
          <div className="flex items-center justify-between">
            <span className="truncate">{value || placeholder}</span>
            <div className="flex items-center gap-2">
              {value && !disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect('');
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              )}
              <FaChevronDown 
                className={`h-4 w-4 text-gray-400 transition-transform ${
                  isOpen ? 'transform rotate-180' : ''
                }`} 
              />
            </div>
          </div>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60">
            {/* Search input */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`${label} ara...`}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-48 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-2 text-gray-500 text-center">
                  {searchTerm ? 'Eşleşen sonuç bulunamadı' : 'Veri bulunamadı'}
                </div>
              ) : (
                options.map((option) => (
                  <button
                    key={option}
                    onClick={() => onSelect(option)}
                    className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors ${
                      value === option ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{option}</span>
                      {value === option && (
                        <FaCheck className="text-blue-600 ml-2" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* City Selector */}
      <CustomDropdown
        ref={cityDropdownRef}
        value={selectedCity}
        placeholder="İl seçin..."
        options={filteredCities}
        onSelect={handleCitySelect}
        isOpen={cityDropdownOpen}
        onToggle={() => !disabled && setCityDropdownOpen(!cityDropdownOpen)}
        searchTerm={citySearchTerm}
        onSearchChange={setCitySearchTerm}
        disabled={disabled}
        required={required}
        label="İl"
        icon={FaMapMarkerAlt}
      />

      {/* District Selector */}
      <CustomDropdown
        ref={districtDropdownRef}
        value={selectedDistrict}
        placeholder={selectedCity ? "İlçe seçin..." : "Önce il seçin"}
        options={filteredDistricts}
        onSelect={handleDistrictSelect}
        isOpen={districtDropdownOpen}
        onToggle={() => selectedCity && !disabled && setDistrictDropdownOpen(!districtDropdownOpen)}
        searchTerm={districtSearchTerm}
        onSearchChange={setDistrictSearchTerm}
        disabled={disabled || !selectedCity}
        required={required}
        label="İlçe"
        icon={HiLocationMarker}
      />

      {/* Selection Summary */}
      {(selectedCity || selectedDistrict) && (
        <div className="md:col-span-2 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-700">
              <HiLocationMarker className="text-blue-500" />
              <span className="text-sm font-medium">Seçili Lokasyon:</span>
            </div>
            <div className="mt-1 text-blue-900">
              {selectedCity && (
                <span className="font-semibold">{selectedCity}</span>
              )}
              {selectedCity && selectedDistrict && <span className="mx-1">•</span>}
              {selectedDistrict && (
                <span className="font-semibold">{selectedDistrict}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;