import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext.jsx";
import { ShieldCheck, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
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
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-slate-100">
            <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
                <div className="w-16 h-16 bg-[var(--color-brand)] rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/50 mb-4 relative z-10">
                    <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight relative z-10">ĐĂNG NHẬP</h2>
                <p className="text-slate-400 font-medium text-sm mt-1 relative z-10">Đăng nhập để lưu trải nghiệm Build PC</p>
            </div>

            <form onSubmit={handleLogin} className="p-8 space-y-5 bg-slate-50">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-200">
                        {error}
                    </div>
                )}

                <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-[var(--color-brand)]">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                               className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 focus:border-[var(--color-brand)] focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none font-medium transition-all"
                               placeholder="email@example.com" />
                    </div>
                </div>

                <div className="group">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-[var(--color-brand)]">Mật khẩu</label>
                        {onSwitchToForgot && (
                            <button type="button" onClick={onSwitchToForgot} className="text-xs text-[var(--color-brand)] hover:underline font-semibold">
                                Quên mật khẩu?
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                               className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 focus:border-[var(--color-brand)] focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none font-medium transition-all"
                               placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-700">
                            {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button disabled={loading} type="submit"
                            className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/30 flex justify-center items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ĐĂNG NHẬP'}
                    </button>
                </div>

                <div className="text-center pt-2">
                    <button type="button" onClick={onSwitchToRegister} className="text-sm font-semibold text-slate-500 hover:text-[var(--color-brand)] transition-colors">
                        Chưa có tài khoản? <span className="underline decoration-2 underline-offset-4">Đăng ký ngay</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
