import React, { useState, useRef } from 'react';
import { Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
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
    if (!/^\d*$/.test(value)) return; // Chỉ cho phép số
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
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
        <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 relative z-10">
          {step === 3 ? <CheckCircle className="w-8 h-8 text-green-500" /> : <Mail className="w-8 h-8 text-slate-800" />}
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight relative z-10">
          {step === 1 && "QUÊN MẬT KHẨU"}
          {step === 2 && "NHẬP MÃ OTP"}
          {step === 3 && "THÀNH CÔNG"}
        </h2>
        <p className="text-slate-400 text-sm mt-1 relative z-10">
          {step === 1 && "Nhập email để nhận mã xác thực (OTP)"}
          {step === 2 && `Mã OTP đã được gửi tới ${email}`}
          {step === 3 && "Mật khẩu của bạn đã được thay đổi"}
        </p>
      </div>

      <div className="p-8 bg-slate-50">
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Email của bạn</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="email@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium text-slate-700"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white font-black py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'NHẬN MÃ OTP'}
              </button>
              <button type="button" onClick={onBack} className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors py-2">
                <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 text-center">Mã OTP (6 chữ số)</label>
                <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handleOtpPaste}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={el => otpRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-10 h-12 sm:w-12 sm:h-14 bg-white border-2 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-black text-center text-orange-600 text-xl sm:text-2xl shadow-sm"
                      value={otp[index] || ''}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Ít nhất 6 ký tự"
                    required
                    className="w-full pl-11 pr-11 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium text-slate-700"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-700">
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Xác nhận mật khẩu mới"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium text-slate-700"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ĐỔI MẬT KHẨU'}
              </button>
              
              <button type="button" onClick={() => setStep(1)} className="w-full text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors py-2">
                Dùng email khác
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <h3 className="text-lg font-bold text-slate-800">Đặt lại thành công!</h3>
              <p className="text-slate-500 text-sm">Bạn đã có thể đăng nhập bằng mật khẩu mới vừa tạo.</p>
              <button onClick={onBack} className="w-full bg-slate-900 hover:bg-black text-white font-black py-3 rounded-xl transition-all">
                ĐI ĐẾN ĐĂNG NHẬP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
