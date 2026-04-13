import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Phone, Lock, Eye, EyeOff, Save, Loader2, CheckCircle, AlertCircle, ShoppingBag, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { AuthContext } from "../context/AuthContext.jsx";
import api from "../api/axios";

const fmt = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const STATUS_CONFIG = {
  PENDING:   { label: 'Chờ xác nhận', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  PAID:      { label: 'Đã thanh toán', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  SHIPPED:   { label: 'Đang giao hàng', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  DELIVERED: { label: 'Đã giao', color: 'text-green-700 bg-green-50 border-green-200' },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-700 bg-red-50 border-red-200' },
};

function Alert({ type, message }) {
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm ${isSuccess ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
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
        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Email (không thể thay đổi)</label>
        <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-400 font-medium cursor-not-allowed" />
      </div>
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Họ và tên</label>
        <div className="relative">
          <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Nhập họ và tên" className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all font-medium text-slate-700" value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Số điện thoại</label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input type="tel" placeholder="Nhập số điện thoại" className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all font-medium text-slate-700" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
      </div>
      <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white font-black py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" />LƯU THAY ĐỔI</>}
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

  const inputClass = "w-full pl-11 pr-11 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all font-medium text-slate-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert type={feedback.type} message={feedback.msg} />
      {[
        { label: 'Mật khẩu hiện tại', value: oldPw, onChange: setOldPw, placeholder: 'Nhập mật khẩu hiện tại' },
        { label: 'Mật khẩu mới (ít nhất 8 ký tự)', value: newPw, onChange: setNewPw, placeholder: 'Nhập mật khẩu mới' },
        { label: 'Xác nhận mật khẩu mới', value: confirmPw, onChange: setConfirmPw, placeholder: 'Nhập lại mật khẩu mới' },
      ].map(({ label, value, onChange, placeholder }) => (
        <div key={label}>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input type={showPw ? 'text' : 'password'} placeholder={placeholder} required className={inputClass} value={value} onChange={e => onChange(e.target.value)} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer">
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      ))}
      <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white font-black py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ĐỔI MẬT KHẨU'}
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
      {[1,2,3].map(n => <div key={n} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
    </div>
  );

  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
      <ShoppingBag className="w-16 h-16 opacity-20" />
      <p className="font-semibold">Bạn chưa có đơn hàng nào.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const isExpanded = expandedId === order.id;
        const statusCfg = STATUS_CONFIG[order.status] || { label: order.status, color: 'text-slate-600 bg-slate-50 border-slate-200' };
        return (
          <div key={order.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header đơn hàng */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
              className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-[var(--color-brand)]" />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm">Đơn hàng #{order.id}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{order.created_at}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-black text-[var(--color-brand)] text-sm">{fmt(order.total_amount)}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {/* Chi tiết sản phẩm */}
            {isExpanded && (
              <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 animate-in slide-in-from-top-2 duration-200">
                {order.shipping_address && (
                  <p className="text-xs text-slate-500 mb-3 font-medium">
                    📍 {order.shipping_address}
                  </p>
                )}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-100">
                      {item.product_image && (
                        <img src={item.product_image} alt={item.product_name} className="w-12 h-12 object-contain bg-slate-50 rounded-lg border border-slate-100 p-1 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.product_name}</p>
                        <p className="text-xs text-slate-400">x{item.quantity} × {fmt(item.price_at_purchase)}</p>
                      </div>
                      <p className="text-sm font-black text-[var(--color-brand)] shrink-0">
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
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header card */}
        <div className="bg-slate-900 rounded-2xl p-6 mb-6 flex items-center gap-4 text-white shadow-xl">
          <div className="w-16 h-16 bg-[var(--color-brand)] rounded-full flex items-center justify-center text-3xl font-black shadow-lg">
            {user?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">{user?.full_name}</h1>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${user?.role === 'admin' ? 'bg-amber-500 text-amber-950' : 'bg-slate-700 text-slate-300'}`}>
              {user?.role === 'admin' ? '👑 Admin' : '👤 Khách hàng'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-4 text-sm font-black transition-colors whitespace-nowrap px-2 cursor-pointer ${activeTab === tab.key ? 'text-[var(--color-brand)] border-b-2 border-[var(--color-brand)]' : 'text-slate-400 hover:text-slate-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'info'     && <InfoTab user={user} onUpdate={handleUserUpdate} />}
            {activeTab === 'orders'   && <OrdersTab />}
            {activeTab === 'password' && <PasswordTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
