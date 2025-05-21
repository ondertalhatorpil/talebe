import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { schoolService } from '../services/api';
import { 
  Loader2, User, Mail, Lock, Calendar, Map, 
  Building, GraduationCap, CheckCircle, Trophy, 
  BookOpen, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { motion } from 'framer-motion';

// Yardımcı Bileşenler
const InputField = ({ label, name, value, onChange, type = 'text', error, icon }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`appearance-none block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
        } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200`}
        placeholder={label}
      />
    </div>
    {error && <div className="text-red-600 mt-1 text-sm">{error}</div>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error, disabled = false, icon }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`appearance-none block w-full ${icon ? 'pl-10' : 'pl-3'} pr-8 py-2.5 border ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
        } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
          disabled ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-900'
        }`}
      >
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
    {error && <div className="text-red-600 mt-1 text-sm">{error}</div>}
  </div>
);

const RegisterPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
    birth_date: '',
    user_type: 'ortaokul',
    school_id: '',
    class: ''
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
    birth_date: '',
    city: '',
    district: '',
    user_type: '',
    school_id: '',
    class: ''
  });

  // Location and school data
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auth and navigation
  const { register } = useAuthStore();
  const navigate = useNavigate();

  // Adım 1: Kişisel Bilgiler Doğrulaması
  const validateStep1 = () => {
    const errors = {};
    let isValid = true;

    if (formData.first_name.length < 2) {
      errors.first_name = 'Ad en az 2 karakter olmalıdır';
      isValid = false;
    }

    if (formData.last_name.length < 2) {
      errors.last_name = 'Soyad en az 2 karakter olmalıdır';
      isValid = false;
    }

    setFormErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };

  // Adım 2: Hesap Bilgileri Doğrulaması
  const validateStep2 = () => {
    const errors = {};
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz';
      isValid = false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      errors.password = 'Şifre en az 6 karakter olmalı ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir';
      isValid = false;
    }

    setFormErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };

  // Adım 3: Ek Bilgiler Doğrulaması
  const validateStep3 = () => {
    const errors = {};
    let isValid = true;

    if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Şifreler eşleşmiyor';
      isValid = false;
    }

    if (!formData.birth_date) {
      errors.birth_date = 'Doğum tarihi gereklidir';
      isValid = false;
    }

    setFormErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };

  // Adım 4: Okul Bilgileri Doğrulaması
  const validateStep4 = () => {
    const errors = {};
    let isValid = true;

    if (!selectedCity) {
      errors.city = 'Lütfen şehir seçin';
      isValid = false;
    }

    if (!selectedDistrict) {
      errors.district = 'Lütfen ilçe seçin';
      isValid = false;
    }

    if (!formData.school_id) {
      errors.school_id = 'Lütfen okulunuzu seçin';
      isValid = false;
    }

    if (!formData.class) {
      errors.class = 'Lütfen sınıfınızı seçin';
      isValid = false;
    }

    setFormErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };

  // Tüm formun doğrulaması
  const validateForm = () => {
    const step1Valid = validateStep1();
    const step2Valid = validateStep2();
    const step3Valid = validateStep3();
    const step4Valid = validateStep4();

    // İlk geçersiz adıma git
    if (!step1Valid) setCurrentStep(0);
    else if (!step2Valid) setCurrentStep(1);
    else if (!step3Valid) setCurrentStep(2);
    else if (!step4Valid) setCurrentStep(3);

    return step1Valid && step2Valid && step3Valid && step4Valid;
  };

  // Şehirleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await schoolService.getCities();
        
        const formattedCities = response.data.cities?.map(city => ({
          id: city,
          name: city
        })) || [];
        
        setCities(formattedCities);
      } catch (err) {
        console.error("Şehirler yüklenirken hata:", err);
        setError("Şehir listesi yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      }
    };
    
    fetchCities();
  }, []);

  // Şehir değiştiğinde ilçeleri yükle
  useEffect(() => {
    if (selectedCity) {
      const fetchDistricts = async () => {
        try {
          const response = await schoolService.getDistrictsByCity(selectedCity);
          
          const formattedDistricts = response.data.districts?.map(district => ({
            id: district,
            name: district
          })) || [];
          
          setDistricts(formattedDistricts);
        } catch (err) {
          console.error("İlçeler yüklenirken hata:", err);
          setError("İlçe listesi yüklenemedi. Lütfen daha sonra tekrar deneyin.");
        }
      };
      
      fetchDistricts();
    } else {
      setDistricts([]);
    }
  }, [selectedCity]);

  // İlçe değiştiğinde okulları yükle
  useEffect(() => {
    if (selectedCity && selectedDistrict) {
      const fetchSchools = async () => {
        try {
          const response = await schoolService.getSchoolsByDistrict(
            selectedCity, 
            selectedDistrict
          );
          
          const formattedSchools = response.data.schools?.map(school => ({
            id: school.id,
            name: school.name,
            type: school.type || 'ortaokul' // Varsayılan olarak ortaokul
          })) || [];
          
          setSchools(formattedSchools);
        } catch (err) {
          console.error("Okullar yüklenirken hata:", err);
          setError("Okul listesi yüklenemedi. Lütfen daha sonra tekrar deneyin.");
        }
      };
      
      fetchSchools();
    } else {
      setSchools([]);
    }
  }, [selectedCity, selectedDistrict]);

  // Form alanları değişim işleyicisi
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Özel durumlar için işlemler
    if (name === 'city') {
      setSelectedCity(value);
      setSelectedDistrict('');
      setSchools([]);
      setFormData(prev => ({ ...prev, school_id: '', class: '' }));
    } else if (name === 'district') {
      setSelectedDistrict(value);
      setFormData(prev => ({ ...prev, school_id: '', class: '' }));
    } else if (name === 'school_id') {
      // Seçilen okulun tipini bul
      const selectedSchool = schools.find(school => school.id === parseInt(value));
      if (selectedSchool) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          // Okulun tipine göre user_type'ı güncelle
          user_type: selectedSchool.type || 'ortaokul',
          // Sınıf seçimini sıfırla
          class: ''
        }));
        return;
      }
    }

    // Normal form güncellemesi
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Form doğrulama
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Kayıt verileri için formData'nın bir kopyasını oluştur
      const registrationData = { ...formData };
      
      const result = await register(registrationData);

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Kayıt olurken bir hata oluştu');
      }
    } catch (err) {
      console.error("Kayıt hatası:", err);
      if (err.response?.data?.errors) {
        // Sunucudan gelen hataları göster
        const serverErrors = err.response.data.errors;
        const newErrors = {};
        
        serverErrors.forEach(error => {
          newErrors[error.path] = error.msg;
        });
        
        setFormErrors({...formErrors, ...newErrors});
        setError('Lütfen formdaki hataları düzeltin');
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Adımlar arası gezinme
  const nextStep = () => {
    let isValid = false;

    // Geçerli adım doğrulaması
    if (currentStep === 0) {
      isValid = validateStep1();
    } else if (currentStep === 1) {
      isValid = validateStep2();
    } else if (currentStep === 2) {
      isValid = validateStep3();
    }

    // Doğrulama başarılı ise sonraki adıma geç
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Mobil Üst Başlık */}
      <motion.div
        className="md:hidden w-full bg-transparent pt-8 pb-4 px-4 text-center text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Talebe Quiz</h1>
        <p className="text-sm opacity-80">İmam Hatip öğrencileri için eğitim platformu</p>
      </motion.div>
      
      {/* Form Bölümü */}
      <motion.div
        className="w-full md:w-1/2 p-4 md:p-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-purple-100 my-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">
            {currentStep === 0 ? 'Kişisel Bilgiler' : 
             currentStep === 1 ? 'Hesap Bilgileri' : 
             currentStep === 2 ? 'Ek Bilgiler' : 'Okul Bilgileri'}
          </h2>

          {/* Adım Göstergesi */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              {[0, 1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep === step 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : currentStep > step 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step + 1}
                  </div>
                  <span className="text-xs mt-1 hidden md:inline-block">
                    {step === 0 ? 'Kişisel' : 
                     step === 1 ? 'Hesap' : 
                     step === 2 ? 'Ek' : 'Okul'}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative flex items-center justify-between mt-2">
              <div className="absolute h-0.5 bg-gray-200 top-0 left-4 right-4"></div>
              <div className="absolute h-0.5 bg-indigo-600 top-0 left-4 transition-all duration-300 ease-in-out" 
                   style={{width: `${(currentStep / 3) * (100 - (8/3) * 16)}%`}}></div>
            </div>
          </div>

          {/* Hata Mesajı */}
          {error && (
            <motion.div 
              className="mb-4 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-start"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Adım 1: Kişisel Bilgiler */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <InputField 
                  label="Ad" 
                  name="first_name" 
                  value={formData.first_name} 
                  onChange={handleChange} 
                  error={formErrors.first_name}
                  icon={<User className="h-5 w-5 text-indigo-500" />}
                />
                <InputField 
                  label="Soyad" 
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleChange} 
                  error={formErrors.last_name}
                  icon={<User className="h-5 w-5 text-indigo-500" />}
                />
              </motion.div>
            )}

            {/* Adım 2: Hesap Bilgileri */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <InputField 
                  label="E-posta Adresi" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  error={formErrors.email}
                  icon={<Mail className="h-5 w-5 text-indigo-500" />}
                />
                <InputField 
                  label="Şifre" 
                  name="password" 
                  type="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  error={formErrors.password}
                  icon={<Lock className="h-5 w-5 text-indigo-500" />}
                />
                {formErrors.password && (
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <p>Şifreniz şunları içermelidir:</p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>En az 6 karakter</li>
                      <li>En az bir büyük harf</li>
                      <li>En az bir küçük harf</li>
                      <li>En az bir rakam</li>
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {/* Adım 3: Ek Bilgiler */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <InputField 
                  label="Şifre (Tekrar)" 
                  name="password_confirm" 
                  type="password" 
                  value={formData.password_confirm} 
                  onChange={handleChange} 
                  error={formErrors.password_confirm}
                  icon={<Lock className="h-5 w-5 text-indigo-500" />}
                />
                <InputField 
                  label="Doğum Tarihi" 
                  name="birth_date" 
                  type="date" 
                  value={formData.birth_date} 
                  onChange={handleChange} 
                  error={formErrors.birth_date}
                  icon={<Calendar className="h-5 w-5 text-indigo-500" />}
                />
              </motion.div>
            )}

            {/* Adım 4: Okul Bilgileri */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <SelectField
                  label="Şehir"
                  name="city"
                  value={selectedCity}
                  onChange={handleChange}
                  error={formErrors.city}
                  icon={<Map className="h-5 w-5 text-indigo-500" />}
                  options={[{ id: '', name: 'Şehir Seçiniz' }, ...cities]}
                  disabled={false}
                />

                <SelectField
                  label="İlçe"
                  name="district"
                  value={selectedDistrict}
                  onChange={handleChange}
                  error={formErrors.district}
                  icon={<Map className="h-5 w-5 text-indigo-500" />}
                  options={[{ id: '', name: 'İlçe Seçiniz' }, ...districts]}
                  disabled={!selectedCity}
                />

                <SelectField
                  label="Okul"
                  name="school_id"
                  value={formData.school_id}
                  onChange={handleChange}
                  error={formErrors.school_id}
                  icon={<Building className="h-5 w-5 text-indigo-500" />}
                  options={[
                    { id: '', name: 'Okul Seçiniz' }, 
                    ...schools.map(school => ({ 
                      id: school.id, 
                      name: `${school.name} (${school.type === 'lise' ? 'Lise' : 'Ortaokul'})`
                    }))
                  ]}
                  disabled={!selectedDistrict}
                />

                <SelectField
                  label="Sınıf"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  error={formErrors.class}
                  icon={<GraduationCap className="h-5 w-5 text-indigo-500" />}
                  options={[
                    { id: '', name: 'Sınıf Seçiniz' },
                    ...(formData.user_type === 'lise' 
                      ? [9, 10, 11, 12].map(num => ({ id: num.toString(), name: `${num}. Sınıf` }))
                      : [5, 6, 7, 8].map(num => ({ id: num.toString(), name: `${num}. Sınıf` })))
                  ]}
                  disabled={!formData.school_id}
                />
              </motion.div>
            )}

            {/* Adım Navigasyon Butonları */}
            <div className="flex justify-between mt-6">
              {currentStep > 0 ? (
                <motion.button
                  type="button"
                  className="px-4 py-2.5 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  onClick={prevStep}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Geri
                </motion.button>
              ) : (
                <div></div> // Boşluk dengelemesi için
              )}

              {currentStep < 3 ? (
                <motion.button
                  type="button"
                  className="px-4 py-2.5 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md"
                  onClick={nextStep}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  İleri
                  <ArrowRight className="h-4 w-4 ml-1" />
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  className="px-6 py-2.5 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Kaydediliyor...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Kayıt Ol
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </span>
                  )}
                </motion.button>
              )}
            </div>

            {/* Giriş Bağlantısı */}
            <div className="text-center pt-4 border-t border-gray-100 mt-6">
              <p className="text-gray-600 text-sm">
                Zaten hesabınız var mı?{' '}
                <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                  Giriş Yap
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Sağ Taraf - Bilgi Bölümü */}
      <motion.div 
        className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-8 text-white"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className="backdrop-blur-md bg-white/10 p-8 rounded-2xl border border-white/20 shadow-xl max-w-lg">
          <h2 className="text-4xl font-bold mb-6 text-center">Talebe Uygulaması</h2>
          <p className="text-xl mb-8 text-center">
            İmam Hatip okulu öğrencileri için özel olarak tasarlanmış eğitim platformumuza hoş geldiniz!
          </p>
          <div className="space-y-6">
            <motion.div 
              className="flex items-center bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg"
              whileHover={{ scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
            >
              <div className="bg-indigo-600 p-3 rounded-full mr-4 text-white shadow-md">
                <CheckCircle className="h-6 w-6" />
              </div>
              <span className="text-white text-lg">Günlük bilgi yarışmalarına katılın ve puanlar kazanın</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg"
              whileHover={{ scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
            >
              <div className="bg-purple-600 p-3 rounded-full mr-4 text-white shadow-md">
                <Trophy className="h-6 w-6" />
              </div>
              <span className="text-white text-lg">Kendi okulunuz için puan toplayın ve okul sıralamasında yükselin</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg"
              whileHover={{ scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
            >
              <div className="bg-pink-600 p-3 rounded-full mr-4 text-white shadow-md">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="text-white text-lg">Eğlenceli sorularla dinî bilgilerinizi geliştirin</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Mobil Bilgi Alanı - Sadece ilk adımda ve mobil görünümde */}
      {currentStep === 0 && (
        <motion.div
          className="md:hidden w-full p-4 flex flex-col items-center text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h3 className="text-xl font-bold mb-2">Talebe Uygulaması</h3>
          <p className="text-sm mb-4 text-center">
            İmam Hatip öğrencileri için özel öğrenme platformu
          </p>
          <div className="flex justify-around w-full">
            <div className="flex flex-col items-center">
              <div className="bg-indigo-600 p-2 rounded-full mb-1 text-white shadow-sm">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-center">Bilgi Yarışmaları</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-600 p-2 rounded-full mb-1 text-white shadow-sm">
                <Trophy className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-center">Puan Kazanın</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-pink-600 p-2 rounded-full mb-1 text-white shadow-sm">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-center">Dinî Bilgi</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RegisterPage;