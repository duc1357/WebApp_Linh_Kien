import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { getImageUrl } from "../../api/axios";
import { useCart } from "../../context/CartContext.jsx";

const fmt = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price) || 0);

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
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop Overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
        onClick={() => { onClose(); setConfirmClear(false); }} 
      />

      {/* Main Drawer Container */}
      <div className="relative w-full max-w-md bg-slate-950/95 border-l border-glass text-slate-100 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden backdrop-blur-xl">

        {/* Decorative Top Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-5 border-b border-glass flex justify-between items-center bg-slate-900/60 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-slate-100 flex items-center gap-2">
                Giỏ Hàng Của Bạn
                {cartItems.length > 0 && (
                  <span className="text-[11px] font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm shadow-orange-500/30">
                    {totalItems} SP
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Vua Linh Kiện Official Store</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                title="Xóa tất cả sản phẩm"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  confirmClear
                    ? 'bg-red-500 text-white border-red-400 animate-pulse'
                    : 'bg-slate-900/80 text-red-400 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {confirmClear ? 'Xác nhận xóa?' : 'Xóa tất cả'}
              </button>
            )}
            <button
              onClick={() => { onClose(); setConfirmClear(false); }}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/80 hover:bg-white/10 border border-glass transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 relative z-10 custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="m-auto flex flex-col items-center justify-center text-slate-500 gap-4 text-center p-6">
              <div className="w-24 h-24 rounded-full bg-slate-900/80 border border-glass flex items-center justify-center relative">
                <ShoppingBag className="w-12 h-12 text-slate-600" />
                <Sparkles className="w-6 h-6 text-orange-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <p className="font-heading font-bold text-slate-300 text-sm">Giỏ hàng của bạn đang trống!</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[240px]">Hãy chọn các linh kiện chất lượng nhất để nâng cấp dàn PC của bạn.</p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Khám Phá Linh Kiện
              </button>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div 
                key={idx} 
                className="flex gap-3.5 p-3.5 bg-slate-900/70 hover:bg-slate-900 rounded-2xl border border-glass shadow-sm relative group transition-all duration-200 hover:border-orange-500/40"
              >
                {/* Image Container */}
                <div className="w-20 h-20 shrink-0 bg-slate-950 rounded-xl p-2 border border-glass flex items-center justify-center overflow-hidden relative">
                  <img
                    src={getImageUrl(item.product.image)}
                    alt={item.product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                {/* Information & Quantity Controls */}
                <div className="flex-1 flex flex-col justify-between min-w-0 pr-6">
                  <div>
                    <h4 className="font-bold text-xs text-slate-200 line-clamp-2 leading-snug group-hover:text-orange-400 transition-colors">
                      {item.product.name}
                    </h4>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                    <p className="text-orange-400 font-heading font-black text-sm text-glow-orange">
                      {fmt(item.product.price)}
                    </p>
                    
                    {/* Quantity Pill Counter */}
                    <div className="flex items-center bg-slate-950 rounded-lg border border-glass p-0.5">
                      <button 
                        onClick={() => updateQuantity(item.product.id, -1)} 
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-900 text-slate-400 hover:text-orange-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" strokeWidth={2.5} />
                      </button>
                      <span className="text-xs font-mono font-bold min-w-[28px] text-center text-slate-200">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, 1)} 
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-900 text-slate-400 hover:text-orange-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Xóa khỏi giỏ hàng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout CTA */}
        {cartItems.length > 0 && (
          <div className="border-t border-glass p-5 bg-slate-900/80 backdrop-blur-md relative z-10 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Số lượng sản phẩm:</span>
                <span className="font-mono font-bold text-slate-200">{totalItems} món</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Phí vận chuyển:</span>
                <span className="text-green-400 font-bold">Miễn phí toàn quốc</span>
              </div>
              <div className="pt-2 border-t border-glass flex justify-between items-center">
                <span className="text-slate-300 font-heading font-black text-xs uppercase tracking-wider">Tổng giá trị:</span>
                <span className="text-2xl font-heading font-black text-[var(--color-brand)] text-glow-orange">
                  {fmt(totalValue)}
                </span>
              </div>
            </div>

            <button
              onClick={() => { onClose(); onCheckout(); }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-heading font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group"
            >
              Tiến Hành Thanh Toán 
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

