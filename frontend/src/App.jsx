/**
 * AgriSupply — Main App Component
 * Sets up routing, theme, and authentication context providers.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import FarmerManagement from './pages/FarmerManagement';
import ProductManagement from './pages/ProductManagement';
import WarehouseDashboard from './pages/WarehouseDashboard';
import ShipmentTracking from './pages/ShipmentTracking';
import TemperatureMonitoring from './pages/TemperatureMonitoring';

// Protected route wrapper — redirects to login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Admin-only route wrapper — redirects non-admin users to dashboard
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />

      {/* Protected routes — wrapped in Layout */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="farmers" element={<AdminRoute><FarmerManagement /></AdminRoute>} />
        <Route path="products" element={<AdminRoute><ProductManagement /></AdminRoute>} />
        <Route path="warehouses" element={<AdminRoute><WarehouseDashboard /></AdminRoute>} />
        <Route path="shipments" element={<AdminRoute><ShipmentTracking /></AdminRoute>} />
        <Route path="temperature" element={<TemperatureMonitoring />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
