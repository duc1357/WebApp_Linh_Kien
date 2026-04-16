import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, Trash } from 'lucide-react';
import { getImageUrl } from "../../api/axios";
import { useCart } from "../../context/CartContext.jsx";

export default function CartModal({ open, onClose, onCheckout }) {
  const { cartItems, updateQuantity, removeItem, clearCart } = useCart();
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const totalValue = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleClearCart = () => {
    if (confirmClear) {
      clearCart();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      // Tự động hủy confirm sau 3 giây nếu không bấm
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => { onClose(); setConfirmClear(false); }} />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
            <ShoppingBag className="w-5 h-5 text-[var(--color-brand)]" />
            Giỏ Hàng Của Bạn
            {cartItems.length > 0 && (
              <span className="text-xs font-bold bg-[var(--color-brand)] text-white px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Nút xóa tất cả */}
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                title="Xóa tất cả sản phẩm"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  confirmClear
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-red-50 text-red-500 hover:bg-red-100'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {confirmClear ? 'Xác nhận xóa?' : 'Xóa tất cả'}
              </button>
            )}
            <button
              onClick={() => { onClose(); setConfirmClear(false); }}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50/50">
          {cartItems.length === 0 ? (
            <div className="m-auto flex flex-col items-center justify-center text-slate-400 gap-4">
              <ShoppingBag className="w-20 h-20 opacity-20" />
              <p className="font-medium">Giỏ hàng đang trống.</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full font-semibold mt-2 transition-colors cursor-pointer"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm relative group hover:border-orange-200 hover:shadow-md transition-all">
                <div className="w-20 h-20 shrink-0 bg-slate-50 rounded-xl p-1.5 border border-slate-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={getImageUrl(item.product.image)}
                      alt={item.product.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="pr-6">
                    <h4 className="font-bold text-sm text-slate-800 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                      {item.product.name}
                    </h4>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <p className="text-orange-600 font-black text-sm">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.price)}
                    </p>
                    
                    <div className="flex items-center bg-slate-100 rounded-full p-0.5">
                      <button onClick={() => updateQuantity(item.product.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-600 hover:text-orange-500 hover:shadow transition-all">
                        <Minus className="w-3.5 h-3.5" strokeWidth={3} />
                      </button>
                      <span className="text-xs font-black min-w-[32px] text-center text-slate-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-600 hover:text-orange-500 hover:shadow transition-all">
                        <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.product.id)}
                  className="absolute top-3 right-3 p-1.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Xóa sản phẩm này"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-200 p-6 bg-white shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Tổng cộng:</span>
              <span className="text-2xl font-black text-[var(--color-brand)]">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalValue)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-4 rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-black text-lg transition-transform hover:scale-[1.02] shadow-lg shadow-orange-500/30 cursor-pointer">
              ĐẾN TRANG THANH TOÁN →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
