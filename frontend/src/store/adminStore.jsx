// src/store/adminStore.js
import create from 'zustand';
import { categoryService, questionService } from '../services/api';

export const useAdminStore = create((set, get) => ({
  // Kategoriler
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  
  // Sorular
  questions: [],
  questionsLoading: false,
  questionsError: null,
  
  // Aktif filtreler
  filters: {
    user_type: '',
    category: '',
    difficulty: ''
  },
  
  // Kategorileri getir
  fetchCategories: async () => {
    try {
      set({ categoriesLoading: true, categoriesError: null });
      
      const response = await categoryService.getCategories();
      set({ 
        categories: response.data.categories,
        categoriesLoading: false 
      });
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      set({ 
        categoriesError: 'Kategoriler yüklenirken bir hata oluştu.',
        categoriesLoading: false 
      });
    }
  },
  
  // Soruları getir (filtrelenmiş)
  fetchQuestions: async (newFilters = null) => {
    try {
      set({ questionsLoading: true, questionsError: null });
      
      // Eğer yeni filtreler geldiyse filtre state'ini güncelle
      if (newFilters) {
        set({ filters: { ...get().filters, ...newFilters } });
      }
      
      const response = await questionService.getQuestions(get().filters);
      set({ 
        questions: response.data.questions,
        questionsLoading: false 
      });
    } catch (error) {
      console.error('Sorular yüklenirken hata:', error);
      set({ 
        questionsError: 'Sorular yüklenirken bir hata oluştu.',
        questionsLoading: false 
      });
    }
  },
  
  // Filtreleri güncelle
  updateFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },
  
  // Filtreleri sıfırla
  resetFilters: () => {
    set({ 
      filters: {
        user_type: '',
        category: '',
        difficulty: ''
      }
    });
  },
  
  // Kategori sil
  deleteCategory: async (categoryId) => {
    try {
      await categoryService.deleteCategory(categoryId);
      
      // Silinen kategoriyi state'den çıkar
      set({ 
        categories: get().categories.filter(category => category.id !== categoryId) 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Kategori silinirken hata:', error);
      return { 
        success: false, 
        error: 'Kategori silinirken bir hata oluştu.' 
      };
    }
  },
  
  // Soru sil
  deleteQuestion: async (questionId) => {
    try {
      await questionService.deleteQuestion(questionId);
      
      // Silinen soruyu state'den çıkar
      set({ 
        questions: get().questions.filter(question => question.id !== questionId) 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Soru silinirken hata:', error);
      return { 
        success: false, 
        error: 'Soru silinirken bir hata oluştu.' 
      };
    }
  }
}));