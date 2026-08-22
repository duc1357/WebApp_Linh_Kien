import React, { useState, useRef } from 'react';
import { Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle, Lock, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';
import api from "../../api/axios";

export default function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(1); // 1: Xin Email, 2: Nhập OTP & Pass mới, 3: Success
  const [email, setEmail] = useState('');
  
  // Step 2 form
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const otpRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = otp.substring(0, index) + value.slice(-1) + otp.substring(index + 1);
    setOtp(newOtp.slice(0, 6));
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      setOtp(pastedData);
      const nextIndex = Math.min(pastedData.length, 5);
      otpRefs.current[nextIndex]?.focus();
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Có lỗi xảy ra. Vui lòng thử lại!');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) return setError('Mật khẩu mới phải có tối thiểu 6 ký tự!');
    if (newPassword !== confirmPassword) return setError('Xác nhận mật khẩu không khớp!');
    if (otp.length !== 6) return setError('Mã OTP phải gồm 6 chữ số!');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { 
        email, 
        otp, 
        new_password: newPassword 
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || 'Mã OTP không hợp lệ hoặc đã hết hạn!');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-slate-950/90 border border-glass rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 backdrop-blur-xl relative">
      {/* Ambient Glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="bg-slate-900/90 p-7 text-center relative border-b border-glass overflow-hidden">
        <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30 mb-3 relative z-10 p-0.5">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            {step === 3 ? <CheckCircle className="w-7 h-7 text-green-400" /> : <KeyRound className="w-7 h-7 text-orange-500" />}
          </div>
        </div>
        <h2 className="text-xl font-heading font-black text-white tracking-tight relative z-10 flex items-center justify-center gap-2">
          {step === 1 && "KHÔI PHỤC MẬT KHẨU"}
          {step === 2 && "XÁC NHẬN MÃ OTP"}
          {step === 3 && "THÀNH CÔNG 🎉"}
        </h2>
        <p className="text-slate-400 text-[11px] font-medium mt-1 relative z-10">
          {step === 1 && "Nhập email đăng ký để nhận mã OTP khôi phục 6 chữ số"}
          {step === 2 && `Mã xác thực 6 chữ số đã được gửi tới ${email}`}
          {step === 3 && "Mật khẩu tài khoản của bạn đã đổi thành công"}
        </p>
      </div>

      <div className="p-6 bg-slate-950/60 relative z-10">
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-3 rounded-2xl border border-red-500/20 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="group">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-orange-400 transition-colors">
                  Email của bạn *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                  <input
                    type="email"
                    placeholder="email@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-glass rounded-2xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs font-medium text-slate-200 placeholder:text-slate-500 transition-all"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-heading font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-500/25 flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'GỬI MÃ OTP VỀ EMAIL'}
              </button>
              <button 
                type="button" 
                onClick={onBack} 
                className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-xs font-bold transition-colors py-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 text-center">
                  Nhập mã OTP 6 chữ số
                </label>
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={el => otpRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-10 h-12 bg-slate-900 border border-glass rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-center font-mono font-black text-orange-400 text-xl shadow-inner transition-all"
                      value={otp[index] || ''}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    />
                  ))}
                </div>
              </div>

              <div className="group">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 group-focus-within:text-orange-400 transition-colors">
                  Mật khẩu mới *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Tối thiểu 6 ký tự"
                    required
                    className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-glass rounded-2xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs font-medium text-slate-200 placeholder:text-slate-500 transition-all"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-200">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="group">
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Xác nhận lại mật khẩu mới"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-glass rounded-2xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs font-medium text-slate-200 placeholder:text-slate-500 transition-all"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-heading font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-500/25 flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'XÁC NHẬN ĐỔI MẬT KHẨU'}
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="w-full text-slate-400 hover:text-white text-xs font-medium transition-colors py-1 cursor-pointer"
              >
                Nhập lại email khác
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4 py-2">
              <h3 className="text-base font-bold text-slate-200">Đổi Mật Khẩu Thành Công!</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay bây giờ.</p>
              <button 
                onClick={onBack} 
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-heading font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-500/25 text-xs uppercase tracking-wider cursor-pointer"
              >
                ĐI TỚI TRANG ĐĂNG NHẬP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

