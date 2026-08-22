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
    <header className="bg-glass border-b border-glass sticky top-0 z-50 backdrop-blur-md shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Hamburger Menu (Mobile/Tablet) */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-400 hover:text-[var(--color-brand)] transition-colors rounded-lg hover:bg-white/5 border border-transparent hover:border-glass"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-[var(--color-brand)] font-black text-xl tracking-tight flex-1 md:flex-none justify-center md:justify-start group">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white w-8.5 h-8.5 rounded-xl flex items-center justify-center font-black shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform duration-300">V</div>
          <span className="font-heading text-white tracking-wide text-lg sm:text-xl">VUA<span className="text-[var(--color-brand)] text-glow-orange font-black pl-0.5">LINH KIỆN</span></span>
        </Link>

        {/* Navigation Tabs */}
        <div className="hidden md:flex flex-1 justify-center gap-4">
          <div className="bg-slate-900/60 border border-glass p-1 rounded-xl flex items-center gap-1 shadow-inner">
            <Link
              to="/"
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${isActive('/') ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <MonitorSmartphone className="w-4 h-4" /> Cửa Hàng
            </Link>
            <Link
              to="/builder"
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${isActive('/builder') ? 'bg-slate-800 text-amber-400 border border-white/5 shadow-md shadow-black/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <MonitorDot className="w-4 h-4 text-amber-400" /> Tự Build PC
              <span className="bg-amber-400 text-slate-900 text-[8px] font-black px-1 rounded-sm ml-0.5">+AI</span>
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
                className="pl-9 pr-8 py-2 bg-slate-900/70 border border-glass rounded-xl text-xs font-medium text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all w-44 focus:w-60"
              />
              {localSearch && (
                <button type="button" onClick={handleClearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3 mr-1 group relative">
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold text-slate-500 leading-none">Xin chào,</span>
                <span className="text-xs font-black text-slate-200 mt-1">{user?.full_name}</span>
              </div>
              <div className="w-9 h-9 bg-orange-500/10 border border-orange-500/30 text-[var(--color-brand)] rounded-xl flex items-center justify-center cursor-pointer font-black text-sm transition-transform group-hover:scale-105">
                {user?.full_name?.[0]?.toUpperCase() || <UserCircle className="w-5 h-5" />}
              </div>

              {/* Dropdown */}
              <div className="absolute top-full right-0 mt-2 w-52 bg-slate-900 border border-glass rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50">
                <div className="p-2 space-y-0.5">
                  <Link
                    to="/profile"
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" /> Hồ sơ cá nhân
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-amber-400 hover:bg-amber-500/10 rounded-lg font-bold transition-colors"
                    >
                      👑 Admin Dashboard
                    </Link>
                  )}
                  <hr className="border-glass my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex items-center gap-2 text-xs font-bold bg-white/5 border border-glass hover:bg-white/10 text-slate-200 px-5 py-2.5 rounded-lg transition-colors"
            >
              Đăng Nhập
            </Link>
          )}

          <div className="w-px h-6 bg-glass hidden md:block" />

          <button
            onClick={onOpenCart}
            className="relative p-2 text-slate-300 hover:text-[var(--color-brand)] hover:bg-orange-500/10 rounded-lg transition-all flex items-center gap-2 border border-transparent hover:border-glass"
          >
            <ShoppingCart className="w-5.5 h-5.5" />
            <span className="font-bold hidden lg:inline text-xs">Giỏ hàng</span>
            {totalCartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-[#090d16] shadow-md shadow-red-500/20">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Mobile Menu Drawer Panel */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-slate-950 border-r border-glass z-50 shadow-2xl transition-transform duration-300 md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 border-b border-glass flex items-center justify-between bg-slate-900/50">
          <Link to="/" className="flex items-center gap-2 text-[var(--color-brand)] font-black text-base tracking-tight">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-md shadow-orange-500/20">V</div>
            <span className="font-heading text-white">VUA<span className="text-[var(--color-brand)]">LINH KIỆN</span></span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 text-slate-400 hover:bg-white/5 rounded-lg border border-glass"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
          {/* Mobile Search */}
          <form onSubmit={(e) => { handleSearchSubmit(e); setIsMobileMenuOpen(false); }} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Tìm linh kiện..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-glass rounded-xl text-xs font-medium text-slate-200 focus:ring-2 focus:ring-[var(--color-brand)] outline-none"
              />
            </div>
          </form>

          {/* User Section */}
          <div className="mb-6 pb-6 border-b border-glass">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-11 h-11 bg-orange-500/10 border border-orange-500/20 text-[var(--color-brand)] rounded-xl flex items-center justify-center font-black text-lg">
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500">Xin chào</p>
                    <p className="font-black text-slate-200 text-sm leading-tight">{user?.full_name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/profile" className="flex items-center justify-center gap-2 p-2 bg-white/5 border border-glass hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300">
                    <User className="w-4 h-4" /> Hồ sơ
                  </Link>
                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs font-bold text-red-400">
                    <LogOut className="w-4 h-4" /> Thoát
                  </button>
                </div>
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="flex items-center justify-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs font-black text-amber-400 mt-2">
                    👑 Chuyển Tới Admin
                  </Link>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center justify-center gap-2 w-full p-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 text-xs">
                <UserCircle className="w-4.5 h-4.5" /> Đăng Nhập Tài Khoản
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <nav className="space-y-2">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Danh Mục</h3>
            <Link
              to="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${isActive('/') ? 'bg-orange-500/10 border border-orange-500/20 text-[var(--color-brand)] shadow-inner' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}
            >
              <MonitorSmartphone className="w-5 h-5 text-slate-400" /> Cửa Hàng Linh Kiện
            </Link>
            <Link
              to="/builder"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${isActive('/builder') ? 'bg-slate-800 border border-glass text-amber-400 shadow-inner' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}
            >
              <MonitorDot className="w-5 h-5 text-amber-400" /> Tự Build PC <span className="bg-amber-400 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded-sm ml-auto">+AI</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
