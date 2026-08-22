import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { useCart } from "../../context/CartContext.jsx";
import { getImageUrl } from "../../api/axios";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='16' height='16' x='4' y='4' rx='2'/%3E%3Crect width='6' height='6' x='9' y='9' rx='1'/%3E%3Cpath d='M15 2v2'/%3E%3Cpath d='M15 20v2'/%3E%3Cpath d='M2 15h2'/%3E%3Cpath d='M2 9h2'/%3E%3Cpath d='M20 15h2'/%3E%3Cpath d='M20 9h2'/%3E%3Cpath d='M9 2v2'/%3E%3Cpath d='M9 20v2'/%3E%3C/svg%3E";

const fmt = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function ProductCard({ item }) {
  const { addToCart } = useCart();

  return (
    <div className="group bg-slate-900/30 backdrop-blur-md rounded-2xl border border-glass glow-card-hover flex flex-col overflow-hidden relative shadow-lg shadow-black/10">
      {/* Container ảnh */}
      <Link to={`/products/${item.id}`} className="block w-full h-48 bg-slate-950/20 p-4 relative flex items-center justify-center overflow-hidden border-b border-glass bg-gradient-to-b from-slate-900/10 to-transparent">
        <img
          src={getImageUrl(item.image) || FALLBACK_IMAGE}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
          alt={item.name}
          className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
        />
        
        {item.stock < 10 && item.stock > 0 && (
          <span className="absolute top-3 left-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-black px-2 py-0.5 rounded-lg shadow-md uppercase tracking-wider">
            Sắp hết
          </span>
        )}

        {item.stock === 0 && (
          <span className="absolute top-3 left-3 bg-slate-800/80 border border-glass text-slate-400 text-[9px] font-black px-2 py-0.5 rounded-lg shadow-md uppercase tracking-wider">
            Hết hàng
          </span>
        )}

        {/* Badge công nghệ ngẫu nhiên để tăng tính chuyên nghiệp */}
        {item.price > 10000000 && (
          <span className="absolute top-3 right-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[9px] font-black px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="w-2.5 h-2.5" /> High-End
          </span>
        )}

        {/* Overlay xem chi tiết */}
        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[1.5px]">
          <div className="bg-white text-slate-900 text-[10px] font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" /> Xem chi tiết
          </div>
        </div>
      </Link>

      {/* Thông tin sản phẩm */}
      <div className="p-4 flex flex-col flex-1 bg-gradient-to-b from-transparent to-slate-950/40 z-10">
        <Link to={`/products/${item.id}`} className="hover:text-[var(--color-brand)] transition-colors">
          <h3 className="font-heading font-bold text-slate-200 leading-snug line-clamp-2 text-xs md:text-sm h-10 group-hover:text-[var(--color-brand)] transition-colors">
            {item.name}
          </h3>
        </Link>

        <p className="text-[10px] text-slate-400 mt-2 line-clamp-1 leading-relaxed font-medium">
          {item.specs || "Linh kiện máy tính đạt chuẩn chất lượng"}
        </p>

        <div className="mt-auto pt-4 flex items-end justify-between">
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block mb-0.5">Giá bán lẻ</span>
            <div className="font-heading font-black text-[var(--color-brand)] text-glow-orange text-base md:text-lg tracking-tight">
              {fmt(item.price)}
            </div>
          </div>
        </div>

        <button
          onClick={() => addToCart(item)}
          disabled={item.stock === 0}
          className="mt-4 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/10 hover:shadow-orange-500/30 disabled:opacity-40 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:border-glass border border-transparent cursor-pointer flex items-center justify-center gap-2 text-xs hover:-translate-y-0.5 active:translate-y-0"
        >
          <ShoppingCart className="w-4 h-4" />
          {item.stock === 0 ? 'Hết Hàng' : 'Mua Ngay'}
        </button>
      </div>
    </div>
  );
}
