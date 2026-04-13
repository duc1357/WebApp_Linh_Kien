import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext.jsx";

// Trang chỉ dành cho người đã đăng nhập
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// Trang chỉ dành cho Admin
export function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="text-6xl">🔒</div>
        <h1 className="text-2xl font-black text-slate-800">Truy cập bị từ chối</h1>
        <p className="text-slate-500">Bạn không có quyền truy cập trang này.</p>
        <a href="/" className="text-orange-600 font-bold hover:underline">← Về trang chủ</a>
      </div>
    );
  }
  return children;
}
