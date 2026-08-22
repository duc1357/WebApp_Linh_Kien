import React, { useState } from 'react';
import { Cpu, Server, CircuitBoard, MonitorPlay, Zap, HardDrive, Fan, Plus, Link, CheckCircle, AlertTriangle, Cpu as CpuIcon, ShieldCheck, ShoppingCart, X, Trash2, ChevronDown, ChevronUp, CheckCircle2, Target, Sparkles, ShieldAlert } from 'lucide-react';
import { useShop } from "../context/ShopContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import api, { getImageUrl } from "../api/axios";

const REQUIRED_SLOTS = [
  { id: 'CPU',          name: 'Vi Xử Lý (CPU)',      icon: Cpu,          multi: false },
  { id: 'Mainboard',    name: 'Bo Mạch Chủ',         icon: CircuitBoard, multi: false },
  { id: 'RAM',          name: 'Bộ Nhớ Trong (RAM)',  icon: Server,       multi: true  }, // Cho thêm nhiều thanh
  { id: 'VGA',          name: 'Card Đồ Họa',         icon: MonitorPlay,  multi: false },
  { id: 'Nguồn (PSU)', name: 'Nguồn Máy Tính',      icon: Zap,          multi: false },
  { id: 'Ổ Cứng',      name: 'Ổ Cứng (SSD/HDD)',    icon: HardDrive,    multi: true  }, // Cho thêm nhiều ổ
  { id: 'Vỏ Case',      name: 'Vỏ Case',             icon: Server,       multi: false },
  { id: 'Tản Nhiệt',   name: 'Tản Nhiệt CPU',       icon: Fan,          multi: false },
];

