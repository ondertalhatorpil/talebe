// App.jsx - Bu dosyada admin rotalarını ekleyin
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import AdminLayout from './components/layout/AdminLayout';

// Main Pages - Lazy loading ile
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage')); // 🆕 EKLENDI
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Admin Pages - Lazy loading ile
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const AdminCategoryFormPage = lazy(() => import('./pages/admin/CategoryFormPage'));
const AdminQuestionsPage = lazy(() => import('./pages/admin/QuestionsPage'));
const AdminQuestionFormPage = lazy(() => import('./pages/admin/QuestionFormPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/UsersPage'));
// const AdminSchoolsPage = lazy(() => import('./pages/admin/SchoolsPage'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          
          {/* Main app routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/quiz/:categoryId" element={<QuizPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile/:userId?" element={<ProfilePage />} /> {/* 🆕 UPDATEDHer - userId optional */}
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="categories/create" element={<AdminCategoryFormPage />} />
            <Route path="categories/edit/:id" element={<AdminCategoryFormPage />} />
            <Route path="questions" element={<AdminQuestionsPage />} />
            <Route path="questions/create" element={<AdminQuestionFormPage />} />
            <Route path="questions/edit/:id" element={<AdminQuestionFormPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            {/* <Route path="schools" element={<AdminSchoolsPage />} /> */}
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;