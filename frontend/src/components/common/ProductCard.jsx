import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';

const fmt = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function ProductCard({ item, onAddToCart }) {
  return (
    <div className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Ảnh — click vào xem detail */}
      <Link to={`/products/${item.id}`} className="block w-full h-48 bg-white p-4 relative flex items-center justify-center overflow-hidden">
        <img
          src={item.image || 'https://via.placeholder.com/200?text=Hardware'}
          alt={item.name}
          className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        {item.stock < 10 && item.stock > 0 && (
          <span className="absolute top-2 left-2 bg-red-100 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-red-200 uppercase tracking-widest">Sắp hết</span>
        )}
        {/* Overlay xem chi tiết */}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <Eye className="w-3 h-3" /> Xem chi tiết
          </div>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1 border-t border-slate-100 bg-white z-10">
        <Link to={`/products/${item.id}`} className="hover:text-[var(--color-brand)] transition-colors">
          <h3 className="font-semibold text-slate-800 leading-snug line-clamp-2 text-sm h-10 group-hover:text-[var(--color-brand)] transition-colors">{item.name}</h3>
        </Link>

        <p className="text-xs text-slate-500 mt-2 line-clamp-1">{item.specs}</p>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="font-black text-[var(--color-brand)] text-lg tracking-tight">
            {fmt(item.price)}
          </div>
        </div>

        <button
          onClick={() => onAddToCart(item)}
          disabled={item.stock === 0}
          className="mt-4 w-full bg-white border-2 border-[var(--color-brand)] text-[var(--color-brand)] font-bold py-2.5 rounded-lg hover:bg-[var(--color-brand)] hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-white cursor-pointer shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          {item.stock === 0 ? 'Hết Hàng' : 'Mua Ngay'}
        </button>
      </div>
    </div>
  );
}