const fmt = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function PCBuilder() {
  const { categories } = useShop();
  const { addMultipleToCart } = useCart();
  // selectedParts: { slotId: product[] } — luôn lưu dạng mảng
  const [selectedParts, setSelectedParts] = useState({});
  const [selectingSlot, setSelectingSlot] = useState(null);
  const [productsCache, setProductsCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [validating, setValidating] = useState(false);
  const [showFullEvaluation, setShowFullEvaluation] = useState(false);

  const handleOpenSlot = async (slotId) => {
    setSelectingSlot(slotId);
    if (!productsCache[slotId]) {
      setLoading(true);
      const cat = categories.find(c => c.name === slotId);
      if (cat) {
        const res = await api.get(`/products?category_id=${cat.id}`);
        setProductsCache(prev => ({ ...prev, [slotId]: res.data }));
      }
      setLoading(false);
    }
  };

  const handleSelectProduct = (slotId, product) => {
    const slot = REQUIRED_SLOTS.find(s => s.id === slotId);
    setSelectedParts(prev => {
      const current = prev[slotId] || [];
      if (slot?.multi) {
        // Tìm xem đã có sản phẩm này chưa
        const idx = current.findIndex(entry => entry.product.id === product.id);
        if (idx !== -1) {
          // Tăng số lượng lên 1
          const updated = [...current];
          updated[idx] = { ...updated[idx], qty: updated[idx].qty + 1 };
          return { ...prev, [slotId]: updated };
        }
        // Thêm mới với qty = 1
        return { ...prev, [slotId]: [...current, { product, qty: 1 }] };
      } else {
        // Single slot: thay thế
        return { ...prev, [slotId]: [{ product, qty: 1 }] };
      }
    });
    if (!slot?.multi) setSelectingSlot(null);
    setAiReport(null);
  };

  // Tăng / giảm số lượng từng item trong slot
  const handleChangeQty = (slotId, productId, delta) => {
    setSelectedParts(prev => {
      const updated = (prev[slotId] || []).map(entry =>
        entry.product.id === productId
          ? { ...entry, qty: Math.max(1, entry.qty + delta) }
          : entry
      );
      return { ...prev, [slotId]: updated };
    });
    setAiReport(null);
  };

  const handleRemovePartItem = (slotId, productId) => {
    setSelectedParts(prev => {
      const updated = (prev[slotId] || []).filter(entry => entry.product.id !== productId);
      if (updated.length === 0) {
        const next = { ...prev };
        delete next[slotId];
        return next;
      }
      return { ...prev, [slotId]: updated };
    });
    setAiReport(null);
  };

  const handleValidate = async () => {
    const allItems = Object.entries(selectedParts).flatMap(([key, arr]) =>
      arr.flatMap(({ product, qty }) =>
        Array(qty).fill({ category_name: key, product_name: product.name, price: product.price, specs: product.specs })
      )
    );
    if (allItems.length === 0) return;

    setValidating(true);
    setAiReport(null);
    try {
      const res = await api.post('/pc-builder/validate', { items: allItems });
      const data = res.data;
      setAiReport({ ...data, is_compatible: data.is_compatible || false });
    } catch {
      setAiReport({ is_compatible: false, evaluation: 'Lỗi kết nối AI. Vui lòng thử lại.' });
    }
    setValidating(false);
  };

  const handleBuy = () => {
    // Mỗi { product, qty } → thêm qty lần vào giỏ hàng
    const allProducts = Object.values(selectedParts)
      .flat()
      .flatMap(({ product, qty }) => Array(qty).fill(product));
    addMultipleToCart(allProducts);
  };

  // Tổng tiền = giá × qty của mỗi entry
  const currentTotal = Object.values(selectedParts)
    .flat()
    .reduce((sum, { product, qty }) => sum + product.price * qty, 0);

  const totalPartsCount = Object.values(selectedParts)
    .flat()
    .reduce((sum, { qty }) => sum + qty, 0);
  const selectingSlotDef = REQUIRED_SLOTS.find(s => s.id === selectingSlot);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <span className="bg-orange-500/10 border border-orange-500/20 text-[var(--color-brand)] text-[9px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest shadow-sm inline-block mb-3">
          Rig Builder Simulator
        </span>
        <h1 className="text-2xl md:text-3xl font-heading font-black text-slate-100 tracking-tight flex items-center justify-center gap-3">
          <CpuIcon className="w-7 h-7 text-[var(--color-brand)] text-glow-orange" />
          XÂY DỰNG CẤU HÌNH PC CHUYÊN NGHIỆP
        </h1>
        <p className="text-slate-400 font-medium text-xs md:text-sm mt-2 max-w-xl mx-auto leading-relaxed">
          Tự do kết hợp các linh kiện công nghệ. Gemini AI sẽ tự động phân tích và đưa ra đánh giá tương thích socket và điện năng.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* CỘT TRÁI: SLOT LINH KIỆN */}
        <div className="w-full lg:w-2/3 space-y-4">
          {REQUIRED_SLOTS.map(slot => {
            const items = selectedParts[slot.id] || [];
            const hasItems = items.length > 0;

            return (
              <div key={slot.id} className="bg-glass border border-glass rounded-2xl shadow-lg hover:shadow-black/20 transition-all overflow-hidden glow-card-hover">
                {/* Slot header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                      <slot.icon className="w-5 h-5 text-[var(--color-brand)] text-glow-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-300 font-black uppercase tracking-wider">{slot.name}</span>
                        {slot.multi && (
                          <span className="text-[8px] bg-blue-500/10 border border-blue-500/30 text-blue-400 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                            +Nhiều
                          </span>
                        )}
                      </div>
                      {!hasItems && (
                        <div className="text-slate-500 italic text-xs mt-1">Chưa chọn linh kiện...</div>
                      )}
                    </div>
                  </div>

                  {/* Nút chọn / thêm */}
                  <button
                    onClick={() => handleOpenSlot(slot.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs transition-all hover:-translate-y-0.5 cursor-pointer shadow-md ${
                      hasItems && slot.multi
                        ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                        : hasItems
                        ? 'bg-white/5 border border-glass text-slate-300 hover:bg-white/10'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/20 hover:shadow-orange-500/30 border border-transparent'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    {hasItems ? (slot.multi ? 'Thêm' : 'Đổi') : 'Chọn'}
                  </button>
                </div>

                {/* Danh sách items đã chọn trong slot */}
                {hasItems && (
                  <div className="border-t border-glass divide-y divide-glass bg-slate-950/20">
                    {items.map(({ product, qty }) => (
                      <div key={product.id} className="flex items-center gap-3 px-4 py-3 group">
                        <img src={getImageUrl(product.image)} alt={product.name} className="w-10 h-10 object-contain rounded-lg bg-white border border-glass p-1 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-200 truncate leading-snug">{product.name}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5 leading-normal">{product.specs}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {/* Bộ điều chỉnh số lượng cho slot multi */}
                          {slot.multi && (
                            <div className="flex items-center border border-glass rounded-lg bg-slate-900 overflow-hidden">
                              <button
                                onClick={() => handleChangeQty(slot.id, product.id, -1)}
                                className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer font-bold text-sm"
                              >-</button>
                              <span className="px-2 text-xs font-black text-slate-200 min-w-[1.2rem] text-center">{qty}</span>
                              <button
                                onClick={() => handleChangeQty(slot.id, product.id, 1)}
                                className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer font-bold text-sm"
                              >+</button>
                            </div>
                          )}
                          <span className="text-xs font-black text-[var(--color-brand)] min-w-[70px] text-right text-glow-orange">
                            {fmt(product.price * qty)}
                          </span>
                          <button
                            onClick={() => handleRemovePartItem(slot.id, product.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-500/20"
                            title="Xóa linh kiện"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CỘT PHẢI: TÓM TẮT & ACTION */}
        <div className="w-full lg:w-1/3">
          <div className="bg-glass border border-glass rounded-3xl shadow-2xl sticky top-24 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-glass bg-slate-900/40 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl" />
              <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">Dự toán Tạm tính</p>
              <p className="text-2xl font-heading font-black text-[var(--color-brand)] text-glow-orange">{fmt(currentTotal)}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">{totalPartsCount} linh kiện đã chọn</p>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <button
                onClick={handleValidate}
                disabled={validating || totalPartsCount === 0}
                className="w-full py-3.5 mb-4 flex items-center justify-center gap-2 bg-white/5 border border-glass text-slate-200 hover:bg-white/10 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer group shadow-lg shadow-black/10"
              >
                {validating ? (
                  <><Zap className="w-4 h-4 animate-pulse text-amber-400" /> AI ĐANG PHÂN TÍCH...</>
                ) : (
                  <><ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" /> KIỂM TRA TƯƠNG THÍCH (AI)</>
                )}
              </button>

              {aiReport && (
                <div className="mb-4 space-y-3 animate-in zoom-in-95 duration-300">
                  {/* 1. Header Card with Verdict & Summary */}
                  <div className={`p-4 rounded-2xl border backdrop-blur-xl relative overflow-hidden ${
                    aiReport.is_compatible 
                      ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-emerald-950/20 border-emerald-500/30 shadow-lg shadow-emerald-500/5' 
                      : 'bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-rose-950/20 border-rose-500/30 shadow-lg shadow-rose-500/5'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border flex items-center justify-center ${
                        aiReport.is_compatible 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {aiReport.is_compatible ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className={`text-xs font-heading font-black tracking-wide uppercase ${
                          aiReport.is_compatible ? 'text-emerald-400 text-glow-emerald' : 'text-rose-400 text-glow-rose'
                        }`}>
                          {aiReport.is_compatible ? 'CẤU HÌNH TƯƠNG THÍCH' : 'CẢNH BÁO TƯƠNG THÍCH'}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                          Kiểm định bởi AI Vua Linh Kiện
                        </p>
                      </div>
                    </div>

                    {aiReport.summary && (
                      <p className="text-xs text-slate-200 mt-2.5 font-medium leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-white/5">
                        {aiReport.summary}
                      </p>
                    )}

                    {aiReport.suitability && (
                      <div className="mt-2.5 flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-300 font-medium">
                        <Target className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span className="truncate" title={aiReport.suitability}>
                          <strong className="text-orange-200">Phù hợp:</strong> {aiReport.suitability}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 2. Structured Component-by-Component Checks */}
                  {aiReport.details && aiReport.details.length > 0 && (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {aiReport.details.map((detail, idx) => {
                        const isPass = detail.status === 'pass';
                        const isWarn = detail.status === 'warning';
                        return (
                          <div 
                            key={idx} 
                            className={`p-2.5 rounded-xl border transition-all text-[11px] ${
                              isPass 
                                ? 'bg-slate-900/70 border-emerald-500/20 hover:border-emerald-500/40' 
                                : isWarn 
                                  ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50' 
                                  : 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${isPass ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : isWarn ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-rose-400 shadow-[0_0_8px_#f43f5e]'}`} />
                                {detail.title}
                              </span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider ${
                                isPass 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : isWarn 
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                {isPass ? 'Chuẩn' : isWarn ? 'Lưu ý' : 'Lỗi'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal pl-3.5">
                              {detail.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 3. Collapsible Detailed Expert Evaluation */}
                  {aiReport.evaluation && (
                    <div className="rounded-xl border border-glass bg-slate-900/50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowFullEvaluation(!showFullEvaluation)}
                        className="w-full px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-200 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                          Nhận xét chi tiết từ Chuyên Gia
                        </span>
                        {showFullEvaluation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      {showFullEvaluation && (
                        <div className="p-3 border-t border-glass text-[11px] text-slate-300 leading-relaxed font-normal bg-slate-950/70 max-h-48 overflow-y-auto whitespace-pre-line">
                          {aiReport.evaluation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-auto pt-6 border-t border-glass">
                <button
                  onClick={handleBuy}
                  disabled={totalPartsCount === 0}
                  className="w-full py-4 text-white hover:scale-[1.01] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:border-glass rounded-xl font-black text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:translate-y-0"
                >
                  <ShoppingCart className="w-4.5 h-4.5" /> THÊM TẤT CẢ VÀO GIỎ HÀNG
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP: CHỌN SẢN PHẨM */}
      {selectingSlot && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-glass max-w-4xl w-full rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-5 border-b border-glass flex justify-between items-center bg-slate-900/60">
              <div>
                <h2 className="font-heading font-black text-base text-slate-100 uppercase tracking-wide">CHỌN {selectingSlot}</h2>
                {selectingSlotDef?.multi && (
                  <p className="text-[10px] text-blue-400 font-bold mt-1">
                    ✓ Chế độ chọn nhiều — Sản phẩm chọn sẽ tự động cộng dồn
                  </p>
                )}
              </div>
              <button onClick={() => setSelectingSlot(null)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-glass cursor-pointer">
                <X className="w-4.5 h-4.5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(n => <div key={n} className="h-48 bg-glass border border-glass rounded-2xl animate-pulse" />)}
                </div>
              ) : productsCache[selectingSlot]?.length === 0 ? (
                <p className="text-center text-slate-500 font-medium py-10 text-xs">Chưa có linh kiện trong danh mục này.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {productsCache[selectingSlot]?.map(item => {
                    const existingEntry = (selectedParts[selectingSlot] || []).find(e => e.product.id === item.id);
                    const selectedQty = existingEntry?.qty || 0;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectProduct(selectingSlot, item)}
                        className={`bg-slate-900/30 p-4 rounded-2xl border transition-all flex flex-col group cursor-pointer ${
                          selectedQty > 0
                            ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/5'
                            : 'border-glass hover:border-orange-500/30 hover:bg-white/5'
                        }`}
                      >
                        {selectedQty > 0 && (
                          <div className="text-[9px] font-black text-[var(--color-brand)] bg-orange-500/10 border border-orange-500/20 rounded-md px-2 py-0.5 mb-2.5 self-start">
                            ✓ Đã chọn ×{selectedQty}
                          </div>
                        )}
                        <div className="h-24 w-full flex justify-center mb-3">
                          <img src={getImageUrl(item.image)} alt={item.name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <h4 className="font-bold text-slate-200 text-xs line-clamp-2 leading-snug group-hover:text-[var(--color-brand)] transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.specs}</p>
                        <div className="mt-auto pt-4 flex justify-between items-center">
                          <div className="font-heading font-black text-[var(--color-brand)] text-glow-orange text-sm">{fmt(item.price)}</div>
                          <div className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center transition-all font-black text-xs ${selectedQty > 0 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-[var(--color-brand)] group-hover:text-white'}`}>
                            {selectedQty > 0 ? selectedQty : <Plus className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer popup với nút Xong cho multi-slot */}
            {selectingSlotDef?.multi && (
              <div className="p-4 border-t border-glass bg-slate-900/60 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">
                  Đã chọn: <strong className="text-white text-glow-orange">
                    {(selectedParts[selectingSlot] || []).reduce((s, e) => s + e.qty, 0)}
                  </strong> sản phẩm
                </span>
                <button
                  onClick={() => setSelectingSlot(null)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-glass font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Xong ✓
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
