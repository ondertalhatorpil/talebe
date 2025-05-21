import { create } from 'zustand';
import { authService } from '../services/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  
  // Giriş işlemi
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(credentials);
      const { token, user } = response.data;
      
      // Token ve kullanıcı bilgilerini localStorage'a kaydet
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ 
        token, 
        user, 
        isAuthenticated: true, 
        loading: false 
      });
      
      return { success: true };
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Giriş yapılırken bir hata oluştu' 
      });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Giriş yapılırken bir hata oluştu' 
      };
    }
  },
  
  // Kayıt işlemi
register: async (userData) => {
  set({ loading: true, error: null });
  try {
    console.log("Gönderilen veri:", userData); // Gönderilen veriyi logla
    const response = await authService.register(userData);
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    set({ 
      token, 
      user, 
      isAuthenticated: true, 
      loading: false 
    });
    
    return { success: true };
  } catch (error) {
    console.error("Kayıt hatası:", error);
    console.error("Hata yanıtı:", error.response?.data); // Hata yanıtını detaylı logla
    
    set({ 
      loading: false, 
      error: error.response?.data?.message || 'Kayıt olurken bir hata oluştu' 
    });
    
    return { 
      success: false, 
      error: error.response?.data?.message || 'Kayıt olurken bir hata oluştu' 
    };
  }
},
  
  // Çıkış işlemi
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ 
      token: null, 
      user: null, 
      isAuthenticated: false 
    });
  },
  
updateProfile: async () => {
    try {
      const response = await authService.getProfile();
      const updatedUser = response.data.user;
      
      console.log('Updating user in store:', updatedUser); // DEBUG LOG
      console.log('School info from API:', updatedUser.school); // DEBUG LOG
      
      // ✅ localStorage'u da güncelle
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // ✅ Store'u güncelle
      set({ user: updatedUser });
      
      return { success: true };
    } catch (error) {
      console.error('updateProfile error:', error); // DEBUG LOG
      return {
        success: false,
        error: error.response?.data?.message || 'Profil güncellenirken bir hata oluştu'
      };
    }
  }


}));