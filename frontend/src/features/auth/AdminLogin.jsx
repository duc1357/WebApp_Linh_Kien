import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext.jsx";
import { ShieldCheck, Mail, Lock, Loader2, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import api from "../../api/axios";

export default function AdminLogin() {
    const { login, logout } = useContext(AuthContext);
    const navigate = useNavigate();
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

            if (userData?.role !== 'admin') {
                setError('Tài khoản của bạn không có đặc quyền Quản trị hệ thống.');
                setLoading(false);
                await logout();
                return;
            }

            login(token, userData);
            navigate('/admin/dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.detail || 'Lỗi kết nối máy chủ!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden font-sans">
            {/* Background Ambient Orbs */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-full max-w-sm bg-slate-950/90 border border-glass rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative z-10 backdrop-blur-xl">
                <div className="p-7 pb-4 text-center border-b border-glass bg-slate-900/80">
                    <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30 mb-3 p-0.5">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-heading font-black text-2xl text-orange-500 text-glow-orange">
                            V
                        </div>
                    </div>
                    <h2 className="text-xl font-heading font-black text-white tracking-tight flex items-center justify-center gap-1.5">
                        <span className="text-orange-500 text-glow-orange">VUA</span>ADMIN
                    </h2>
                    <p className="text-slate-400 font-bold text-[10px] mt-1 uppercase tracking-widest">Cổng Quản Trị Bảo Mật 24/7</p>
                </div>

                <form onSubmit={handleLogin} className="p-7 space-y-4.5 bg-slate-950/60">
                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-xs font-bold border border-red-500/20 flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="group">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-orange-400 transition-colors">
                            Email Quản Trị *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                            <input 
                                type="email" 
                                required 
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-glass text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-2xl outline-none text-xs font-medium placeholder:text-slate-500 transition-all"
                                placeholder="admin@example.com" 
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-orange-400 transition-colors">
                            Mật khẩu *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                            <input 
                                type={showPw ? 'text' : 'password'} 
                                required 
                                value={password} 
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-11 pr-11 py-3 bg-slate-900 border border-glass text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-2xl outline-none text-xs font-medium placeholder:text-slate-500 transition-all"
                                placeholder="••••••••" 
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPw(!showPw)} 
                                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
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
                                <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Đang xác thực...</>
                            ) : (
                                <>TRUY CẬP ADMIN <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            
            <a href="/" className="fixed bottom-6 text-slate-500 hover:text-orange-400 hover:underline text-xs font-bold transition-colors">
                ← Quay lại trang chủ Vua Linh Kiện
            </a>
        </div>
    );
}

