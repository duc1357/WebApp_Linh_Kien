import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Phone, Lock, Eye, EyeOff, Save, Loader2, CheckCircle, AlertCircle, ShoppingBag, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { AuthContext } from "../context/AuthContext.jsx";
import api, { getImageUrl } from "../api/axios";

const fmt = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const STATUS_CONFIG = {
  PENDING:    { label: 'Chờ xác nhận', color: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  PROCESSING: { label: 'Đã cọc 30% / Đang xử lý', color: 'text-purple-400 bg-purple-500/10 border-purple-500/25' },
  DEPOSITED:  { label: 'Đã cọc 30%', color: 'text-purple-400 bg-purple-500/10 border-purple-500/25' },
  PAID:       { label: 'Đã thanh toán', color: 'text-blue-400 bg-blue-500/10 border-blue-500/25' },
  SHIPPED:    { label: 'Đang giao hàng', color: 'text-teal-400 bg-teal-500/10 border-teal-500/25' },
  DELIVERED:  { label: 'Đã giao thành công', color: 'text-green-400 bg-green-500/10 border-green-500/25' },
  CANCELLED:  { label: 'Đã hủy', color: 'text-red-400 bg-red-500/10 border-red-500/25' },
};

function Alert({ type, message }) {
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm ${isSuccess ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
      {isSuccess ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {message}
    </div>
  );
}

function InfoTab({ user, onUpdate }) {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', msg: '' });
    try {
      const res = await api.put('/user/profile', { full_name: fullName, phone_number: phone });
      onUpdate(res.data);
      setFeedback({ type: 'success', msg: 'Cập nhật thông tin thành công!' });
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.detail || 'Cập nhật thất bại!' });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Alert type={feedback.type} message={feedback.msg} />
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Email (không thể thay đổi)</label>
        <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-3 bg-slate-950/40 border border-glass rounded-xl text-slate-500 font-medium cursor-not-allowed" />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Họ và tên</label>
        <div className="relative">
          <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Nhập họ và tên" className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-glass rounded-xl outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all font-medium text-slate-200 text-sm" value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Số điện thoại</label>
        <div className="relative">
          <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          <input type="tel" placeholder="Nhập số điện thoại" className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-glass rounded-xl outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all font-medium text-slate-200 text-sm" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
      </div>
      <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer text-xs">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" />LƯU THAY ĐỔI</>}
      </button>
    </form>
  );
}

