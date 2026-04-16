import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider, useCart } from "./context/CartContext.jsx";
import { ShopProvider } from "./context/ShopContext.jsx";
import Header from "./components/common/Header.jsx";
import HomePage from "./pages/HomePage.jsx";
import PCBuilder from "./pages/PCBuilder.jsx";
import CartModal from "./components/common/CartModal.jsx";
import Login from "./features/auth/Login.jsx";
import Register from "./features/auth/Register.jsx";
import ForgotPassword from "./features/auth/ForgotPassword.jsx";
import Profile from "./pages/Profile.jsx";
import Checkout from "./pages/Checkout.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import { ProtectedRoute, AdminRoute } from "./features/auth/ProtectedRoute.jsx";
import FloatingChatbot from "./components/common/FloatingChatbot.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminLogin from "./features/auth/AdminLogin.jsx";

// ─── Auth Pages ────────────────────────────────────────────────────────────
function AuthPages({ defaultView }) {
  const [view, setView] = useState(defaultView);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="relative z-10 w-full flex justify-center">
        {view === 'login'    && <Login    onSwitchToRegister={() => setView('register')} onSwitchToForgot={() => setView('forgot')} />}
        {view === 'register' && <Register onSwitchToLogin={() => setView('login')} />}
        {view === 'forgot'   && <ForgotPassword onBack={() => setView('login')} />}
      </div>
    </div>
  );
}

// ─── Main App Content ───────────────────────────────────────────────────────
function AppContent() {
  const [toast, setToast] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { isCartOpen, setIsCartOpen, cartItems, addToCart } = useCart();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const handleShowToast = (e) => {
      const msg = e.detail;
      const id = Date.now();
      setToast({ id, msg });
      setTimeout(() => {
        setToast(prev => prev?.id === id ? null : prev);
      }, 3000);
    };

    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);

  const handleCheckoutSuccess = () => {
    setIsCartOpen(false);
  };

  const handleSearch = (q) => {
    if (q) {
      setSearchParams({ search: q });
      if (location.pathname !== '/') navigate(`/?search=${encodeURIComponent(q)}`);
    } else {
      setSearchParams(new URLSearchParams());
    }
  };

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const hideLayout = isAuthPage || isAdminPage;
  const hideChatbot = hideLayout || location.pathname === '/checkout' || location.pathname.startsWith('/products/');

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col font-sans">
      {!hideLayout && (
        <Header searchQuery={searchQuery} onSearch={handleSearch} />
      )}

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/builder" element={<PCBuilder />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout onCheckoutSuccess={handleCheckoutSuccess} />} />

          <Route path="/login" element={<AuthPages defaultView="login" />} />
          <Route path="/register" element={<AuthPages defaultView="register" />} />
          <Route path="/forgot-password" element={<AuthPages defaultView="forgot" />} />

          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!hideLayout && (
        <>
          <CartModal open={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={() => { setIsCartOpen(false); navigate('/checkout'); }} />
          {!hideChatbot && <FloatingChatbot />}
        </>
      )}

      {toast && (
        <div key={toast.id} className="fixed bottom-6 right-6 z-[9999] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-300">
          <CheckCircle className="w-6 h-6 text-emerald-200" />
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

