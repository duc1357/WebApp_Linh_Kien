import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { AuthProvider } from "./context/AuthContext.jsx";
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
  const [cartItems, setCartItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    const id = Date.now();
    setToast({ id, msg });
    setTimeout(() => {
      setToast(prev => prev?.id === id ? null : prev);
    }, 3000);
  };

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const handleAddToCart = useCallback((product) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.product.id === product.id);
      if (exists) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
  }, []);

  const handleAddMultipleToCart = useCallback((productsArray) => {
    setCartItems(prev => {
      let next = [...prev];
      productsArray.forEach(product => {
        const idx = next.findIndex(i => i.product.id === product.id);
        if (idx !== -1) next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        else next.push({ product, quantity: 1 });
      });
      return next;
    });
    setIsCartOpen(true);
  }, []);

  const handleUpdateQuantity = (productId, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQ = item.quantity + delta;
        return { ...item, quantity: newQ > 0 ? newQ : 1 };
      }
      return item;
    }));
  };

  const handleRemoveItem = (productId) =>
    setCartItems(prev => prev.filter(i => i.product.id !== productId));

  const handleClearCart = () => setCartItems([]);

  const handleCheckoutSuccess = () => {
    setCartItems([]);
    setIsCartOpen(false);
  };

  // Search: navigate về trang chủ với query
  const handleSearch = (q) => {
    setSearchQuery(q);
    if (location.pathname !== '/') navigate('/');
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  // Ẩn Header / Cart / Chatbot ở trang Auth hoặc trang Admin
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const hideLayout = isAuthPage || isAdminPage;
  
  // Ẩn Chatbot ở trang Checkout và Product detail
  const hideChatbot = hideLayout || location.pathname === '/checkout' || location.pathname.startsWith('/products/');

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col font-sans">
      {!hideLayout && (
        <Header
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          searchQuery={searchQuery}
          onSearch={handleSearch}
        />
      )}

      <div className="flex-1">
        <Routes>
          {/* Shop */}
          <Route path="/"         element={<HomePage categories={categories} onAddToCart={handleAddToCart} searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} />} />
          <Route path="/builder"  element={<PCBuilder categories={categories} onAddAllToCart={handleAddMultipleToCart} />} />

          {/* Product Detail */}
          <Route path="/products/:id" element={<ProductDetail onAddToCart={handleAddToCart} />} />

          {/* Checkout */}
          <Route path="/checkout" element={
            <Checkout cartItems={cartItems} onCheckoutSuccess={handleCheckoutSuccess} />
          } />

          {/* Auth */}
          <Route path="/login"           element={<AuthPages defaultView="login" />} />
          <Route path="/register"        element={<AuthPages defaultView="register" />} />
          <Route path="/forgot-password" element={<AuthPages defaultView="forgot" />} />

          {/* Protected */}
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!hideLayout && (
        <>
          <CartModal
            open={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={() => { setIsCartOpen(false); navigate('/checkout'); }}
          />
          {!hideChatbot && <FloatingChatbot onAddToCart={handleAddToCart} />}
        </>
      )}

      {/* Global Toast Notification */}
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
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
