import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { ErrorState, LoadingState } from '@/components/ui/page-state';
import { useAuth } from '@/features/auth/hooks/use-auth';
import AdminCourseFormPage from '@/pages/AdminCourseFormPage';
import AdminCoursesPage from '@/pages/AdminCoursesPage';
import AdminUserFormPage from '@/pages/AdminUserFormPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import CourseDetailsPage from '@/pages/CourseDetailsPage';
import CourseTestPage from '@/pages/CourseTestPage';
import CoursesPage from '@/pages/CoursesPage';
import LearningLessonPage from '@/pages/LearningLessonPage';
import LoginPage from '@/pages/LoginPage';
import MyLearningPage from '@/pages/MyLearningPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProfilePage from '@/pages/ProfilePage';
import RegisterPage from '@/pages/RegisterPage';
import { PrivateRoute } from '@/router/PrivateRoute';

const RecommendationsPage = lazy(() => import('@/pages/RecommendationsPage'));

function RootRedirect() {
  const { isAuthenticated, isReady, error, refetchSession } = useAuth();

  if (!isReady) {
    return (
      <LoadingState
        title="Відновлюємо сесію"
        description="Перевіряємо поточну Better Auth сесію."
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Не вдалося визначити стан сесії"
        description={error.message}
        onRetry={() => {
          void refetchSession();
        }}
      />
    );
  }

  return <Navigate to={isAuthenticated ? '/courses' : '/login'} replace />;
}

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: (
      <PrivateRoute>
        <AppShell>
          <Outlet />
        </AppShell>
      </PrivateRoute>
    ),
    children: [
      {
        path: 'courses',
        element: <CoursesPage />,
      },
      {
        path: 'courses/:id',
        element: <CourseDetailsPage />,
      },
      {
        path: 'courses/:courseId/learn/:moduleId/:lessonId',
        element: <LearningLessonPage />,
      },
      {
        path: 'courses/:courseId/test/:moduleId',
        element: <CourseTestPage />,
      },
      {
        path: 'my-learning',
        element: <MyLearningPage />,
      },
      {
        path: 'recommendations',
        element: (
          <Suspense
            fallback={
              <LoadingState
                title="Завантажуємо AI-модуль"
                description="Lazy route ініціалізується лише коли ви відкриваєте recommendations."
              />
            }
          >
            <RecommendationsPage />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        element: (
          <PrivateRoute requireAdmin>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          {
            path: 'admin/courses',
            element: <AdminCoursesPage />,
          },
          {
            path: 'admin/courses/new',
            element: <AdminCourseFormPage />,
          },
          {
            path: 'admin/courses/:id/edit',
            element: <AdminCourseFormPage />,
          },
          {
            path: 'admin/users',
            element: <AdminUsersPage />,
          },
          {
            path: 'admin/users/:id/edit',
            element: <AdminUserFormPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
