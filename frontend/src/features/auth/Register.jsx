import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, Loader2 } from 'lucide-react';
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
            setSuccessMsg("Đăng ký thành công! Hãy chuyển sang Đăng Nhập.");
            setFormData({ full_name: '', email: '', password: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.detail || "Lỗi đăng ký");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-slate-100">
            <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--color-brand)]/20 rounded-full blur-3xl"></div>
                <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 relative z-10">
                    <User className="w-8 h-8 text-slate-800" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight relative z-10">ĐĂNG KÝ TÀI KHOẢN</h2>
            </div>
            
            <form onSubmit={handleRegister} className="p-8 space-y-4 bg-slate-50">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-200">{error}</div>}
                {successMsg && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm font-semibold border border-emerald-200">{successMsg}</div>}
                
                <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Họ và Tên</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} 
                               className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-[var(--color-brand)] focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none font-medium transition-all"
                               placeholder="Nguyễn Văn A" />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} 
                               className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-[var(--color-brand)] focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none font-medium transition-all"
                               placeholder="mail@example.com" />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input type="password" name="password" required value={formData.password} onChange={handleChange}
                                   className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-[var(--color-brand)] focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none font-medium transition-all text-sm"
                                   placeholder="••••••••" />
                        </div>
                    </div>
                    <div className="group">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check Pass</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                                   className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-[var(--color-brand)] focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none font-medium transition-all text-sm"
                                   placeholder="••••••••" />
                        </div>
                    </div>
                </div>

                <div className="pt-3">
                    <button disabled={loading} type="submit" 
                            className="w-full bg-slate-900 hover:bg-black text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 flex justify-center items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ĐĂNG KÝ TÀI KHOẢN'}
                    </button>
                </div>
                
                <div className="text-center pt-2">
                    <button type="button" onClick={onSwitchToLogin} className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                        Đã có tài khoản? <span className="underline decoration-2 underline-offset-4">Đăng Nhập</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
