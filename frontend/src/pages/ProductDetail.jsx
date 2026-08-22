import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package, Tag, Layers, CheckCircle, AlertTriangle, Plus, Minus } from 'lucide-react';
import ProductReviews from "../components/common/ProductReviews.jsx";
import { useCart } from "../context/CartContext.jsx";
import api, { getImageUrl } from "../api/axios";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='16' height='16' x='4' y='4' rx='2'/%3E%3Crect width='6' height='6' x='9' y='9' rx='1'/%3E%3Cpath d='M15 2v2'/%3E%3Cpath d='M15 20v2'/%3E%3Cpath d='M2 15h2'/%3E%3Cpath d='M2 9h2'/%3E%3Cpath d='M20 15h2'/%3E%3Cpath d='M20 9h2'/%3E%3Cpath d='M9 2v2'/%3E%3Cpath d='M9 20v2'/%3E%3C/svg%3E";

const fmt = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function ProductDetail() {
  const { addToCart } = useCart();
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let active = true;
    const loadProduct = async () => {
      setLoading(true);
      try {
        const r = await api.get(`/products/${id}`);
        const p = r.data;
        
        // Lấy tên danh mục
        const catRes = await api.get('/categories');
        const cats = catRes.data;
        
        if (active) {
            setProduct(p);
            setCategory(cats.find((c) => c.id === p.category_id));
            setLoading(false);
        }
      } catch {
        if (active) {
            setLoading(false);
        }
      }
    };
    
    loadProduct();
    return () => { active = false; };
  }, [id]);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Skeleton loading
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-96 bg-glass border border-glass rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-glass border border-glass rounded animate-pulse w-3/4" />
            <div className="h-10 bg-glass border border-glass rounded animate-pulse w-1/2" />
            <div className="h-24 bg-glass border border-glass rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <Package className="w-16 h-16 opacity-30" />
        <p className="font-bold text-sm">Sản phẩm không tồn tại.</p>
        <Link to="/" className="text-[var(--color-brand)] font-bold hover:underline text-xs">
          ← Về trang chủ
        </Link>
      </div>
    );
  }

  // Parse specs thành từng dòng để hiển thị đẹp
  const specLines = product.specs
    ? product.specs.split(/[,|;]+/).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-8 flex-wrap">
        <Link to="/" className="hover:text-[var(--color-brand)] font-semibold flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Cửa hàng
        </Link>
        {category && (
          <>
            <span>/</span>
            <span
              className="hover:text-[var(--color-brand)] font-semibold cursor-pointer"
              onClick={() => navigate('/')}
            >
              {category.name}
            </span>
          </>
        )}
        <span>/</span>
        <span className="font-bold text-slate-200 line-clamp-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ẢNH SẢN PHẨM */}
        <div className="relative">
          <div className="bg-slate-900/30 border border-glass rounded-3xl shadow-xl p-8 flex items-center justify-center min-h-[360px] group overflow-hidden bg-gradient-to-b from-slate-950/20 to-transparent">
            <img
              src={getImageUrl(product.image) || FALLBACK_IMAGE}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
              alt={product.name}
              className="max-h-80 w-full object-contain group-hover:scale-105 transition-transform duration-500 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-red-500 text-white font-heading font-black text-lg px-8 py-3 rounded-2xl shadow-xl shadow-red-500/20">
                  HẾT HÀNG
                </span>
              </div>
            )}
            {product.stock > 0 && product.stock < 10 && (
              <span className="absolute top-4 left-4 bg-red-500/10 border border-red-500/25 text-red-400 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
                ⚡ Sắp hết hàng
              </span>
            )}
          </div>
        </div>

        {/* THÔNG TIN SẢN PHẨM */}
        <div className="flex flex-col">
          {/* Badge danh mục */}
          {category && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-[var(--color-brand)] bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg self-start mb-4 uppercase tracking-wider">
              <Tag className="w-3 h-3" />
              {category.name}
            </span>
          )}

          <h1 className="text-xl md:text-2xl font-heading font-black text-slate-100 leading-tight mb-4">{product.name}</h1>

          {/* Tồn kho */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/25 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Còn hàng ({product.stock} cái)
              </span>
            ) : (
              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Hết hàng
              </span>
            )}
          </div>

          {/* Giá */}
          <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-5 mb-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Giá bán lẻ</p>
            <p className="text-3xl font-heading font-black text-[var(--color-brand)] text-glow-orange">{fmt(product.price)}</p>
          </div>

          {/* Chọn số lượng + Thêm vào giỏ */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-glass rounded-xl overflow-hidden bg-slate-900 shadow-sm">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer font-bold text-lg"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-5 py-3 font-heading font-black text-base text-slate-200 min-w-[3rem] text-center border-x border-glass">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer font-bold text-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
                  added
                    ? 'bg-green-500/10 border border-green-500/25 text-green-400 shadow-green-500/5'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20'
                }`}
              >
                {added ? (
                  <><CheckCircle className="w-4.5 h-4.5" /> ĐÃ THÊM VÀO GIỎ!</>
                ) : (
                  <><ShoppingCart className="w-4.5 h-4.5" /> THÊM VÀO GIỎ HÀNG</>
                )}
              </button>
            </div>
          )}

          {/* Thông số kỹ thuật */}
          {specLines.length > 0 && (
            <div className="bg-glass border border-glass rounded-2xl overflow-hidden shadow-xl shadow-black/10">
              <div className="px-5 py-3.5 bg-slate-900/40 border-b border-glass flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <h2 className="font-heading font-black text-slate-200 text-xs uppercase tracking-wider">
                  Thông Số Kỹ Thuật
                </h2>
              </div>
              <div className="divide-y divide-glass bg-slate-950/20">
                {specLines.map((spec, i) => {
                  const [key, ...rest] = spec.split(':');
                  const val = rest.join(':').trim();
                  return (
                    <div key={i} className="px-5 py-3 flex items-start gap-3 text-xs leading-normal">
                      {val ? (
                        <>
                          <span className="text-slate-400 font-semibold w-1/3 shrink-0">{key.trim()}</span>
                          <span className="font-bold text-slate-200 flex-1">{val}</span>
                        </>
                      ) : (
                        <span className="text-slate-300 font-medium">{spec}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* KHU VỰC ĐÁNH GIÁ SẢN PHẨM */}
      <ProductReviews productId={id} />
    </div>
  );
}
