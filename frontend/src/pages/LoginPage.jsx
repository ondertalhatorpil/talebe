import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, CheckCircle, Key, ChevronRight, BookOpen, Trophy, Target } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuthStore();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Giriş yapılırken bir hata oluştu');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Mobil için üstteki logo/başlık kısmı */}
      <motion.div
        className="md:hidden w-full bg-transparent pt-8 pb-4 px-4 text-center text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Talebe Quiz</h1>
        <p className="text-sm opacity-80">İmam Hatip öğrencileri için eğitim platformu</p>
      </motion.div>
      
      {/* Sol taraf - Giriş formu */}
      <motion.div 
        className="w-full md:w-1/2 flex items-center justify-center px-4 py-6 md:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-purple-100">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 md:block hidden">
              İmam Hatip Quiz
            </h2>
            <h2 className="text-xl font-bold text-gray-800 md:hidden">
              Giriş Yap
            </h2>
            <p className="mt-2 text-sm text-gray-600 hidden md:block">
              Hesabınıza giriş yapın
            </p>
          </div>
          
          <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                className="rounded-xl bg-red-50 p-3 md:p-4 border border-red-100"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-sm text-red-700 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </motion.div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta Adresi
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-purple-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ease-in-out"
                    placeholder="ornek@mail.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-purple-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ease-in-out"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-5">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Beni Hatırla
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-purple-600 hover:text-purple-700 transition-colors">
                  Şifremi Unuttum
                </a>
              </div>
            </div>
            
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 md:py-3.5 px-4 mt-6 border border-transparent rounded-xl shadow-md text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
              whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Giriş Yapılıyor...
                </span>
              ) : (
                <span className="flex items-center">
                  Giriş Yap
                  <ChevronRight className="ml-2 h-5 w-5" />
                </span>
              )}
            </motion.button>
            
            <div className="text-sm text-center mt-6">
              <p className="text-gray-600">
                Hesabınız yok mu?{' '}
                <Link to="/register" className="font-medium text-purple-600 hover:text-purple-700 transition-colors underline">
                  Kayıt Ol
                </Link>
              </p>
            </div>
            
            {/* Mobil için mini-kartlar - Sadece mobil cihazlarda görünür */}
            <div className="md:hidden mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500 mb-4">Talebe Quiz ile neler yapabilirsiniz?</p>
              <div className="grid grid-cols-3 gap-3">
                <motion.div 
                  className="bg-purple-50 rounded-xl p-3 flex flex-col items-center"
                  whileHover={{ scale: 1.05, backgroundColor: "#f3e8ff" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="bg-purple-100 text-purple-700 p-2 rounded-lg mb-2">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-center">Bilgi Yarışmaları</span>
                </motion.div>
                
                <motion.div 
                  className="bg-purple-50 rounded-xl p-3 flex flex-col items-center"
                  whileHover={{ scale: 1.05, backgroundColor: "#f3e8ff" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="bg-purple-100 text-purple-700 p-2 rounded-lg mb-2">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-center">Puan Kazanın</span>
                </motion.div>
                
                <motion.div 
                  className="bg-purple-50 rounded-xl p-3 flex flex-col items-center"
                  whileHover={{ scale: 1.05, backgroundColor: "#f3e8ff" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="bg-purple-100 text-purple-700 p-2 rounded-lg mb-2">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-center">Dinî Bilgi</span>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
      
      {/* Sağ taraf - Bilgi bölümü */}
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
    </div>
  );
};

export default LoginPage;