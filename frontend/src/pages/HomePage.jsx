import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SidebarFilter from "../components/common/SidebarFilter.jsx";
import ProductCard from "../components/common/ProductCard.jsx";
import { useShop } from "../context/ShopContext.jsx";
import api from "../api/axios";

export default function HomePage() {
  const { categories } = useShop();
  const [products, setProducts] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      setLoading(true);
      setErrorMsg('');
      let url = '/products';
      const params = [];
      if (categoryId) params.push(`category_id=${categoryId}`);
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      if (params.length) url += '?' + params.join('&');

      try {
        const res = await api.get(url);
        if (active) {
          setProducts(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setErrorMsg(err.response?.data?.detail || err.message);
          setLoading(false);
        }
      }
    };
    
    loadProducts();
    return () => { active = false; };
  }, [categoryId, searchQuery]);

  const handleClearSearch = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <SidebarFilter categories={categories} categoryId={categoryId} setCategoryId={setCategoryId} />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Cyberpunk Tech Banner / Hero Section */}
          <div className="w-full bg-slate-900/40 border border-glass rounded-3xl p-8 md:p-12 shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group bg-gradient-to-r from-slate-950/80 to-slate-900/30">
             {/* Blur circles */}
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
             
             <div className="relative z-10 text-center md:text-left space-y-4 max-w-lg">
                <span className="bg-orange-500/10 border border-orange-500/30 text-[var(--color-brand)] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm inline-block">
                  Cyberpunk Event 2026
                </span>
                <h2 className="text-2xl md:text-3xl font-heading font-black mb-2 tracking-tight text-white leading-tight">
                  ĐẠI TIỆC PHẦN CỨNG <br/>
                  <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent text-glow-orange">VUA LINH KIỆN</span>
                </h2>
                <p className="font-medium text-slate-400 text-xs md:text-sm leading-relaxed">
                  Nâng cấp cấu hình chiến game đỉnh cao. Nhận ngay coupon giảm trực tiếp <strong className="text-white">200.000đ</strong> cho đơn hàng lắp ráp PC đầu tiên của bạn!
                </p>
                <div className="pt-2">
                  <button onClick={() => navigate('/builder')} className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0">
                    TỰ BUILD PC NGAY
                  </button>
                </div>
             </div>
             
             {/* Tech Status Dashboard widget */}
             <div className="hidden md:flex relative w-64 h-52 items-center justify-center shrink-0">
                <div className="absolute inset-0 bg-glass border border-glass rounded-2xl p-4 flex flex-col justify-between shadow-inner bg-slate-950/60 glow-card-hover-blue transition-all duration-300">
                  <div className="flex justify-between items-center pb-2.5 border-b border-glass">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      System Status
                    </span>
                    <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      ONLINE 24/7
                    </span>
                  </div>

                  <div className="space-y-2 py-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-medium">Kho linh kiện sẵn sàng</span>
                      <strong className="text-slate-200 font-bold font-mono">401+ Món</strong>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-medium">Tốc độ phản hồi AI</span>
                      <strong className="text-orange-400 text-glow-orange font-mono font-bold">&lt; 0.8s</strong>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-glass">
                      <div className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 w-[96%] animate-pulse" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-glass flex items-center justify-between text-[9px] text-slate-400 font-semibold">
                    <span>🛡️ 100% Chính hãng</span>
                    <span className="text-orange-400 font-bold">AI Active</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Mobile Horizontal Category Scroll Bar */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-2 mb-6 scrollbar-none">
            <button
              onClick={() => setCategoryId(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                categoryId === null
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md shadow-orange-500/20'
                  : 'bg-slate-900/80 text-slate-400 border-glass hover:bg-white/5'
              }`}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  categoryId === cat.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md shadow-orange-500/20'
                    : 'bg-slate-900/80 text-slate-400 border-glass hover:bg-white/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Category / Search Results Header */}
          <div className="flex justify-between items-center mb-6 border-b border-glass pb-4">
            <h2 className="text-lg md:text-xl font-heading font-black text-slate-100 tracking-tight">
              {searchQuery
                ? `Kết quả cho "${searchQuery}"`
                : categoryId ? categories.find(c => c.id === categoryId)?.name : 'Tất Cả Linh Kiện'}
            </h2>
            <div className="flex items-center gap-2">
              {searchQuery && (
                <button onClick={handleClearSearch} className="text-[10px] font-black text-[var(--color-brand)] bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full hover:bg-orange-500/20 transition-all cursor-pointer">
                  × Xóa tìm kiếm
                </button>
              )}
              <div className="text-[10px] font-black text-slate-400 bg-white/5 border border-glass px-3 py-1.5 rounded-full">
                {products.length} sản phẩm
              </div>
            </div>
          </div>

          {/* Errors */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center justify-center font-semibold text-xs">
              ⚠️ Không thể tải danh sách sản phẩm: {errorMsg}
            </div>
          )}

          {/* Lưới sản phẩm */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-80 bg-glass rounded-2xl animate-pulse border border-glass shadow-lg"></div>
              ))}
            </div>
          ) : products.length === 0 && !errorMsg ? (
            <div className="bg-glass border border-glass p-12 rounded-2xl text-center flex flex-col items-center justify-center h-64 shadow-xl">
              <p className="text-slate-400 font-semibold text-sm">Không tìm thấy sản phẩm nào trong danh mục này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map(p => (
                <ProductCard key={p.id} item={p} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
