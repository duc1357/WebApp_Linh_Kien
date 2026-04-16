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
    <div className="bg-slate-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <SidebarFilter categories={categories} categoryId={categoryId} setCategoryId={setCategoryId} />
        </div>
        
        <div className="flex-1">
          {/* Promo Banner */}
          <div className="w-full h-32 md:h-48 bg-gradient-to-r from-[var(--color-brand)] to-amber-500 rounded-2xl shadow-md mb-8 flex items-center px-8 relative overflow-hidden group">
             <div className="relative z-10 text-white">
                <h2 className="text-2xl md:text-3xl font-black mb-2 tracking-tight group-hover:scale-105 transition-transform origin-left">ĐẠI TIỆC PHẦN CỨNG 2026</h2>
                <p className="font-medium text-amber-100/90 text-sm">Chơi siêu tốc - Giảm trực tiếp 200k.</p>
             </div>
             <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/10 skew-x-12 translate-x-16 group-hover:translate-x-8 transition-transform duration-700"></div>
          </div>

          <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {searchQuery
                ? `Kết quả cho "${searchQuery}"`
                : categoryId ? categories.find(c => c.id === categoryId)?.name : 'Tất Cả Linh Kiện'}
            </h2>
            <div className="flex items-center gap-2">
              {searchQuery && (
                <button onClick={handleClearSearch} className="text-xs font-bold text-[var(--color-brand)] bg-orange-50 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors cursor-pointer">
                  × Xóa tìm kiếm
                </button>
              )}
              <div className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{products.length} sản phẩm</div>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 flex items-center justify-center font-semibold">
              ⚠️ Không thể tải danh sách sản phẩm: {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[1,2,3,4].map(n => <div key={n} className="h-80 bg-white rounded-xl animate-pulse border border-slate-100"></div>)}
            </div>
          ) : products.length === 0 && !errorMsg ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center h-64 shadow-sm">
                <p className="text-slate-500 font-medium">Không tìm thấy sản phẩm nào trong thư mục này.</p>
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
