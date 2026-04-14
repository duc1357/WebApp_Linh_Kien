import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package, Tag, Layers, CheckCircle, AlertTriangle, Plus, Minus } from 'lucide-react';
import ProductReviews from "../components/common/ProductReviews.jsx";
const fmt = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function ProductDetail({ onAddToCart }) {
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
        const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/products/${id}`);
        if (!r.ok) throw new Error('not found');
        const p = await r.json();
        
        // Lấy tên danh mục
        const catRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/categories`);
        const cats = await catRes.json();
        
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
    for (let i = 0; i < qty; i++) onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Skeleton loading
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded animate-pulse w-3/4" />
            <div className="h-10 bg-slate-200 rounded animate-pulse w-1/2" />
            <div className="h-24 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <Package className="w-16 h-16 opacity-30" />
        <p className="font-bold">Sản phẩm không tồn tại.</p>
        <Link to="/" className="text-[var(--color-brand)] font-bold hover:underline">
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
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 flex-wrap">
        <Link to="/" className="hover:text-[var(--color-brand)] font-medium flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Cửa hàng
        </Link>
        {category && (
          <>
            <span>/</span>
            <span
              className="hover:text-[var(--color-brand)] font-medium cursor-pointer"
              onClick={() => navigate('/')}
            >
              {category.name}
            </span>
          </>
        )}
        <span>/</span>
        <span className="font-bold text-slate-800 line-clamp-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ẢNH SẢN PHẨM */}
        <div className="relative">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex items-center justify-center min-h-[360px] group overflow-hidden">
            <img
              src={product.image || 'https://via.placeholder.com/400?text=Hardware'}
              alt={product.name}
              className="max-h-80 w-full object-contain group-hover:scale-110 transition-transform duration-500"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <span className="bg-red-500 text-white font-black text-xl px-8 py-3 rounded-full">
                  HẾT HÀNG
                </span>
              </div>
            )}
            {product.stock > 0 && product.stock < 10 && (
              <span className="absolute top-4 left-4 bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200">
                ⚡ Sắp hết hàng
              </span>
            )}
          </div>
        </div>

        {/* THÔNG TIN SẢN PHẨM */}
        <div className="flex flex-col">
          {/* Badge danh mục */}
          {category && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand)] bg-orange-50 border border-orange-100 px-3 py-1 rounded-full self-start mb-3">
              <Tag className="w-3 h-3" />
              {category.name}
            </span>
          )}

          <h1 className="text-2xl font-black text-slate-800 leading-tight mb-4">{product.name}</h1>

          {/* Giá */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5 mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Giá bán</p>
            <p className="text-4xl font-black text-[var(--color-brand)]">{fmt(product.price)}</p>
          </div>

          {/* Tồn kho */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <><CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-700">
                Còn hàng ({product.stock} cái)
              </span></>
            ) : (
              <><AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-600">Hết hàng</span></>
            )}
          </div>

          {/* Chọn số lượng + Thêm vào giỏ */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer font-bold text-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 py-3 font-black text-lg text-slate-800 min-w-[3rem] text-center border-x-2 border-slate-200">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-4 py-3 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer font-bold text-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  added
                    ? 'bg-green-500 text-white shadow-green-400/30'
                    : 'bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white shadow-orange-500/30 hover:scale-[1.02]'
                }`}
              >
                {added ? (
                  <><CheckCircle className="w-5 h-5" /> Đã thêm vào giỏ!</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Thêm vào giỏ</>
                )}
              </button>
            </div>
          )}

          {/* Thông số kỹ thuật */}
          {specLines.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <h2 className="font-black text-slate-700 text-sm uppercase tracking-wider">
                  Thông Số Kỹ Thuật
                </h2>
              </div>
              <div className="divide-y divide-slate-50">
                {specLines.map((spec, i) => {
                  const [key, ...rest] = spec.split(':');
                  const val = rest.join(':').trim();
                  return (
                    <div key={i} className="px-5 py-3 flex items-start gap-3 text-sm">
                      {val ? (
                        <>
                          <span className="text-slate-500 font-medium w-1/2">{key.trim()}</span>
                          <span className="font-bold text-slate-800 flex-1">{val}</span>
                        </>
                      ) : (
                        <span className="text-slate-600 font-medium">{spec}</span>
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
