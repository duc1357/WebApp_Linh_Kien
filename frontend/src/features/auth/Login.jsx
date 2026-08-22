import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext.jsx";
import { ShieldCheck, Mail, Lock, Loader2, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import api from "../../api/axios";

export default function Login({ onSwitchToRegister, onSwitchToForgot }) {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const res = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const token = res.data.access_token;
            const userData = res.data.user;

            login(token, userData);

            // Role-based redirect
            const from = location.state?.from?.pathname || null;
            if (userData?.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (from) {
                navigate(from, { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Lỗi kết nối máy chủ!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-slate-950/90 border border-glass rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 backdrop-blur-xl relative">
            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header Banner */}
            <div className="bg-slate-900/90 p-8 text-center relative border-b border-glass overflow-hidden">
                <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 relative z-10 p-0.5">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-heading font-black text-2xl text-orange-500 text-glow-orange">
                        V
                    </div>
                </div>
                <h2 className="text-2xl font-heading font-black text-white tracking-tight relative z-10 flex items-center justify-center gap-2">
                    ĐĂNG NHẬP
                </h2>
                <p className="text-slate-400 font-medium text-xs mt-1.5 relative z-10">
                    Chào mừng bạn quay trở lại với Vua Linh Kiện
                </p>
            </div>

            {/* Main Form */}
            <form onSubmit={handleLogin} className="p-7 space-y-5 bg-slate-950/60 relative z-10">
                {error && (
                    <div className="bg-red-500/10 text-red-400 p-3.5 rounded-2xl text-xs font-bold border border-red-500/20 flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <div className="group">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-orange-400 transition-colors">
                        Địa chỉ Email *
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                        <input 
                            type="email" 
                            required 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-glass focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-2xl outline-none text-xs font-medium text-slate-200 placeholder:text-slate-500 transition-all"
                            placeholder="email@example.com" 
                        />
                    </div>
                </div>

                <div className="group">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider group-focus-within:text-orange-400 transition-colors">
                            Mật khẩu *
                        </label>
                        {onSwitchToForgot && (
                            <button 
                                type="button" 
                                onClick={onSwitchToForgot} 
                                className="text-[11px] text-orange-400 hover:text-orange-300 font-bold transition-colors cursor-pointer"
                            >
                                Quên mật khẩu?
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                        <input 
                            type={showPw ? 'text' : 'password'} 
                            required 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            className="w-full pl-11 pr-11 py-3 bg-slate-900 border border-glass focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-2xl outline-none text-xs font-medium text-slate-200 placeholder:text-slate-500 transition-all"
                            placeholder="••••••••" 
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPw(!showPw)} 
                            className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                            {showPw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        disabled={loading} 
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-heading font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-500/25 flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer uppercase tracking-wider text-xs group"
                    >
                        {loading ? (
                            <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Đang đăng nhập...</>
                        ) : (
                            <>VÀO HỆ THỐNG <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </div>

                <div className="text-center pt-3 border-t border-glass">
                    <button 
                        type="button" 
                        onClick={onSwitchToRegister} 
                        className="text-xs font-semibold text-slate-400 hover:text-orange-400 transition-colors cursor-pointer"
                    >
                        Chưa có tài khoản? <span className="text-white font-bold underline decoration-orange-500 underline-offset-4 pl-1">Đăng ký ngay</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

