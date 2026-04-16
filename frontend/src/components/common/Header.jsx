import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, MonitorSmartphone, MonitorDot, UserCircle, LogOut, User, Search, X, Menu } from 'lucide-react';
import { AuthContext } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";

export default function Header({ searchQuery, onSearch }) {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { totalCartCount, setIsCartOpen } = useCart();
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Cập nhật ô input khi searchQuery thay đổi từ ngoài
  useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  // Đóng menu khi đổi route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch?.(localSearch.trim());
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearch?.('');
  };

  const onOpenCart = () => setIsCartOpen(true);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Hamburger Menu (Mobile/Tablet) */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:text-[var(--color-brand)] transition-colors rounded-lg hover:bg-slate-50"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-[var(--color-brand)] font-black text-xl tracking-tight flex-1 md:flex-none justify-center md:justify-start">
          <div className="bg-[var(--color-brand)] text-white w-8 h-8 rounded flex items-center justify-center">V</div>
          <span className="hidden sm:inline">VUA<span className="text-slate-800">LINH KIỆN</span></span>
        </Link>

        {/* Navigation Tabs */}
        <div className="hidden md:flex flex-1 justify-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-colors ${isActive('/') ? 'bg-white shadow-sm text-[var(--color-brand)]' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <MonitorSmartphone className="w-4 h-4" /> Cửa Hàng
            </Link>
            <Link
              to="/builder"
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-colors ${isActive('/builder') ? 'bg-[#1e293b] shadow-sm text-amber-400' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <MonitorDot className="w-4 h-4" /> Tự Build PC
              <span className="bg-amber-400 text-slate-900 text-[9px] px-1.5 py-0.5 rounded-sm">+AI</span>
            </Link>
          </div>
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Tìm linh kiện..."
                className="pl-9 pr-8 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all w-44 focus:w-64"
              />
              {localSearch && (
                <button type="button" onClick={handleClearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3 mr-2 group relative">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-400 leading-none">Xin chào,</span>
                <span className="text-sm font-black text-slate-800">{user?.full_name}</span>
              </div>
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center cursor-pointer font-black text-lg">
                {user?.full_name?.[0]?.toUpperCase() || <UserCircle className="w-6 h-6" />}
              </div>

              {/* Dropdown */}
              <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-2 space-y-0.5">
                  <Link
                    to="/profile"
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                  >
                    <User className="w-4 h-4" /> Hồ sơ cá nhân
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 rounded-lg font-medium"
                    >
                      👑 Admin Dashboard
                    </Link>
                  )}
                  <hr className="border-slate-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex items-center gap-2 text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-lg transition-colors"
            >
              Đăng Nhập
            </Link>
          )}

          <div className="w-px h-6 bg-slate-200 hidden md:block" />

          <button
            onClick={onOpenCart}
            className="relative p-2 text-slate-700 hover:text-[var(--color-brand)] hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="font-semibold hidden lg:inline text-sm">Giỏ hàng</span>
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Mobile Menu Drawer Panel */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl transition-transform duration-300 md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <Link to="/" className="flex items-center gap-2 text-[var(--color-brand)] font-black text-lg tracking-tight">
            <div className="bg-[var(--color-brand)] text-white w-7 h-7 rounded flex items-center justify-center text-sm">V</div>
            VUA<span className="text-slate-800">LINH KIỆN</span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {/* Mobile Search */}
          <form onSubmit={(e) => { handleSearchSubmit(e); setIsMobileMenuOpen(false); }} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Tìm linh kiện..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--color-brand)] outline-none"
              />
            </div>
          </form>

          {/* User Section */}
          <div className="mb-6 pb-6 border-b border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-orange-100 text-[var(--color-brand)] rounded-full flex items-center justify-center font-black text-xl">
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Xin chào</p>
                    <p className="font-black text-slate-800">{user?.full_name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/profile" className="flex items-center justify-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-bold text-slate-700">
                    <User className="w-4 h-4" /> Hồ sơ
                  </Link>
                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 p-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold text-red-600">
                    <LogOut className="w-4 h-4" /> Thoát
                  </button>
                </div>
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="flex items-center justify-center gap-2 p-3 bg-amber-100 hover:bg-amber-200 rounded-lg text-sm font-black text-amber-800 mt-2">
                    👑 Chuyển Tới Admin
                  </Link>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center justify-center gap-2 w-full p-3 bg-[var(--color-brand)] text-white rounded-xl font-bold">
                <UserCircle className="w-5 h-5" /> Đăng Nhập Tài Khoản
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <nav className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Danh Mục</h3>
            <Link
              to="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${isActive('/') ? 'bg-orange-50 text-[var(--color-brand)]' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <MonitorSmartphone className="w-5 h-5" /> Cửa Hàng Linh Kiện
            </Link>
            <Link
              to="/builder"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${isActive('/builder') ? 'bg-slate-800 text-amber-400' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <MonitorDot className="w-5 h-5" /> Tự Build PC <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.5 rounded-sm ml-auto">+AI</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
