import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { publicRoutes, protectedRoutes } from './routes';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-4 border-duo-green border-t-transparent rounded-full animate-spin" />
  </div>
);

const router = createBrowserRouter([
  ...publicRoutes.map((route) => ({
    path: route.path,
    element: <Suspense fallback={<LoadingFallback />}>{route.element}</Suspense>,
  })),
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: protectedRoutes.map((route) => ({
          path: route.path,
          element: <Suspense fallback={<LoadingFallback />}>{route.element}</Suspense>,
        })),
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
