import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Laptop, Search, ChevronRight, PackageCheck, Cpu, ShoppingCart, Zap, Sparkles, ArrowLeft } from 'lucide-react';
import { useCart } from "../../context/CartContext.jsx";
import api, { getImageUrl } from "../../api/axios";

const USE_CASE_LABELS = {
  gaming: '🎮 Cấu Hình Gaming Đỉnh Cao',
  office: '💼 Cấu Hình Văn Phòng / Học Tập',
  design: '🎨 Cấu Hình Đồ Họa / Render / Design',
  streaming: '📡 Cấu Hình Livestream / Creator',
  general: '🖥️ Cấu Hình Đa Năng Hiệu Năng Cao',
};

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='16' height='16' x='4' y='4' rx='2'/%3E%3Crect width='6' height='6' x='9' y='9' rx='1'/%3E%3Cpath d='M15 2v2'/%3E%3Cpath d='M15 20v2'/%3E%3Cpath d='M2 15h2'/%3E%3Cpath d='M2 9h2'/%3E%3Cpath d='M20 15h2'/%3E%3Cpath d='M20 9h2'/%3E%3Cpath d='M9 2v2'/%3E%3Cpath d='M9 20v2'/%3E%3C/svg%3E";

const fmt = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price) || 0);

export default function FloatingChatbot() {
  const { addToCart, addMultipleToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  // Mode: null | 'laptop' | 'pc_build'
  const [chatMode, setChatMode] = useState(null);

  // Laptop diagnosis state
  const [laptops, setLaptops] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedLaptop, setSelectedLaptop] = useState(null);

  // Shared messages
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Initial greeting when open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'bot',
          text: 'Xin chào! Tôi là **Trợ Lý AI Vua Linh Kiện** 🤖\n\nTôi có thể giúp bạn giải quyết các nhu cầu linh kiện & PC hôm nay:',
          showModeSelect: true,
        },
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && chatMode === 'laptop' && laptops.length === 0) {
      api.get('/laptops')
        .then(res => setLaptops(res.data))
        .catch(() => {});
    }
  }, [isOpen, chatMode, laptops.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSelectMode = (mode) => {
    setChatMode(mode);
    if (mode === 'laptop') {
      setMessages(prev => [
        ...prev,
        { role: 'user', text: '🔧 Chẩn đoán & Nâng cấp Laptop' },
        { role: 'bot', text: 'Vui lòng nhập **tên dòng Laptop + sự cố** bạn gặp phải (Ví dụ: *"Dell XPS 15 bị nóng tự tắt"*, *"MacBook M1 hết ổ cứng"*, *"Asus TUF giật lag"*) hoặc chọn mẫu gợi ý dưới đây:' },
      ]);
    } else if (mode === 'pc_build') {
      setMessages(prev => [
        ...prev,
        { role: 'user', text: '🖥️ Tư vấn Build PC theo Ngân sách' },
        {
          role: 'bot',
          text: 'Cho tôi biết **mục đích sử dụng** và **ngân sách dự kiến** của bạn nhé!\n\nVí dụ:\n• "15 triệu chơi mượt Valorant, GTA V"\n• "20 triệu làm Photoshop & Premiere"\n• "8 triệu máy học tập văn phòng"',
        },
      ]);
    }
  };

  const handleSelectLaptop = (lap) => {
    setSelectedLaptop(lap);
    setMessages(prev => [
      ...prev,
      { role: 'user', text: `Tôi đang dùng ${lap.name}` },
      { role: 'bot', text: `Tuyệt vời! Chiếc **${lap.name}** của bạn đang gặp hiện tượng gì? (VD: Máy nóng tự tắt, giật lag, hết dung lượng ổ cứng, cần chạy nhiều tab...)` },
    ]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    setInputMsg('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      if (chatMode === 'laptop') {
        // Chẩn đoán laptop tự do (có chọn hoặc gõ trực tiếp tên laptop)
        const payload = selectedLaptop
          ? { laptop_id: selectedLaptop.id, issue_description: userText }
          : { laptop_name: "Laptop", issue_description: userText };

        const res = await api.post('/ai/diagnose', payload);
        const data = res.data;
        setMessages(prev => [...prev, {
          role: 'bot',
          text: data.diagnosis || 'Đã hoàn tất phân tích chẩn đoán.',
          categories: data.recommended_categories || [],
        }]);

      } else if (chatMode === 'pc_build') {
        // Tư vấn build PC
        const res = await api.post('/ai/recommend-build', { requirement: userText });
        const data = res.data;
        setMessages(prev => [...prev, {
          role: 'bot',
          text: data.message || 'Đây là cấu hình tối ưu nhất được chọn lọc từ kho linh kiện Vua Linh Kiện!',
          buildResult: data,
        }]);
      }
    } catch (err) {
      const serverMsg = err.response?.data?.detail;
      const finalMsg = serverMsg || (err instanceof Error ? err.message : 'Hệ thống AI đang bận. Vui lòng thử lại sau giây lát!');
      setMessages(prev => [...prev, { role: 'bot', text: finalMsg }]);
    }

    setLoading(false);
  };

  const handleAddAllToCart = (products) => {
    addMultipleToCart(products.map(item => item.product));
  };

  const handleReset = () => {
    setChatMode(null);
    setSelectedLaptop(null);
    setSearch('');
    setMessages([{
      role: 'bot',
      text: 'Xin chào! Tôi là **Trợ Lý AI Vua Linh Kiện** 🤖\n\nTôi có thể giúp bạn giải quyết các nhu cầu linh kiện & PC hôm nay:',
      showModeSelect: true,
    }]);
  };

  const filteredLaptops = search ? laptops.filter(l => l.name.toLowerCase().includes(search.toLowerCase())) : laptops;
  const isInputDisabled = !chatMode || loading;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 p-0.5 rounded-2xl shadow-2xl hover:scale-110 hover:shadow-orange-500/40 transition-all duration-300 z-[90] cursor-pointer group"
        title="Trợ lý AI Vua Linh Kiện"
      >
        <span className="absolute inset-0 rounded-2xl bg-orange-500/30 animate-ping opacity-75 pointer-events-none" />
        <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center relative overflow-hidden">
          {isOpen ? (
            <X className="w-6 h-6 text-orange-400 group-hover:rotate-90 transition-transform" />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="font-heading font-black text-xl text-orange-500 text-glow-orange leading-none">
                V
              </span>
              <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest leading-none mt-0.5">
                AI
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Main Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[400px] h-[620px] max-h-[80vh] bg-slate-950/95 border border-glass text-slate-100 rounded-3xl shadow-2xl z-[90] flex flex-col overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-slate-900/90 p-4 border-b border-glass flex items-center justify-between shrink-0 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 p-0.5 shadow-md shadow-orange-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-heading font-black text-sm text-orange-500 text-glow-orange">
                  V
                </div>
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-slate-100 flex items-center gap-1.5">
                  Trợ Lý AI Smart Assistant
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Trực tuyến 24/7</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {chatMode && (
                <button 
                  onClick={handleReset} 
                  className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-glass px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" /> Chức năng
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-950/40 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4.5 h-4.5 text-orange-500" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-none font-medium shadow-orange-500/10' 
                    : 'bg-slate-900/90 border border-glass text-slate-200 rounded-tl-none'
                }`}>
                  {/* Rich Text Format Support */}
                  <div>
                    {(msg.text || '').split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
                        {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                          j % 2 === 1 ? <strong key={j} className="text-orange-400 font-bold">{part}</strong> : part
                        )}
                      </p>
                    ))}
                  </div>

                  {/* Feature Mode Option Cards */}
                  {msg.showModeSelect && (
                    <div className="mt-3 flex flex-col gap-2">
                      <button
                        onClick={() => handleSelectMode('laptop')}
                        className="flex items-center gap-2.5 p-3 bg-slate-950 hover:bg-orange-500/10 text-slate-200 hover:text-orange-400 rounded-xl text-xs font-bold border border-glass hover:border-orange-500/40 transition-all text-left group cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">🔧 Chẩn đoán & Nâng cấp Laptop</p>
                          <p className="text-[10px] text-slate-400 font-normal mt-0.5">Tìm lỗi máy nóng, chậm, nâng cấp RAM/SSD</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleSelectMode('pc_build')}
                        className="flex items-center gap-2.5 p-3 bg-slate-950 hover:bg-blue-500/10 text-slate-200 hover:text-blue-400 rounded-xl text-xs font-bold border border-glass hover:border-blue-500/40 transition-all text-left group cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">🖥️ Tư vấn Build PC theo Ngân Sách</p>
                          <p className="text-[10px] text-slate-400 font-normal mt-0.5">Tự động chọn cấu hình tối ưu thực tế từ DB</p>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Laptop Recommended Products Grid */}
                  {msg.categories && msg.categories.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-glass pt-3">
                      <p className="font-extrabold text-[10px] text-orange-400 uppercase tracking-wider flex items-center gap-1">
                        <PackageCheck className="w-3.5 h-3.5" /> Gợi ý linh kiện tương thích:
                      </p>
                      {msg.categories.map((cat, i) => (
                        <div key={i} className="p-2.5 bg-slate-950/80 rounded-xl border border-glass">
                          <div className="text-[10px] font-black text-orange-400 uppercase tracking-wider">{cat.category_name || 'Linh Kiện'}</div>
                          {cat.sample_product && (
                            <div className="text-[11px] font-bold text-slate-200 mt-0.5 flex items-center justify-between">
                              <span className="truncate">{cat.sample_product}</span>
                              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">Có sẵn tại cửa hàng</span>
                            </div>
                          )}
                          {cat.products && cat.products.map((item, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => addToCart(item.product)} 
                              className="flex items-center gap-2.5 p-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-glass hover:border-orange-500/40 cursor-pointer group transition-all mt-1.5"
                            >
                              <div className="w-10 h-10 shrink-0 bg-slate-950 rounded-lg p-1 border border-glass flex items-center justify-center overflow-hidden">
                                <img
                                  src={getImageUrl(item.product.image) || FALLBACK_IMAGE}
                                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
                                  className="w-full h-full object-contain"
                                  alt=""
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-orange-400">{item.product.name}</div>
                                <div className="text-[11px] text-orange-400 font-black text-glow-orange">{fmt(item.product.price)}</div>
                              </div>
                              <div className="p-1 rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
                                <ShoppingCart className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PC Build Recommended Configuration */}
                  {msg.buildResult && msg.buildResult.products?.length > 0 && (
                    <div className="mt-3 border-t border-glass pt-3">
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="font-extrabold text-[10px] text-green-400 uppercase tracking-wider flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" />
                          {USE_CASE_LABELS[msg.buildResult.use_case] || '🖥️ Cấu hình đề xuất'}
                        </p>
                        <span className="text-[10px] font-black text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/30 text-glow-orange">
                          {fmt(msg.buildResult.total)}
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                        {msg.buildResult.products.map((item, i) => (
                          <div 
                            key={i} 
                            onClick={() => addToCart(item.product)} 
                            className="flex items-center gap-2.5 p-2 bg-slate-950/80 hover:bg-slate-900 rounded-xl border border-glass hover:border-orange-500/40 cursor-pointer group transition-all"
                          >
                            <div className="w-10 h-10 shrink-0 bg-slate-900 rounded-lg p-1 border border-glass flex items-center justify-center overflow-hidden">
                              <img
                                src={getImageUrl(item.product.image) || FALLBACK_IMAGE}
                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
                                className="w-full h-full object-contain"
                                alt=""
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-orange-400" />
                                {item.category}
                              </div>
                              <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-orange-400 leading-tight">{item.product.name}</div>
                              <div className="text-[11px] text-orange-400 font-black text-glow-orange">{fmt(item.product.price)}</div>
                            </div>
                            <div className="p-1 rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
                              <ShoppingCart className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add All To Cart Button */}
                      <button
                        onClick={() => handleAddAllToCart(msg.buildResult.products)}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer uppercase tracking-wider"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        THÊM TẤT CẢ VÀO GIỎ HÀNG
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}



            {/* Typing Loader Indicator */}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4.5 h-4.5 text-orange-500" />
                </div>
                <div className="bg-slate-900/90 border border-glass p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-3 border-t border-glass bg-slate-900/90 shrink-0">
            {!chatMode ? (
              <p className="text-center text-[11px] text-slate-400 font-medium py-1">
                Chọn một chức năng hỗ trợ ở trên để bắt đầu trò chuyện
              </p>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
                <input
                  type="text"
                  placeholder={
                    chatMode === 'pc_build'
                      ? 'VD: 15 triệu chơi mượt GTA V...'
                      : selectedLaptop
                        ? `Nhập sự cố của ${selectedLaptop.name}...`
                        : 'Gõ tên Laptop + sự cố (VD: Dell XPS 15 bị nóng máy...)'
                  }
                  className="w-full bg-slate-950 border border-glass text-xs text-slate-100 px-4 py-3 pr-11 rounded-2xl outline-none focus:border-orange-500/60 transition-all disabled:opacity-50 font-medium placeholder:text-slate-500"
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  disabled={isInputDisabled}
                />
                <button
                  type="submit"
                  disabled={isInputDisabled || !inputMsg.trim()}
                  className="absolute right-1.5 text-white bg-gradient-to-tr from-orange-500 to-amber-500 p-2 hover:scale-105 rounded-xl transition-all disabled:opacity-0 shadow-md shadow-orange-500/30 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

