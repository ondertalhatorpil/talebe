import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h2 className="text-6xl font-extrabold text-gray-900 mb-6">404</h2>
        <p className="text-xl font-medium text-gray-600 mb-8">Sayfa Bulunamadı</p>
        <p className="text-gray-500 mb-8">
          Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;