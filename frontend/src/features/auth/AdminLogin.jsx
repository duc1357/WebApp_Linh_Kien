import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext.jsx";
import { ShieldCheck, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
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
                // Thoát token rác ngay lập tức
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
            <div className="absolute inset-0 bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.15),rgba(255,255,255,0))]" />
            
            <div className="w-full max-w-sm bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-slate-800 relative z-10">
                <div className="p-8 pb-4 text-center">
                    <div className="w-16 h-16 bg-orange-500/10 rounded-2xl mx-auto flex items-center justify-center border border-orange-500/20 mb-4 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                        <ShieldCheck className="w-8 h-8 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                        <span className="text-orange-500">VUA</span>ADMIN
                    </h2>
                    <p className="text-slate-400 font-medium text-xs mt-2 uppercase tracking-widest">Secure Portal</p>
                </div>

                <form onSubmit={handleLogin} className="p-8 pt-4 space-y-5">
                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm font-semibold border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div className="group">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-orange-500">Email quản trị</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-600 transition-colors group-focus-within:text-orange-500" />
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl outline-none font-medium transition-all placeholder:text-slate-700"
                                placeholder="admin@example.com" />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-orange-500">Mật khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-600 transition-colors group-focus-within:text-orange-500" />
                            <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-800 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl outline-none font-medium transition-all placeholder:text-slate-700"
                                placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors">
                                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button disabled={loading} type="submit"
                                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] flex justify-center items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'TRUY CẬP HỆ THỐNG'}
                        </button>
                    </div>
                </form>
            </div>
            
            <a href="/" className="fixed bottom-6 text-slate-500 hover:text-white hover:underline text-sm font-medium transition-colors">
                ← Quay lại trang khách hàng
            </a>
        </div>
    );
}
