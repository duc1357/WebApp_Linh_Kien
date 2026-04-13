import React, { useState } from 'react';
import { Cpu, Server, CircuitBoard, MonitorPlay, Zap, HardDrive, Fan, Plus, Link, CheckCircle, AlertTriangle, Cpu as CpuIcon, ShieldCheck, ShoppingCart, X, Trash2 } from 'lucide-react';

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

export default function PCBuilder({ categories, onAddAllToCart }) {
  // selectedParts: { slotId: product[] } — luôn lưu dạng mảng
  const [selectedParts, setSelectedParts] = useState({});
  const [selectingSlot, setSelectingSlot] = useState(null);
  const [productsCache, setProductsCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [validating, setValidating] = useState(false);

  const handleOpenSlot = async (slotId) => {
    setSelectingSlot(slotId);
    if (!productsCache[slotId]) {
      setLoading(true);
      const cat = categories.find(c => c.name === slotId);
      if (cat) {
        const res = await fetch(`http://localhost:8000/api/v1/products?category_id=${cat.id}`);
        const data = await res.json();
        setProductsCache(prev => ({ ...prev, [slotId]: data }));
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
      const res = await fetch('http://localhost:8000/api/v1/pc-builder/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: allItems }),
      });
      const data = await res.json();
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
    onAddAllToCart(allProducts);
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-3">
          <CpuIcon className="w-8 h-8 text-[var(--color-brand)]" />
          XÂY DỰNG CẤU HÌNH PC ĐỈNH CAO
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Chọn linh kiện theo ý muốn. <span className="text-[var(--color-brand)] font-bold">RAM & Ổ Cứng</span> có thể thêm nhiều thanh. AI Gemini sẽ kiểm tra tương thích.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* CỘT TRÁI: SLOT LINH KIỆN */}
        <div className="w-full lg:w-2/3 space-y-3">
          {REQUIRED_SLOTS.map(slot => {
            const items = selectedParts[slot.id] || [];
            const hasItems = items.length > 0;

            return (
              <div key={slot.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Slot header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-11 h-11 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <slot.icon className="w-5 h-5 text-[var(--color-brand)] opacity-80" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{slot.name}</span>
                        {slot.multi && (
                          <span className="text-[9px] bg-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded-full">
                            +Nhiều
                          </span>
                        )}
                      </div>
                      {!hasItems && (
                        <div className="text-slate-300 italic text-sm mt-0.5">Chưa chọn linh kiện...</div>
                      )}
                    </div>
                  </div>

                  {/* Nút chọn / thêm */}
                  <button
                    onClick={() => handleOpenSlot(slot.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all hover:-translate-y-0.5 cursor-pointer shadow-sm ${
                      hasItems && slot.multi
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        : hasItems
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] shadow-orange-500/20'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    {hasItems ? (slot.multi ? 'Thêm' : 'Đổi') : 'Chọn'}
                  </button>
                </div>

                {/* Danh sách items đã chọn trong slot */}
                {hasItems && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {items.map(({ product, qty }) => (
                      <div key={product.id} className="flex items-center gap-3 px-4 py-2.5 bg-slate-50/50 group">
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-contain rounded bg-white border border-slate-100 p-1 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{product.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{product.specs}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Bộ điều chỉnh số lượng cho slot multi */}
                          {slot.multi && (
                            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                              <button
                                onClick={() => handleChangeQty(slot.id, product.id, -1)}
                                className="px-2 py-1 text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer font-bold text-base leading-none"
                              >-</button>
                              <span className="px-2 text-sm font-black text-slate-800 min-w-[1.5rem] text-center">{qty}</span>
                              <button
                                onClick={() => handleChangeQty(slot.id, product.id, 1)}
                                className="px-2 py-1 text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer font-bold text-base leading-none"
                              >+</button>
                            </div>
                          )}
                          <span className="text-sm font-black text-[var(--color-brand)] min-w-[80px] text-right">
                            {fmt(product.price * qty)}
                          </span>
                          <button
                            onClick={() => handleRemovePartItem(slot.id, product.id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Xóa linh kiện này"
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
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 sticky top-24 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
              <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">Dự toán Tạm tính</p>
              <p className="text-3xl font-black text-[var(--color-brand)]">{fmt(currentTotal)}</p>
              <p className="text-xs text-slate-400 mt-1">{totalPartsCount} linh kiện đã chọn</p>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <button
                onClick={handleValidate}
                disabled={validating || totalPartsCount === 0}
                className="w-full py-3 mb-4 flex items-center justify-center gap-2 bg-[#1e293b] text-white hover:bg-black rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer group shadow-lg shadow-slate-900/20"
              >
                {validating ? (
                  <><Zap className="w-5 h-5 animate-pulse text-amber-400" /> AI ĐANG PHÂN TÍCH...</>
                ) : (
                  <><ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" /> KIỂM TRA TƯƠNG THÍCH (AI)</>
                )}
              </button>

              {aiReport && (
                <div className={`p-4 rounded-xl border-l-4 shadow-sm mb-4 animate-in zoom-in duration-300 text-sm leading-relaxed ${aiReport.is_compatible ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-red-50 border-red-500 text-red-800'}`}>
                  <div className="flex items-center gap-2 font-black mb-2 uppercase text-xs tracking-wider">
                    {aiReport.is_compatible ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {aiReport.is_compatible ? 'Hoạt động Tốt' : 'Cảnh báo Xung đột'}
                  </div>
                  <div className="italic opacity-90">{aiReport.evaluation}</div>
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-slate-100">
                <button
                  onClick={handleBuy}
                  disabled={totalPartsCount === 0}
                  className="w-full py-4 text-white hover:scale-[1.02] bg-[var(--color-brand)] disabled:bg-slate-300 rounded-xl font-black text-lg transition-transform cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
                >
                  <ShoppingCart className="w-5 h-5" /> THÊM TẤT CẢ VÀO GIỎ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP: CHỌN SẢN PHẨM */}
      {selectingSlot && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h2 className="font-black text-lg text-slate-800">CHỌN {selectingSlot}</h2>
                {selectingSlotDef?.multi && (
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">
                    ✅ Có thể chọn nhiều — sản phẩm đã chọn sẽ được thêm vào danh sách
                  </p>
                )}
              </div>
              <button onClick={() => setSelectingSlot(null)} className="p-2 hover:bg-slate-200 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(n => <div key={n} className="h-48 bg-slate-200 rounded-xl animate-pulse" />)}
                </div>
              ) : productsCache[selectingSlot]?.length === 0 ? (
                <p className="text-center text-slate-500 font-medium py-10">Chưa có linh kiện trong danh mục này.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {productsCache[selectingSlot]?.map(item => {
                    const existingEntry = (selectedParts[selectingSlot] || []).find(e => e.product.id === item.id);
                    const selectedQty = existingEntry?.qty || 0;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectProduct(selectingSlot, item)}
                        className={`bg-white p-4 rounded-xl border-2 shadow-sm transition-all flex flex-col group cursor-pointer ${
                          selectedQty > 0
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-slate-200 hover:border-orange-300'
                        }`}
                      >
                        {selectedQty > 0 && (
                          <div className="text-[10px] font-black text-orange-700 bg-orange-100 rounded px-2 py-0.5 mb-2 self-start">
                            ✓ Đã chọn ×{selectedQty} — Click để thêm
                          </div>
                        )}
                        <div className="h-24 w-full flex justify-center mb-3">
                          <img src={item.image} alt={item.name} className="max-h-full object-contain group-hover:scale-110 transition-transform" />
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug group-hover:text-[var(--color-brand)]">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{item.specs}</p>
                        <div className="mt-auto pt-3 flex justify-between items-center">
                          <div className="font-bold text-[var(--color-brand)]">{fmt(item.price)}</div>
                          <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors font-bold text-sm ${selectedQty > 0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-[var(--color-brand)] group-hover:text-white'}`}>
                            {selectedQty > 0 ? selectedQty : <Plus className="w-4 h-4" />}
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
              <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl flex justify-between items-center">
                <span className="text-sm text-slate-500">
                  Đã chọn: <strong className="text-slate-800">
                    {(selectedParts[selectingSlot] || []).reduce((s, e) => s + e.qty, 0)}
                  </strong> cái
                </span>
                <button
                  onClick={() => setSelectingSlot(null)}
                  className="px-6 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-colors cursor-pointer"
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