function PasswordTab() {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', msg: '' });
    if (newPw.length < 8) return setFeedback({ type: 'error', msg: 'Mật khẩu mới phải có ít nhất 8 ký tự!' });
    if (newPw === oldPw) return setFeedback({ type: 'error', msg: 'Mật khẩu mới phải khác mật khẩu hiện tại!' });
    if (newPw !== confirmPw) return setFeedback({ type: 'error', msg: 'Xác nhận mật khẩu không khớp!' });
    setLoading(true);
    try {
      await api.put('/user/change-password', { old_password: oldPw, new_password: newPw });
      setFeedback({ type: 'success', msg: 'Đổi mật khẩu thành công!' });
      setOldPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.detail || 'Đổi mật khẩu thất bại!' });
    }
    setLoading(false);
  };

  const inputClass = "w-full pl-10 pr-11 py-3 bg-slate-900 border border-glass rounded-xl outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all font-medium text-slate-200 text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert type={feedback.type} message={feedback.msg} />
      {[
        { label: 'Mật khẩu hiện tại', value: oldPw, onChange: setOldPw, placeholder: 'Nhập mật khẩu hiện tại' },
        { label: 'Mật khẩu mới (ít nhất 8 ký tự)', value: newPw, onChange: setNewPw, placeholder: 'Nhập mật khẩu mới' },
        { label: 'Xác nhận mật khẩu mới', value: confirmPw, onChange: setConfirmPw, placeholder: 'Nhập lại mật khẩu mới' },
      ].map(({ label, value, onChange, placeholder }) => (
        <div key={label}>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input type={showPw ? 'text' : 'password'} placeholder={placeholder} required className={inputClass} value={value} onChange={e => onChange(e.target.value)} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ))}
      <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer text-xs">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ĐỔI MẬT KHẨU'}
      </button>
    </form>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.get('/user/orders')
      .then(res => { setOrders(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map(n => <div key={n} className="h-20 bg-glass border border-glass rounded-xl animate-pulse" />)}
    </div>
  );

  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-500">
      <ShoppingBag className="w-16 h-16 opacity-20" />
      <p className="font-semibold text-sm">Bạn chưa có đơn hàng nào.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const isExpanded = expandedId === order.id;
        const statusCfg = STATUS_CONFIG[order.status] || { label: order.status, color: 'text-slate-400 bg-white/5 border-glass' };
        return (
          <div key={order.id} className="border border-glass rounded-2xl overflow-hidden shadow-lg bg-slate-900/10 hover:border-orange-500/15 transition-all">
            {/* Header đơn hàng */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
              className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer bg-slate-900/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-[var(--color-brand)]" />
                </div>
                <div>
                  <p className="font-black text-slate-200 text-sm">Đơn hàng #{order.id}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{order.created_at}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-heading font-black text-[var(--color-brand)] text-sm text-glow-orange">{fmt(order.total_amount)}</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${statusCfg.color} uppercase tracking-wider`}>
                    {statusCfg.label}
                  </span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {/* Chi tiết sản phẩm */}
            {isExpanded && (
              <div className="border-t border-glass bg-slate-950/40 px-4 py-3 animate-in slide-in-from-top-2 duration-200">
                {order.shipping_address && (
                  <p className="text-xs text-slate-400 mb-3 font-semibold">
                    📍 {order.shipping_address}
                  </p>
                )}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-900/30 rounded-xl p-3 border border-glass">
                      {item.product_image && (
                        <img src={getImageUrl(item.product_image)} alt={item.product_name} className="w-12 h-12 object-contain bg-white rounded-lg border border-glass p-1 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-200 line-clamp-1 leading-snug">{item.product_name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">x{item.quantity} × {fmt(item.price_at_purchase)}</p>
                      </div>
                      <p className="text-xs font-black text-[var(--color-brand)] shrink-0 text-glow-orange">
                        {fmt(item.price_at_purchase * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Profile() {
  const { user, login } = useContext(AuthContext);
  const location = useLocation();

  // Đọc ?tab=orders từ URL (link từ trang checkout success)
  const urlParams = new URLSearchParams(location.search);
  const defaultTab = urlParams.get('tab') === 'orders' ? 'orders' : 'info';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleUserUpdate = (updatedUser) => {
    const token = localStorage.getItem('token');
    login(token, updatedUser);
  };

  const tabs = [
    { key: 'info',     label: '👤 Thông tin cá nhân' },
    { key: 'orders',   label: '📦 Đơn hàng của tôi' },
    { key: 'password', label: '🔑 Đổi mật khẩu' },
  ];

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header card */}
        <div className="bg-glass border border-glass rounded-2xl p-6 mb-6 flex items-center gap-4 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-orange-500/20">
            {user?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="relative z-10">
            <h1 className="text-lg font-heading font-black tracking-tight">{user?.full_name}</h1>
            <p className="text-slate-400 text-xs mt-0.5">{user?.email}</p>
            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-lg mt-2 inline-block uppercase tracking-wider border ${user?.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-800 text-slate-300 border-glass'}`}>
              {user?.role === 'admin' ? '👑 Admin' : '👤 Khách hàng'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-glass border border-glass rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-glass overflow-x-auto bg-slate-900/15">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-4 text-xs font-black transition-all whitespace-nowrap px-2 cursor-pointer border-b-2 ${activeTab === tab.key ? 'text-[var(--color-brand)] border-[var(--color-brand)] text-glow-orange bg-orange-500/5' : 'text-slate-500 border-transparent hover:text-slate-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6 bg-slate-950/20">
            {activeTab === 'info'     && <InfoTab user={user} onUpdate={handleUserUpdate} />}
            {activeTab === 'orders'   && <OrdersTab />}
            {activeTab === 'password' && <PasswordTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
