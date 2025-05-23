import { useState, useEffect } from 'react';
import { userService } from '../../services/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null); // Hata durumunu sıfırla
      
      console.log('🔍 Kullanıcılar getiriliyor...'); // Debug log
      
      const response = await userService.getAllUsers();
      console.log('📊 API Response:', response); // Debug log
      
      // Response yapısını kontrol et
      if (response && response.data) {
        console.log('🔍 Response structure:', response.data);
        
        // Backend'den gelen response yapısına göre ayarla
        // Backend'den: { success: true, data: { users: [...], pagination: {...} } }
        let usersData = [];
        
        if (response.data.success && response.data.data && response.data.data.users) {
          // Nested structure: response.data.data.users
          usersData = response.data.data.users;
        } else if (response.data.users) {
          // Direct structure: response.data.users
          usersData = response.data.users;
        } else if (Array.isArray(response.data)) {
          // Direct array: response.data
          usersData = response.data;
        }
        
        console.log('📊 Extracted users data:', usersData);
        
        // Eğer array değilse boş array yap
        if (!Array.isArray(usersData)) {
          console.warn('⚠️ usersData array değil:', typeof usersData, usersData);
          usersData = [];
        }
        
        setUsers(usersData);
        console.log('👥 Kullanıcılar set edildi:', usersData.length, 'kullanıcı');
      } else {
        console.warn('⚠️ Response data boş veya hatalı:', response);
        setUsers([]);
      }
    } catch (err) {
      console.error('❌ Kullanıcılar yüklenirken hata:', err);
      
      // Hata durumuna göre farklı mesajlar
      if (err.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      } else if (err.response?.status === 403) {
        setError('Bu sayfaya erişim yetkiniz yok.');
      } else if (err.response?.status === 500) {
        setError('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      } else {
        setError('Kullanıcılar yüklenirken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Kullanıcılar yükleniyor...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <div className="flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={fetchUsers}
            className="bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-sm"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kullanıcılar</h1>
        <button 
          onClick={fetchUsers}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
        >
          Yenile
        </button>
      </div>
      
      {users.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          Henüz kullanıcı bulunmuyor.
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <p className="text-sm text-gray-600">
              Toplam {users.length} kullanıcı
            </p>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Okul
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sınıf
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold">
                        {/* Güvenli string erişimi */}
                        {user.first_name?.[0] || '?'}{user.last_name?.[0] || ''}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name || ''} {user.last_name || ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email || '-'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.school_name || '-'}
                    </div>
                    {user.city && (
                      <div className="text-xs text-gray-500">
                        {user.city}{user.district && `, ${user.district}`}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {/* Güvenli sınıf gösterimi */}
                      {user.class ? `${user.class}. Sınıf` : '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.user_type === 'lise' ? 'Lise' : 
                       user.user_type === 'ortaokul' ? 'Ortaokul' : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-medium text-indigo-600">
                      {user.points || 0}
                    </span> Puan
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.register_date ? 
                      new Date(user.register_date).toLocaleDateString('tr-TR') : 
                      '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_active !== 0
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active !== 0 ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;