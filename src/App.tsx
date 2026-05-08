import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import PageLoadingFallback from './components/PageLoadingFallback';

// ─── Lazy-loaded pages ─────────────────────────────────────────────────────────
// Mỗi page chỉ được tải khi user thực sự navigate tới route đó.
// Webpack/Vite tự tách thành chunk riêng biệt.
const LoginScreen = lazy(() => import('./components/LoginScreen'));
const DashboardScreen = lazy(() => import('./components/DashboardScreen'));
const ProductListScreen = lazy(() => import('./features/products/ProductListScreen'));
const TrackingScreen = lazy(() => import('./components/TrackingScreen'));
const UserDetailScreen = lazy(() => import('./components/UserDetailScreen'));

// ─── App ───────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ─── Public Routes ─────────────────────────────────────────── */}
          <Route
            path="/login"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <LoginScreen />
              </Suspense>
            }
          />

          {/* ─── Protected Routes (cần đăng nhập) ─────────────────────── */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<DashboardScreen />} />

            {/* Merchandise */}
            <Route path="products" element={<ProductListScreen />} />

            {/* Order Tracking */}
            <Route path="tracking" element={<TrackingScreen />} />

            {/* Đơn hàng — placeholder, sẽ xây ở Giai đoạn 2 */}
            <Route
              path="orders"
              element={
                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                  <span className="material-icons-round text-6xl">receipt_long</span>
                  <p className="font-mono text-sm uppercase tracking-widest">Module Đơn hàng — Đang phát triển</p>
                </div>
              }
            />

            {/* User Settings / Profile */}
            <Route path="settings" element={<UserDetailScreen />} />
          </Route>

          {/* ─── Catch-all: redirect về dashboard ─────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
