import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, User, Mail, Phone, CheckCircle, ArrowLeft, Loader, QrCode, Hourglass } from 'lucide-react';
import { AuthContext } from "../context/AuthContext.jsx";

const fmt = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function Checkout({ cartItems, onCheckoutSuccess }) {
  const { user, isAuthenticated } = useContext(AuthContext);


  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    address: '',
    city: '',
    note: '',
    payment_method: 'SEPAY_30',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('UNPAID');

  const totalValue = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const depositAmount = Math.ceil(totalValue * 0.3 / 1000) * 1000;

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address || !form.city) {
      setError('Vui lòng nhập đầy đủ địa chỉ giao hàng!');
      return;
    }
    if (cartItems.length === 0) {
      setError('Giỏ hàng đang trống!');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      user_email: form.email || 'guest@guest.com',
      shipping_address: `${form.address}, ${form.city}`,
      payment_method: form.payment_method,
      items: cartItems.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Đặt hàng thất bại!');
      setSuccess({...data, payment_method: form.payment_method});
      // Clear cart
      onCheckoutSuccess?.();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Logic Polling Payment Status liên tục kiểm tra nếu hình thức thanh toán là SEPAY
  useEffect(() => {
    let intervalId;
    if (success && success.payment_method.startsWith('SEPAY') && !['PAID', 'DEPOSITED'].includes(paymentStatus)) {
        intervalId = setInterval(async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/orders/${success.order_id}/status`);
                const data = await res.json();
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
    
    // Cấu hình ngân hàng đích của bạn
    const BANK_BIN = "MBBank"; // Ví dụ: MBBank, Vietcombank, Techcombank, MoMo
    const BANK_ACCOUNT = "0799412960"; // STK nhận
    
    const amountToPay = success.payment_method === 'SEPAY_30' ? Math.ceil(success.total_amount * 0.3 / 1000) * 1000 : success.total_amount;
    const vietQrUrl = `https://qr.sepay.vn/img?acc=${BANK_ACCOUNT}&bank=${BANK_BIN}&amount=${amountToPay}&des=VLK${success.order_id}`;

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 max-w-md w-full text-center animate-in zoom-in duration-500">
          
          {isVietQR ? (
              <div className="mb-6 space-y-4">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <QrCode className="w-10 h-10 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">Quét Mã VietQR</h2>
                  <p className="text-slate-500 text-sm">Sử dụng App Ngân Hàng / Momo để quét mã. Tự động xác nhận sau 3 giây.</p>
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-orange-200">
                      <img src={vietQrUrl} alt="VietQR" className="w-full h-auto rounded-xl shadow-sm bg-white" />
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-xl">
                      <Hourglass className="w-4 h-4 animate-spin" /> Đang chờ thanh toán...
                  </div>
              </div>
          ) : (
              // Màn hình Đã Thanh Toán / COD an toàn
              <div className="mb-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-14 h-14 text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">
                    {paymentStatus === 'PAID' ? "Đã Thu Tiền!" : "Đặt Hàng Thành Công!"}
                </h2>
                <p className="text-slate-500 text-sm mb-4">
                    Cảm ơn bạn đã mua sắm tại Vua Linh Kiện!
                </p>
              </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Mã đơn hàng</span>
              <span className="font-black text-slate-800">#{success.order_id}</span>
            </div>
            {isVietQR && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Nội dung CK <span className="text-[10px] text-red-500 font-normal">(Bắt buộc)</span></span>
                  <span className="font-mono font-black text-blue-600 tracking-widest bg-blue-50 px-2 py-0.5 rounded">VLK{success.order_id}</span>
                </div>
            )}
            <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
              <span className="text-slate-500">Tổng giá trị đơn hàng</span>
              <span className={success.payment_method === 'SEPAY_30' ? "font-bold text-slate-400 line-through" : "font-black text-slate-800"}>
                {fmt(success.total_amount)}
              </span>
            </div>
            
            {success.payment_method === 'SEPAY_30' && (
              <>
                <div className="flex justify-between items-center text-sm bg-orange-50/50 p-2 rounded-lg border border-orange-100">
                  <span className="font-semibold text-orange-700">Cần thanh toán Đặt cọc (30%)</span>
                  <span className="font-black text-xl text-orange-600">{fmt(amountToPay)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Còn lại (Thu COD khi nhận hàng)</span>
                  <span className="font-bold text-slate-800">{fmt(success.total_amount - amountToPay)}</span>
                </div>
              </>
            )}

            {success.payment_method === 'SEPAY_100' && (
              <div className="flex justify-between items-center text-sm bg-orange-50/50 p-2 rounded-lg border border-orange-100">
                <span className="font-semibold text-orange-700">Cần thanh toán Toàn bộ (100%)</span>
                <span className="font-black text-xl text-orange-600">{fmt(amountToPay)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
              <span className="text-slate-500">Trạng thái</span>
              {['PAID', 'DEPOSITED'].includes(paymentStatus) ? (
                 <span className="font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-xs">ĐÃ XÁC NHẬN (CÓ CỌC)</span>
              ) : (
                 <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs animate-pulse">CHỜ XÁC NHẬN</span>
              )}
            </div>
          </div>
          
          {(!isVietQR) && (
              <div className="flex gap-3">
                <Link
                  to="/"
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-center"
                >
                  Tiếp tục mua
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/profile?tab=orders"
                    className="flex-1 py-3 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-bold rounded-xl transition-colors text-center"
                  >
                    Xem đơn hàng
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
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link to="/" className="hover:text-[var(--color-brand)] flex items-center gap-1 font-medium">
          <ArrowLeft className="w-4 h-4" /> Cửa hàng
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-800">Thanh Toán</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* FORM THÔNG TIN */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin người nhận */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-black text-slate-800 text-lg mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-[var(--color-brand)]" />
                Thông Tin Người Nhận
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Họ và Tên *
                  </label>
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Số Điện Thoại *
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    type="tel"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                    placeholder="0901234567"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Địa chỉ giao hàng */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-black text-slate-800 text-lg mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--color-brand)]" />
                Địa Chỉ Giao Hàng
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Địa chỉ cụ thể *
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                    placeholder="Số nhà, tên đường, phường/xã..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Tỉnh / Thành phố *
                  </label>
                  <select
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all bg-white"
                  >
                    <option value="">-- Chọn tỉnh thành --</option>
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
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Ghi chú cho người giao hàng
                  </label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all resize-none"
                    placeholder="Giao giờ hành chính, gọi trước khi giao..."
                  />
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-black text-slate-800 text-lg mb-5 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[var(--color-brand)]" />
                Phương Thức Thanh Toán
              </h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${form.payment_method === 'SEPAY_30' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="payment_method" value="SEPAY_30" checked={form.payment_method === 'SEPAY_30'} onChange={handleChange} className="w-5 h-5 text-orange-500" />
                  <div>
                    <span className="font-bold text-slate-700 block">Chuyển khoản Đặt cọc 30% (Khuyên dùng)</span>
                    <span className="text-xs text-slate-500">Thanh toán 70% còn lại bằng tiền mặt khi nhận hàng (COD). Quét mã VietQR tự động xác nhận.</span>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${form.payment_method === 'SEPAY_100' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="payment_method" value="SEPAY_100" checked={form.payment_method === 'SEPAY_100'} onChange={handleChange} className="w-5 h-5 text-orange-500" />
                  <div>
                    <span className="font-bold text-slate-700 block">Chuyển khoản Toàn bộ 100%</span>
                    <span className="text-xs text-slate-500">Thanh toán dứt điểm giá trị hóa đơn qua mã VietQR, không cần chuẩn bị tiền lẻ khi nhận hàng.</span>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm font-semibold">
                ⚠️ {error}
              </div>
            )}

            <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm">
                <strong>Chính sách mua hàng: </strong> 
                Theo quy định của Vua Linh Kiện, để hạn chế rủi ro quý khách cần hoàn tất việc chuyển khoản trên hệ thống. 
                Trong trường hợp quý khách đặt nhưng <strong>từ chối nhận hàng</strong>, chúng tôi sẽ tiến hành Cấn trừ phí Dịch vụ đóng gói và Phí vận chuyển 2 chiều, sau đó hoàn lại tiền dư vào cuối tháng.
            </div>

            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className="w-full py-4 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-black text-lg rounded-2xl transition-all hover:scale-[1.01] shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
            >
              {loading ? (
                <><Loader className="w-5 h-5 animate-spin" /> Đang xử lý...</>
              ) : (
                <><ShoppingBag className="w-5 h-5" /> XÁC NHẬN ĐẶT HÀNG — {fmt(totalValue)}</>
              )}
            </button>
          </form>
        </div>

        {/* ĐƠN HÀNG TÓM TẮT */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-24 overflow-hidden">
            <div className="p-5 bg-slate-50 border-b border-slate-100">
              <h2 className="font-black text-slate-800 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[var(--color-brand)]" />
                Đơn Hàng ({cartItems.length} sản phẩm)
              </h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 p-4 items-center">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-14 h-14 object-contain bg-slate-50 rounded-lg border border-slate-100 p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-black text-[var(--color-brand)] shrink-0">
                    {fmt(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-slate-200 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tạm tính</span>
                <span className="font-semibold text-slate-800">{fmt(totalValue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Phí giao hàng</span>
                <span className="font-bold text-green-600">Miễn phí</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
                <span className="font-black text-slate-800">Tổng cộng</span>
                <span className="font-black text-2xl text-[var(--color-brand)]">{fmt(totalValue)}</span>
              </div>
              {form.payment_method === 'SEPAY_30' && (
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex justify-between items-center animate-in fade-in">
                      <span className="text-sm font-semibold text-orange-700">Phải cọc trước (30%):</span>
                      <span className="font-black text-lg text-orange-600">{fmt(depositAmount)}</span>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
