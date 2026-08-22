import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, User, MapPin, CreditCard, QrCode, Copy, Check, CheckCircle, Hourglass, Loader, ShieldCheck } from 'lucide-react';
import { useCart } from "../context/CartContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import api, { getImageUrl } from "../api/axios";

const fmt = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price) || 0);

export default function Checkout({ onCheckoutSuccess }) {
  const { cartItems, totalValue: contextTotalValue, clearCart } = useCart();
  const { user, isAuthenticated } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const totalValue = contextTotalValue ?? cartItems.reduce((acc, i) => acc + ((i.product?.price || 0) * i.quantity), 0);
  const depositAmount = Math.ceil(totalValue * 0.3 / 1000) * 1000;

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone_number || '',
    email: user?.email || '',
    address: '',
    city: '',
    note: '',
    payment_method: 'SEPAY_30',
  });

  const [paymentConfig, setPaymentConfig] = useState({
    bank_bin: 'MBBank',
    bank_account: '0799412960',
    bank_account_name: 'Vua Linh Kiện'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PENDING');

  useEffect(() => {
    // Fetch bank config from server
    api.get('/payment/config')
      .then(res => {
        setPaymentConfig(res.data);
      })
      .catch(err => {
        console.error("Lỗi khi load cấu hình thanh toán:", err);
      });
  }, []);

  // Sync thông tin user khi load xong auth
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        full_name: user.full_name || prev.full_name,
        phone: user.phone_number || prev.phone,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setLoading(true);
    setError('');

    const payload = {
      user_email: form.email,
      shipping_name: form.full_name,
      shipping_phone: form.phone,
      shipping_email: form.email,
      shipping_address: `${form.address}, ${form.city}`,
      note: form.note,
      payment_method: form.payment_method,
      items: cartItems.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await api.post('/orders/checkout', payload);
      setSuccess({...res.data, payment_method: form.payment_method});
      // Clear cart
      clearCart();
      onCheckoutSuccess?.();
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
    setLoading(false);
  };

  // Logic Polling Payment Status liên tục kiểm tra nếu hình thức thanh toán là SEPAY
  useEffect(() => {
    let intervalId;
    if (success && success.payment_method.startsWith('SEPAY') && !['PAID', 'DEPOSITED'].includes(paymentStatus)) {
        intervalId = setInterval(async () => {
            try {
                const res = await api.get(`/orders/${success.order_id}/status`);
                const data = res.data;
                if (data.payment_status === 'PAID' || data.payment_status === 'DEPOSITED') {
                    setPaymentStatus(data.payment_status);
                    clearInterval(intervalId);
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 3000); // 3 giây quét 1 lần
    }
    return () => clearInterval(intervalId);
  }, [success, paymentStatus]);

  // Màn hình thành công
  if (success) {
    const isVietQR = success.payment_method.startsWith('SEPAY') && !['PAID', 'DEPOSITED'].includes(paymentStatus);
    
    const BANK_BIN = paymentConfig.bank_bin || 'MBBank';
    const BANK_ACCOUNT = paymentConfig.bank_account || '0799412960';
    const BANK_ACCOUNT_NAME = paymentConfig.bank_account_name || 'Vua Linh Kiện';
    
    const depositToPay = Math.ceil((success.total_amount || 0) * 0.3 / 1000) * 1000;
    const amountToPay = success.payment_method === 'SEPAY_30' ? depositToPay : (success.total_amount || 0);
    const vietQrUrl = `https://qr.sepay.vn/img?acc=${BANK_ACCOUNT}&bank=${BANK_BIN}&amount=${amountToPay}&des=VLK${success.order_id}`;

    return (
      <div className="min-h-[85vh] flex items-center justify-center p-3 md:p-6">
        <div className="bg-slate-950/95 border border-glass rounded-3xl shadow-2xl p-5 md:p-6 max-w-3xl w-full animate-in zoom-in-95 duration-500 relative overflow-hidden backdrop-blur-xl">
          {/* Background Ambient Glowing Orbs */}
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          {isVietQR ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                  {/* CỘT BÊN TRÁI: HEADER + MÃ QR CODE + STATUS */}
                  <div className="space-y-3.5 text-center flex flex-col items-center justify-center">
                      {/* Header Badge */}
                      <div className="w-full flex items-center justify-between border-b border-glass pb-3">
                        <div className="flex items-center gap-2.5 text-left">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 p-0.5 shadow-md shadow-orange-500/20 flex items-center justify-center">
                            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                              <QrCode className="w-4.5 h-4.5 text-orange-500" />
                            </div>
                          </div>
                          <div>
                            <h2 className="text-sm font-heading font-black text-white leading-tight">Thanh Toán VietQR</h2>
                            <p className="text-slate-400 text-[10px] font-medium">Gạch nợ ngân hàng tự động 24/7</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                          Live Sync
                        </span>
                      </div>

                      {/* QR Frame Compact */}
                      <div className="bg-slate-900/90 p-3 rounded-2xl border border-glass shadow-inner text-center relative overflow-hidden group w-full max-w-[240px]">
                          <div className="bg-white p-2 rounded-xl shadow-lg relative inline-block overflow-hidden border border-orange-500/30">
                              {/* Laser Scan Line Effect */}
                              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-[1px] z-10 animate-[scan_2.5s_ease-in-out_infinite]" />
                              <img src={vietQrUrl} alt="Mã VietQR" className="w-40 h-40 md:w-44 md:h-44 object-contain rounded-lg" />
                          </div>
                          <p className="text-slate-400 text-[10px] font-medium mt-2">
                            Quét bằng App Ngân hàng / Momo
                          </p>
                      </div>

                      {/* Status Radar Indicator */}
                      <div className="w-full flex items-center justify-center gap-2.5 text-xs font-bold text-slate-300 bg-slate-900/80 border border-glass shadow-sm px-3.5 py-2.5 rounded-xl">
                          <div className="relative flex items-center justify-center">
                            <Hourglass className="w-3.5 h-3.5 text-orange-500 animate-spin z-10" />
                            <div className="absolute w-5 h-5 bg-orange-500/20 rounded-full animate-ping" />
                          </div>
                          <span className="text-[11px]">Đang chờ gạch nợ tự động...</span>
                      </div>
                  </div>

                  {/* CỘT BÊN PHẢI: BẢNG SỐ TIỀN + THÔNG TIN CHUYỂN KHOẢN */}
                  <div className="space-y-3">
                      {/* Amount Banner */}
                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3.5 rounded-2xl shadow-lg shadow-orange-500/20 border border-orange-400/40 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-15">
                           <CreditCard className="w-20 h-20" />
                        </div>
                        <p className="text-orange-100 text-[9px] uppercase tracking-wider font-extrabold mb-0.5 relative z-10">
                          Số Tiền Cần Chuyển {success.payment_method === 'SEPAY_30' ? '(Cọc 30%)' : '(100%)'}
                        </p>
                        <p className="text-xl md:text-2xl font-heading font-black relative z-10 tracking-tight text-glow-orange">
                          {fmt(amountToPay)}
                        </p>
                        {success.payment_method === 'SEPAY_30' && (
                            <div className="mt-1.5 border-t border-orange-400/30 pt-1 flex justify-between items-center text-[10px] text-orange-100 relative z-10">
                              <span>Còn lại thu COD:</span>
                              <strong className="text-white font-black">{fmt(success.total_amount - amountToPay)}</strong>
                            </div>
                        )}
                      </div>
                      
                      {/* Credentials Card */}
                      <div className="bg-slate-900/80 rounded-2xl border border-glass p-3.5 text-left space-y-2.5 shadow-inner">
                        <div className="flex justify-between items-center pb-1.5 border-b border-glass text-xs">
                          <span className="text-slate-400 font-medium text-[11px]">Ngân hàng:</span>
                          <strong className="text-slate-200 font-bold text-[11px] flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            {BANK_BIN}
                          </strong>
                        </div>

                        <div className="flex justify-between items-center pb-1.5 border-b border-glass text-xs">
                          <span className="text-slate-400 font-medium text-[11px]">Chủ tài khoản:</span>
                          <strong className="text-slate-200 uppercase font-black text-[11px]">{BANK_ACCOUNT_NAME}</strong>
                        </div>

                        <div className="space-y-1.5 pt-0.5">
                          <div className="flex justify-between items-center text-xs bg-slate-950 p-2 border border-glass rounded-xl">
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-bold block">Số tài khoản</span>
                              <span className="font-mono font-black text-slate-100 text-xs tracking-wider">{BANK_ACCOUNT}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => handleCopy(BANK_ACCOUNT, 'acc')} 
                              className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold active:scale-95"
                            >
                              {copied === 'acc' ? <><Check className="w-3 h-3 text-green-400" /> Đã chép!</> : <><Copy className="w-3 h-3" /> Sao chép</>}
                            </button>
                          </div>

                          <div className="flex justify-between items-center text-xs bg-blue-500/10 border border-blue-500/30 p-2 border-glass rounded-xl">
                            <div>
                              <span className="text-[9px] text-blue-400 uppercase font-bold block">Nội dung chuyển khoản</span>
                              <span className="font-mono font-black text-blue-300 text-sm tracking-wider">VLK{success.order_id}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => handleCopy(`VLK${success.order_id}`, 'content')} 
                              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/40 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold active:scale-95"
                            >
                              {copied === 'content' ? <><Check className="w-3 h-3 text-green-400" /> Đã chép!</> : <><Copy className="w-3 h-3" /> Sao chép</>}
                            </button>
                          </div>
                        </div>

                        <p className="text-[9px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-center leading-normal">
                          ⚠️ Nhập chuẩn <strong className="underline decoration-amber-400">VLK{success.order_id}</strong> để gạch nợ tự động.
                        </p>
                      </div>
                  </div>
              </div>
          ) : (
              // Màn hình Đã Thanh Toán / COD an toàn
              <div className="mb-6 pt-4 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-green-500/20 relative">
                    <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-heading font-black text-slate-100 mb-2">
                    {paymentStatus === 'PAID' ? "Thanh Toán Thành Công!" : "Đặt Hàng Thành Công!"}
                </h2>
                <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                    Cảm ơn bạn đã mua sắm tại Vua Linh Kiện. Đơn hàng đã được lưu vào hệ thống.
                </p>

                {/* Receipt Card */}
                <div className="bg-slate-900/80 rounded-2xl p-5 border border-glass text-left relative overflow-hidden shadow-inner space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-dashed border-glass">
                        <span className="text-slate-400 text-xs font-medium">Mã đơn hàng</span>
                        <span className="font-bold text-slate-200 font-mono text-sm bg-slate-950 px-2.5 py-1 rounded-lg border border-glass">
                            VLK{success.order_id}
                        </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-dashed border-glass">
                        <span className="text-slate-400 text-xs font-medium">Phương thức</span>
                        <span className="font-bold text-slate-300 text-xs">
                            {success.payment_method === 'SEPAY_30' ? 'Cọc 30% (VietQR)' : 
                             success.payment_method === 'SEPAY_100' ? 'Chuyển khoản 100%' : 'Thanh toán COD'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-slate-400 text-xs font-medium">Tổng giá trị đơn</span>
                        <span className="font-heading font-black text-xl text-[var(--color-brand)] text-glow-orange">{fmt(success.total_amount)}</span>
                    </div>
                </div>
                
                <div className="mt-5 bg-blue-500/10 text-blue-300 text-[11px] p-3.5 rounded-xl border border-blue-500/20 flex items-start gap-2.5 text-left leading-relaxed">
                    <div className="shrink-0 text-base">📩</div>
                    <p>Hóa đơn điện tử và xác nhận đã được tự động gửi tới email <strong className="text-white">{success.user_email || form.email}</strong>.</p>
                </div>
              </div>
          )}

          {(!isVietQR) && (
              <div className="flex gap-3 mt-6 animate-in fade-in duration-500">
                <Link
                  to="/"
                  className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-glass font-bold rounded-2xl text-xs transition-all hover:scale-[1.02] active:scale-[0.98] text-center flex items-center justify-center cursor-pointer"
                >
                  Trang chủ
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/profile?tab=orders"
                    className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] text-center flex items-center justify-center cursor-pointer"
                  >
                    Xem Đơn Hàng
                  </Link>
                )}
              </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-8">
        <Link to="/" className="hover:text-[var(--color-brand)] flex items-center gap-1 font-semibold transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Cửa hàng
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-200">Thanh Toán</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* FORM THÔNG TIN */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin người nhận */}
            <div className="bg-glass border border-glass rounded-2xl shadow-xl p-6">
              <h2 className="font-heading font-black text-slate-200 text-base mb-5 flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-[var(--color-brand)]" />
                Thông Tin Người Nhận
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Họ và Tên *
                  </label>
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-900 border border-glass rounded-xl px-4 py-3 text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Số Điện Thoại *
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    type="tel"
                    className="w-full bg-slate-900 border border-glass rounded-xl px-4 py-3 text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                    placeholder="0901234567"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Email *
                  </label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    type="email"
                    className="w-full bg-slate-900 border border-glass rounded-xl px-4 py-3 text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Địa chỉ giao hàng */}
            <div className="bg-glass border border-glass rounded-2xl shadow-xl p-6">
              <h2 className="font-heading font-black text-slate-200 text-base mb-5 flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-[var(--color-brand)]" />
                Địa Chỉ Giao Hàng
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Địa chỉ cụ thể *
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-900 border border-glass rounded-xl px-4 py-3 text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                    placeholder="Số nhà, tên đường, phường/xã..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Tỉnh / Thành phố *
                  </label>
                  <select
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-900 border border-glass rounded-xl px-4 py-3 text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                  >
                    <option value="" className="bg-slate-950">-- Chọn tỉnh thành --</option>
                    {['Hà Nội','TP. Hồ Chí Minh','Đà Nẵng','Cần Thơ','Hải Phòng','Bình Dương','Đồng Nai',
                      'An Giang','Bà Rịa - Vũng Tàu','Bắc Giang','Bắc Kạn','Bạc Liêu','Bắc Ninh',
                      'Bến Tre','Bình Định','Bình Phước','Bình Thuận','Cà Mau','Cao Bằng','Đắk Lắk',
                      'Đắk Nông','Điện Biên','Đồng Tháp','Gia Lai','Hà Giang','Hà Nam','Hà Tĩnh',
                      'Hải Dương','Hậu Giang','Hòa Bình','Hưng Yên','Khánh Hòa','Kiên Giang',
                      'Kon Tum','Lai Châu','Lâm Đồng','Lạng Sơn','Lào Cai','Long An','Nam Định',
                      'Nghệ An','Ninh Bình','Ninh Thuận','Phú Thọ','Phú Yên','Quảng Bình','Quảng Nam',
                      'Quảng Ngãi','Quảng Ninh','Quảng Trị','Sóc Trăng','Sơn La','Tây Ninh',
                      'Thái Bình','Thái Nguyên','Thanh Hóa','Thừa Thiên Huế','Tiền Giang','Trà Vinh',
                      'Tuyên Quang','Vĩnh Long','Vĩnh Phúc','Yên Bái'].map(c => (
                      <option key={c} value={c} className="bg-slate-950">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Ghi chú cho người giao hàng
                  </label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-slate-900 border border-glass rounded-xl px-4 py-3 text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all resize-none"
                    placeholder="Giao giờ hành chính, gọi trước khi giao..."
                  />
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-glass border border-glass rounded-2xl shadow-xl p-6">
              <h2 className="font-heading font-black text-slate-200 text-base mb-5 flex items-center gap-2">
                <ShoppingBag className="w-4.5 h-4.5 text-[var(--color-brand)]" />
                Phương Thức Thanh Toán
              </h2>
              <div className="space-y-3">
                <label className={`flex items-start gap-3.5 p-4 border rounded-xl cursor-pointer transition-colors ${form.payment_method === 'SEPAY_30' ? 'border-orange-500 bg-orange-500/5' : 'border-glass hover:bg-white/5'}`}>
                  <input type="radio" name="payment_method" value="SEPAY_30" checked={form.payment_method === 'SEPAY_30'} onChange={handleChange} className="w-4.5 h-4.5 text-orange-500 accent-orange-500 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200 text-xs block leading-tight">Chuyển khoản Đặt cọc 30% (Khuyên dùng)</span>
                    <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed">Thanh toán 70% còn lại bằng tiền mặt khi nhận hàng (COD). Quét mã VietQR tự động xác nhận.</span>
                  </div>
                </label>
                <label className={`flex items-start gap-3.5 p-4 border rounded-xl cursor-pointer transition-colors ${form.payment_method === 'SEPAY_100' ? 'border-orange-500 bg-orange-500/5' : 'border-glass hover:bg-white/5'}`}>
                  <input type="radio" name="payment_method" value="SEPAY_100" checked={form.payment_method === 'SEPAY_100'} onChange={handleChange} className="w-4.5 h-4.5 text-orange-500 accent-orange-500 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200 text-xs block leading-tight">Chuyển khoản Toàn bộ 100%</span>
                    <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed">Thanh toán dứt điểm giá trị hóa đơn qua mã VietQR, không cần chuẩn bị tiền lẻ khi nhận hàng.</span>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-xs font-bold leading-normal">
                ⚠️ {error}
              </div>
            )}

            <div className="bg-orange-500/10 text-orange-400 p-4 rounded-xl border border-orange-500/15 text-xs leading-relaxed">
                <strong>Chính sách mua hàng: </strong> 
                Theo quy định của Vua Linh Kiện, để hạn chế rủi ro quý khách cần hoàn tất việc chuyển khoản trên hệ thống. 
                Trong trường hợp quý khách đặt nhưng <strong>từ chối nhận hàng</strong>, chúng tôi sẽ tiến hành Cấn trừ phí Dịch vụ đóng gói và Phí vận chuyển 2 chiều, sau đó hoàn lại tiền dư vào cuối tháng.
            </div>

            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-40 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:border-glass border border-transparent cursor-pointer flex items-center justify-center gap-3 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <><Loader className="w-4.5 h-4.5 animate-spin" /> Đang xử lý...</>
              ) : (
                <><ShoppingBag className="w-4.5 h-4.5" /> XÁC NHẬN ĐẶT HÀNG — {fmt(totalValue)}</>
              )}
            </button>
          </form>
        </div>

        {/* ĐƠN HÀNG TÓM TẮT */}
        <div className="lg:col-span-2">
          <div className="bg-glass border border-glass rounded-2xl shadow-xl sticky top-24 overflow-hidden">
            <div className="p-5 bg-slate-900/40 border-b border-glass">
              <h2 className="font-heading font-black text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4.5 h-4.5 text-[var(--color-brand)]" />
                Đơn Hàng ({cartItems.length} sản phẩm)
              </h2>
            </div>
            <div className="divide-y divide-glass max-h-80 overflow-y-auto bg-slate-950/20">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 p-4 items-center">
                  <img
                    src={getImageUrl(item.product.image)}
                    alt={item.product.name}
                    className="w-12 h-12 object-contain bg-white rounded-lg border border-glass p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug">
                      {item.product.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">x{item.quantity}</p>
                  </div>
                  <p className="text-xs font-black text-[var(--color-brand)] shrink-0 text-glow-orange">
                    {fmt(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-glass space-y-3 bg-slate-900/10">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Tạm tính</span>
                <span className="font-bold text-slate-200">{fmt(totalValue)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Phí giao hàng</span>
                <span className="font-bold text-green-400">Miễn phí</span>
              </div>
              <div className="pt-3 border-t border-glass flex justify-between items-end">
                <span className="font-black text-slate-300 text-xs uppercase tracking-wider">Tổng cộng</span>
                <span className="font-heading font-black text-xl text-[var(--color-brand)] text-glow-orange">{fmt(totalValue)}</span>
              </div>
              {form.payment_method === 'SEPAY_30' && (
                  <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/25 flex justify-between items-center animate-in fade-in">
                      <span className="text-xs font-bold text-orange-400">Phải cọc trước (30%):</span>
                      <span className="font-heading font-black text-base text-orange-400 text-glow-orange">{fmt(depositAmount)}</span>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
