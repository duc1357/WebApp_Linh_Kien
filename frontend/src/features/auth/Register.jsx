import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import api from "../../api/axios";

export default function Register({ onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        full_name: '', email: '', password: '', confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (formData.password !== formData.confirmPassword) {
            return setError("Mật khẩu xác nhận không khớp!");
        }

        setLoading(true);
        try {
            await api.post('/auth/register', {
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password
            });
            setSuccessMsg("Đăng ký thành công! Bạn có thể chuyển sang Đăng Nhập.");
            setFormData({ full_name: '', email: '', password: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.detail || "Lỗi đăng ký tài khoản");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-slate-950/90 border border-glass rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 backdrop-blur-xl relative">
            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header Banner */}
            <div className="bg-slate-900/90 p-7 text-center relative border-b border-glass overflow-hidden">
                <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30 mb-3 relative z-10 p-0.5">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-heading font-black text-xl text-orange-500 text-glow-orange">
                        V
                    </div>
                </div>
                <h2 className="text-xl font-heading font-black text-white tracking-tight relative z-10 flex items-center justify-center gap-2">
                    TẠO TÀI KHOẢN MỚI
                </h2>
                <p className="text-slate-400 font-medium text-[11px] mt-1 relative z-10">
                    Trải nghiệm mua sắm & Build PC tối ưu trên Vua Linh Kiện
                </p>
            </div>

            <form onSubmit={handleRegister} className="p-6 space-y-4 bg-slate-950/60 relative z-10">
                {error && (
                    <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-xs font-bold border border-red-500/20 flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}
                {successMsg && (
                    <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl text-xs font-bold border border-emerald-500/20 flex items-center gap-2">
                        <span>🎉</span> {successMsg}
                    </div>
                )}

                <div className="group">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 group-focus-within:text-orange-400 transition-colors">
                        Họ và Tên *
                    </label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                        <input 
                            type="text" 
                            name="full_name" 
                            required 
                            value={formData.full_name} 
                            onChange={handleChange} 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-glass focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl outline-none text-xs font-medium text-slate-200 placeholder:text-slate-500 transition-all"
                            placeholder="Nguyễn Văn A" 
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 group-focus-within:text-orange-400 transition-colors">
                        Địa chỉ Email *
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                        <input 
                            type="email" 
                            name="email" 
                            required 
                            value={formData.email} 
                            onChange={handleChange} 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-glass focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl outline-none text-xs font-medium text-slate-200 placeholder:text-slate-500 transition-all"
                            placeholder="mail@example.com" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 group-focus-within:text-orange-400 transition-colors">
                            Mật khẩu *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                            <input 
                                type="password" 
                                name="password" 
                                required 
                                value={formData.password} 
                                onChange={handleChange}
                                className="w-full pl-8 pr-3 py-2.5 bg-slate-900 border border-glass focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl outline-none text-xs font-medium text-slate-200 placeholder:text-slate-500 transition-all"
                                placeholder="••••••••" 
                            />
                        </div>
                    </div>
                    <div className="group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 group-focus-within:text-orange-400 transition-colors">
                            Xác nhận mật khẩu *
                        </label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                required 
                                value={formData.confirmPassword} 
                                onChange={handleChange}
                                className="w-full pl-8 pr-3 py-2.5 bg-slate-900 border border-glass focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl outline-none text-xs font-medium text-slate-200 placeholder:text-slate-500 transition-all"
                                placeholder="••••••••" 
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        disabled={loading} 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-heading font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-500/25 flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer uppercase tracking-wider text-xs group"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo tài khoản...</>
                        ) : (
                            <>ĐĂNG KÝ NGAY <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </div>

                <div className="text-center pt-2 border-t border-glass">
                    <button 
                        type="button" 
                        onClick={onSwitchToLogin} 
                        className="text-xs font-semibold text-slate-400 hover:text-orange-400 transition-colors cursor-pointer"
                    >
                        Đã có tài khoản? <span className="text-white font-bold underline decoration-orange-500 underline-offset-4 pl-1">Đăng Nhập</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

