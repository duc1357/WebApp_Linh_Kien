import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Laptop, Search, ChevronRight, PackageCheck, Cpu, ShoppingCart, Zap } from 'lucide-react';

const USE_CASE_LABELS = {
  gaming: '🎮 Gaming',
  office: '💼 Văn phòng',
  design: '🎨 Đồ họa / Design',
  streaming: '📡 Streaming',
  general: '🖥️ Đa năng',
};

export default function FloatingChatbot({ onAddToCart }) {
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
          text: 'Xin chào! Tôi là Trợ lý AI của **VUA LINH KIỆN** 🤖\n\nTôi có thể giúp bạn điều gì hôm nay?',
          showModeSelect: true,
        },
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && chatMode === 'laptop' && laptops.length === 0) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/laptops`)
        .then(res => res.json())
        .then(data => setLaptops(data))
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
        { role: 'user', text: '🔧 Chẩn đoán Laptop' },
        { role: 'bot', text: 'Vui lòng chọn mẫu laptop của bạn bên dưới để tôi có thể hỗ trợ nhé!' },
      ]);
    } else if (mode === 'pc_build') {
      setMessages(prev => [
        ...prev,
        { role: 'user', text: '🖥️ Tư vấn Build PC' },
        {
          role: 'bot',
          text: 'Cho tôi biết **ngân sách** và **mục đích sử dụng** của bạn nhé!\n\nVí dụ:\n• "15 triệu, chơi game"\n• "20 triệu, làm đồ họa"\n• "10 triệu, văn phòng cơ bản"',
        },
      ]);
    }
  };

  const handleSelectLaptop = (lap) => {
    setSelectedLaptop(lap);
    setMessages(prev => [
      ...prev,
      { role: 'user', text: `Tôi đang dùng ${lap.name}` },
      { role: 'bot', text: `Tuyệt! Máy **${lap.name}** của bạn đang gặp vấn đề gì? (VD: chơi game bị giật, máy nóng, đầy ổ cứng...)` },
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
        // Chẩn đoán laptop
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/ai/diagnose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ laptop_id: selectedLaptop.id, issue_description: userText }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Lỗi chẩn đoán');
        setMessages(prev => [...prev, {
          role: 'bot',
          text: data.diagnosis || 'Đã nhận được phản hồi từ AI.',
          categories: data.recommended_categories || [],
        }]);

      } else if (chatMode === 'pc_build') {
        // Tư vấn build PC
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/ai/recommend-build`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requirement: userText }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Lỗi gọi AI');
        setMessages(prev => [...prev, {
          role: 'bot',
          text: data.message || 'Đây là cấu hình gợi ý từ Vua Linh Kiện!',
          buildResult: data,
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: (err instanceof Error ? err.message : null) || 'Xin lỗi, hệ thống AI đang bảo trì. Vui lòng thử lại sau!' }]);
    }

    setLoading(false);
  };

  const handleAddAllToCart = (products) => {
    products.forEach(item => onAddToCart(item.product));
  };

  const handleReset = () => {
    setChatMode(null);
    setSelectedLaptop(null);
    setSearch('');
    setMessages([{
      role: 'bot',
      text: 'Xin chào! Tôi là Trợ lý AI của **VUA LINH KIỆN** 🤖\n\nTôi có thể giúp bạn điều gì hôm nay?',
      showModeSelect: true,
    }]);
  };

  const filteredLaptops = search ? laptops.filter(l => l.name.toLowerCase().includes(search.toLowerCase())) : laptops;
  const isInputDisabled = !chatMode || (chatMode === 'laptop' && !selectedLaptop) || loading;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--color-brand)] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:shadow-orange-500/50 transition-all z-[90]"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl z-[90] flex flex-col overflow-hidden border border-slate-200">

          {/* Header */}
          <div className="bg-[var(--color-brand)] p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/20">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold tracking-tight">Trợ Lý AI Vua Linh Kiện</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <p className="text-[10px] text-orange-100 uppercase tracking-widest font-bold">Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {chatMode && (
                <button onClick={handleReset} className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded font-bold transition-colors">
                  ← Quay lại
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1 bg-white/10 hover:bg-white/20 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#f8fafc] flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-[var(--color-brand)]" />
                  </div>
                )}

                <div className={`max-w-[80%] rounded-2xl p-3 text-[13px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[var(--color-brand)] text-white rounded-tr-sm font-medium' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'}`}>
                  {/* Text với bold support - null-safe */}
                  <div>
                    {(msg.text || '').split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-1' : ''}>
                        {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                        )}
                      </p>
                    ))}
                  </div>

                  {/* Mode selection buttons */}
                  {msg.showModeSelect && (
                    <div className="mt-3 flex flex-col gap-2">
                      <button
                        onClick={() => handleSelectMode('laptop')}
                        className="flex items-center gap-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-[var(--color-brand)] rounded-lg text-xs font-bold border border-orange-200 transition-colors"
                      >
                        <Laptop className="w-4 h-4" />
                        🔧 Chẩn đoán & nâng cấp Laptop
                      </button>
                      <button
                        onClick={() => handleSelectMode('pc_build')}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-amber-400 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Cpu className="w-4 h-4" />
                        🖥️ Tư vấn Build PC theo ngân sách
                      </button>
                    </div>
                  )}

                  {/* Laptop diagnosis results */}
                  {msg.categories && msg.categories.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                      <p className="font-bold text-[10px] text-orange-500/80 uppercase tracking-wider flex items-center gap-1">
                        <PackageCheck className="w-3 h-3" /> Gợi ý linh kiện mua để khắc phục:
                      </p>
                      {msg.categories.flatMap(cat =>
                        cat.products.map((item, i) => (
                          <div key={i} onClick={() => onAddToCart(item.product)} className="flex gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 hover:border-orange-300 hover:bg-orange-50 cursor-pointer group transition-all">
                            <div className="w-10 h-10 shrink-0 bg-white rounded border border-slate-100 p-1 flex items-center justify-center">
                              <img src={item.product.image} className="max-w-full max-h-full object-contain" alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-bold text-slate-700 truncate group-hover:text-[var(--color-brand)]">{item.product.name}</div>
                              <div className="text-[11px] text-[var(--color-brand)] font-black mt-0.5">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.price)}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[var(--color-brand)] shrink-0 self-center" />
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* PC Build results */}
                  {msg.buildResult && msg.buildResult.products?.length > 0 && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-[10px] text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {USE_CASE_LABELS[msg.buildResult.use_case] || '🖥️ Cấu hình đề xuất'}
                        </p>
                        <span className="text-[10px] font-bold text-[var(--color-brand)] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(msg.buildResult.total)}
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {msg.buildResult.products.map((item, i) => (
                          <div key={i} onClick={() => onAddToCart(item.product)} className="flex gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 hover:border-orange-300 hover:bg-orange-50 cursor-pointer group transition-all">
                            <div className="w-9 h-9 shrink-0 bg-white rounded border border-slate-100 p-0.5 flex items-center justify-center">
                              <img src={item.product.image} className="max-w-full max-h-full object-contain" alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[9px] font-bold text-slate-400 uppercase">{item.category}</div>
                              <div className="text-[11px] font-bold text-slate-700 truncate group-hover:text-[var(--color-brand)] leading-tight">{item.product.name}</div>
                              <div className="text-[11px] text-[var(--color-brand)] font-black">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.price)}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add all to cart button */}
                      <button
                        onClick={() => handleAddAllToCart(msg.buildResult.products)}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white rounded-lg text-xs font-black transition-colors shadow-md shadow-orange-500/20"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        THÊM TẤT CẢ VÀO GIỎ HÀNG
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Laptop selector */}
            {chatMode === 'laptop' && !selectedLaptop && (
              <div className="bg-white border border-slate-100 rounded-xl p-3 text-sm ml-10 shadow-sm">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm mẫu laptop của bạn..."
                    className="w-full pl-9 pr-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-[var(--color-brand)]/40 font-medium"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredLaptops.length === 0 ? (
                    <p className="text-[11px] text-slate-500 text-center py-3">Đang tải danh sách...</p>
                  ) : filteredLaptops.map(l => (
                    <button
                      key={l.id}
                      onClick={() => handleSelectLaptop(l)}
                      className="w-full text-left px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-orange-50 hover:text-[var(--color-brand)] rounded-md transition-colors flex items-center gap-2 border-l-2 border-transparent hover:border-[var(--color-brand)]"
                    >
                      <Laptop className="w-3.5 h-3.5 text-slate-400" /> {l.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-[var(--color-brand)]" />
                </div>
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-100 bg-white shrink-0">
            {!chatMode ? (
              <p className="text-center text-xs text-slate-400 font-medium py-1">Chọn một chức năng ở trên để bắt đầu</p>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
                <input
                  type="text"
                  placeholder={
                    chatMode === 'pc_build'
                      ? 'VD: 20 triệu chơi game...'
                      : selectedLaptop
                        ? 'Nhập vấn đề bạn đang gặp...'
                        : 'Vui lòng chọn laptop ở trên trước!'
                  }
                  className="w-full bg-slate-100 border border-slate-200 text-sm px-4 py-3 pr-12 rounded-full outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:bg-white transition-all disabled:opacity-50 font-medium"
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  disabled={isInputDisabled}
                />
                <button
                  type="submit"
                  disabled={isInputDisabled || !inputMsg.trim()}
                  className="absolute right-2 text-white bg-[var(--color-brand)] p-1.5 hover:scale-105 rounded-full transition-transform disabled:opacity-0 shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4 ml-0.5 mt-0.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
