// src/pages/admin/CategoriesPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../../services/api';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      setCategories(response.data.categories);
      setError(null);
    } catch (err) {
      setError('Kategoriler yüklenirken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error('Kategori silinirken hata:', err);
      alert('Kategori silinirken bir hata oluştu.');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kategoriler</h1>
        <Link
          to="/admin/categories/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Yeni Kategori
        </Link>
      </div>
      
      {categories.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          Henüz kategori bulunmuyor.
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id}>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.description || 'Açıklama yok'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/admin/categories/edit/${category.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Silme Onay Modalı */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kategoriyi Sil</h3>
            <p className="text-gray-500 mb-4">
              <strong>{categoryToDelete?.name}</strong> kategorisini silmek istediğinize emin misiniz? 
              Bu işlem geri alınamaz ve bu kategoriye ait tüm sorular silinecektir.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCategoryToDelete(null);
                }}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;