import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, 
  LogOut, TrendingUp, DollarSign, PackageSearch, Activity,
  CheckCircle, XCircle, Search, Edit, Trash2, Eye, EyeOff, Plus, Lock, UploadCloud, MessageSquare, Star, Sparkles
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api, { getImageUrl } from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from 'react-router-dom';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950/90 border-r border-glass text-slate-300 flex flex-col backdrop-blur-xl z-20 relative">
        <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="p-6 border-b border-glass relative z-10">
          <h2 className="text-xl font-heading font-black text-white flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-heading font-black text-base shadow-lg shadow-orange-500/30 border border-orange-400/40 shrink-0">
              V
            </span>
            <span>
              <span className="text-orange-500 text-glow-orange">VUA</span>ADMIN
            </span>
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Cổng Quản Trị Hệ Thống</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-5 relative z-10">
          <SidebarItem icon={<LayoutDashboard size={19} />} label="Tổng quan" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<ShoppingCart size={19} />} label="Đơn hàng" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          <SidebarItem icon={<Package size={19} />} label="Sản phẩm & Kho" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <SidebarItem icon={<Users size={19} />} label="Người dùng" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <SidebarItem icon={<MessageSquare size={19} />} label="Đánh giá" active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />
        </nav>

        <div className="p-4 border-t border-glass bg-slate-900/40 relative z-10">
          <button 
            onClick={() => setShowPasswordModal(true)} 
            className="flex items-center gap-3 mb-3 px-3 py-2.5 hover:bg-white/5 border border-transparent hover:border-glass rounded-2xl transition-all w-full text-left cursor-pointer group"
          >
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-bold text-slate-100 truncate group-hover:text-orange-400 transition-colors">{user?.full_name}</p>
              <p className="text-[9px] text-slate-400 font-medium">ADMIN (Đổi MK)</p>
            </div>
          </button>
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-950 relative">
        <div className="fixed top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-64 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="p-8 relative z-10 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'orders' && <OrdersView />}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'users' && <UsersView />}
          {activeTab === 'reviews' && <ReviewsView />}
        </div>
      </main>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
        active 
          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 border border-orange-400/30' 
          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DashboardView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-black text-white tracking-tight flex items-center gap-2">
              TỔNG QUAN HỆ THỐNG
            </h2>
            <p className="text-slate-400 text-xs mt-1">Báo cáo doanh thu & chỉ số vận hành cửa hàng</p>
          </div>
          <div className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Activity className="text-emerald-400" size={16}/> HỆ THỐNG TRỰC TUYẾN
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={<DollarSign size={22} />} title="Tổng doanh thu" value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.total_revenue || 0)} color="from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30" />
        <StatCard icon={<ShoppingCart size={22} />} title="Lượt đặt hàng" value={stats?.total_orders || 0} color="from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30" />
        <StatCard icon={<Users size={22} />} title="Khách hàng" value={stats?.total_users || 0} color="from-cyan-500/20 to-sky-500/20 text-cyan-400 border-cyan-500/30" />
        <StatCard icon={<PackageSearch size={22} />} title="Sản phẩm sắp hết" value={stats?.low_stock_products || 0} color="from-rose-500/20 to-orange-500/20 text-rose-400 border-rose-500/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-glass shadow-xl">
              <h3 className="text-sm font-heading font-black text-slate-200 mb-6 flex items-center gap-2 uppercase tracking-wider">
                  <TrendingUp className="text-orange-500" size={18}/>
                  Xu hướng Doanh Thu (14 Ngày)
              </h3>
              <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats?.revenue_chart || []}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b"/>
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                          <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fill: '#64748b', fontSize: 11}} 
                              tickFormatter={(val) => ` ${(val/1000000).toFixed(1)}M`}
                              width={55}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#090d16', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '12px' }}
                            formatter={(value) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), 'Doanh thu']}
                          />
                          <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3.5} dot={{r: 4, strokeWidth: 2, fill: '#090d16', stroke: '#f97316'}} activeDot={{r: 7}} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-glass shadow-xl">
              <h3 className="text-sm font-heading font-black text-slate-200 mb-6 flex items-center gap-2 uppercase tracking-wider">
                  <Activity className="text-blue-500" size={18}/>
                  Tần suất Giao Dịch Theo Ngày
              </h3>
              <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.revenue_chart || []}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b"/>
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                          <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fill: '#64748b', fontSize: 11}} 
                              tickFormatter={(val) => ` ${(val/1000000).toFixed(1)}M`}
                              width={55}
                          />
                          <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.03)'}}
                            contentStyle={{ backgroundColor: '#090d16', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '12px' }}
                            formatter={(value) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), 'Doanh thu']}
                          />
                          <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-5 border border-glass shadow-xl flex items-center gap-4 hover:border-orange-500/40 transition-all">
      <div className={`w-13 h-13 rounded-2xl flex items-center justify-center bg-gradient-to-br ${color} border shadow-inner shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
        <p className="text-xl font-heading font-black text-white tracking-tight mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}

function OrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState('');
  const limit = 10;

  function fetchOrders() {
    setLoading(true);
    api.get(`/admin/orders?page=${page}&limit=${limit}&search=${debouncedSearch}&status=${status}`).then(res => {
      setOrders(res.data.items);
      setTotalPages(res.data.pages);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => {
    fetchOrders();
  }, [page, debouncedSearch, status]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (e) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-heading font-black text-white tracking-tight">QUẢN LÝ ĐƠN HÀNG</h2>
          <p className="text-slate-400 text-xs mt-1">Xem chi tiết & chuyển trạng thái đơn hàng của khách</p>
        </div>
        <div className="flex gap-3 items-center">
            <select 
              value={status} 
              onChange={(e) => {setStatus(e.target.value); setPage(1);}}
              className="px-4 py-2.5 rounded-2xl border border-glass outline-none focus:border-orange-500 text-xs font-bold bg-slate-900 text-slate-200 cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="SHIPPED">Đang giao hàng</option>
              <option value="DELIVERED">Đã giao thành công</option>
              <option value="CANCELLED">Đã hủy bỏ</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm Mã ĐH, Địa chỉ..." 
                value={search}
                onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                className="pl-10 pr-4 py-2.5 bg-slate-900 border border-glass rounded-2xl outline-none focus:border-orange-500 text-xs font-medium text-slate-200 placeholder:text-slate-500 w-60"
              />
            </div>
        </div>
      </div>
      
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl p-2">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
              <th className="py-3 px-4">Mã ĐH</th>
              <th className="py-3 px-4">Ngày đặt</th>
              <th className="py-3 px-4">Địa chỉ giao nhận</th>
              <th className="py-3 px-4">Tổng tiền</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="text-xs font-medium">
            {orders.map(order => (
              <tr key={order.id} className="bg-slate-950/80 border border-slate-800/60 hover:border-orange-500/40 hover:bg-slate-900 transition-all rounded-2xl group">
                <td className="py-3.5 px-4 first:rounded-l-2xl">
                  <span className="font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                    #{order.id.toString().padStart(4, '0')}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-400">{order.created_at}</td>
                <td className="py-3.5 px-4 text-slate-200 max-w-[220px] truncate" title={order.shipping_address}>{order.shipping_address}</td>
                <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
                </td>
                <td className="py-3.5 px-4">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 focus:border-orange-500 outline-none cursor-pointer hover:border-orange-500/40 transition-colors"
                  >
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="PAID">Đã thanh toán</option>
                    <option value="SHIPPED">Đang giao hàng</option>
                    <option value="DELIVERED">Đã giao</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </td>
                <td className="py-3.5 px-4 text-right last:rounded-r-2xl">
                  <button onClick={() => setSelectedOrder(order)} className="px-3.5 py-1.5 bg-orange-500/10 hover:bg-orange-500 hover:text-white text-orange-400 border border-orange-500/30 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer">
                    Xem sản phẩm
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">Chưa có đơn hàng nào trong hệ thống</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-4 py-2 border border-glass bg-slate-900 text-slate-300 rounded-xl text-xs font-bold hover:bg-white/5 disabled:opacity-40 cursor-pointer">Trang trước</button>
          <span className="px-4 py-2 text-xs text-slate-400 font-bold flex items-center">Trang {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-4 py-2 border border-glass bg-slate-900 text-slate-300 rounded-xl text-xs font-bold hover:bg-white/5 disabled:opacity-40 cursor-pointer">Trang sau</button>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

function OrderDetailsModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950/95 border border-glass rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-glass flex justify-between items-center bg-slate-900/90">
          <div>
            <h3 className="text-lg font-heading font-black text-white">CHI TIẾT ĐƠN HÀNG: #{order.id.toString().padStart(4, '0')}</h3>
            <div className="text-xs text-slate-300 mt-1 space-y-0.5">
              <p>👤 Người nhận: <span className="font-bold text-orange-400">{order.receiver_name || 'Chưa cập nhật'}</span> {order.receiver_phone && `(${order.receiver_phone})`}</p>
              <p>📍 Giao tới: <span className="text-slate-200">{order.shipping_address}</span></p>
              {order.note && <p>📝 Ghi chú: <span className="text-amber-400 italic">"{order.note}"</span></p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer">
            <XCircle size={22} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-3 bg-slate-950/60 flex-1">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-center p-3.5 rounded-2xl border border-glass bg-slate-900/60">
              <div className="w-14 h-14 bg-slate-950 rounded-xl border border-glass flex items-center justify-center shrink-0 overflow-hidden">
                {item.product_image ? (
                  <img src={getImageUrl(item.product_image)} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={22} className="text-slate-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-200 text-xs truncate">{item.product_name}</p>
                <p className="text-xs text-slate-400 mt-0.5">Số lượng: <span className="font-black text-orange-400">{item.quantity}</span></p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-400 text-xs">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price_at_purchase)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-glass bg-slate-900/90 flex justify-between items-center">
          <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">Tổng giá trị đơn hàng:</span>
          <span className="font-heading font-black text-white text-xl text-glow-orange">
             {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProductsView() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [categoryId, setCategoryId] = useState('');
  const limit = 10;
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(()=>{});
  }, []);

  function fetchProducts() {
    setLoading(true);
    let url = `/admin/products?page=${page}&limit=${limit}&search=${debouncedSearch}`;
    if (categoryId) url += `&category_id=${categoryId}`;
    
    api.get(url).then(res => {
      setProducts(res.data.items);
      setTotalPages(res.data.pages);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    fetchProducts();
  }, [page, debouncedSearch, categoryId]);

  const handleDelete = async (id) => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (e) {
      alert(e.response?.data?.detail || "Lỗi xóa sản phẩm!");
    }
  };

  const handleToggleActive = async (p) => {
    try {
      await api.put(`/admin/products/${p.id}`, { is_active: !p.is_active });
      fetchProducts();
    } catch (e) {
      alert("Lỗi cập nhật trạng thái");
    }
  }

  const openForm = (product = null) => {
    setEditProduct(product);
    setShowModal(true);
  };

  const closeForm = (shouldRefresh) => {
    setEditProduct(null);
    setShowModal(false);
    if(shouldRefresh) fetchProducts();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-heading font-black text-white tracking-tight">KHO SẢN PHẨM & LINH KIỆN</h2>
          <p className="text-slate-400 text-xs mt-1">Quản lý kho hàng, thêm linh kiện & chỉnh sửa giá cả</p>
        </div>
        <div className="flex gap-3 items-center">
            <select 
              value={categoryId} 
              onChange={(e) => {setCategoryId(e.target.value); setPage(1);}}
              className="px-4 py-2.5 rounded-2xl border border-glass outline-none focus:border-orange-500 text-xs font-bold bg-slate-900 text-slate-200 cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm sản phẩm..." 
                value={search}
                onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                className="pl-10 pr-4 py-2.5 bg-slate-900 border border-glass rounded-2xl outline-none focus:border-orange-500 text-xs font-medium text-slate-200 placeholder:text-slate-500 w-56"
              />
            </div>
            <button 
              onClick={() => openForm()} 
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-orange-500/20 transition-all hover:scale-105 cursor-pointer uppercase tracking-wider"
            >
              <Plus size={16} /> Thêm Mới
            </button>
        </div>
      </div>
      
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl p-2">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
                <th className="py-3 px-4 w-20">ID</th>
                <th className="py-3 px-4">Sản phẩm</th>
                <th className="py-3 px-4">Đơn giá</th>
                <th className="py-3 px-4">Tồn kho</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-xs font-medium">
              {products.map(p => (
                <tr key={p.id} className="bg-slate-950/80 border border-slate-800/60 hover:border-orange-500/40 hover:bg-slate-900 transition-all rounded-2xl group">
                  <td className="py-3.5 px-4 first:rounded-l-2xl">
                    <span className="font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                      #{p.id}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-glass overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-md group-hover:border-orange-500/30 transition-colors">
                        {p.image ? (
                          <img src={getImageUrl(p.image)} className="w-full h-full object-contain rounded-xl" alt={p.name} />
                        ) : (
                          <Package className="w-full h-full p-2 text-slate-600"/>
                        )}
                      </div>
                      <p className="font-bold text-slate-100 group-hover:text-orange-400 transition-colors truncate max-w-[300px]" title={p.name}>
                        {p.name}
                      </p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-black text-emerald-400 text-sm tracking-tight">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-sm ${
                      p.stock > 10 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10' 
                        : p.stock > 0 
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-amber-500/10' 
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-rose-500/10'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.stock > 10 ? 'bg-emerald-400' : p.stock > 0 ? 'bg-amber-400 animate-pulse' : 'bg-rose-400'}`} />
                      {p.stock} cái
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      p.is_active 
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10' 
                        : 'bg-slate-800/90 text-slate-400 border border-slate-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-cyan-400' : 'bg-slate-500'}`} />
                      {p.is_active ? 'HIỆN' : 'ĐANG ẨN'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right last:rounded-r-2xl">
                    <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openForm(p)} 
                          className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20 rounded-xl transition-all shadow-sm cursor-pointer" 
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit size={15} />
                        </button>
                        <button 
                          onClick={() => handleToggleActive(p)} 
                          className={`p-2 border rounded-xl transition-all shadow-sm cursor-pointer ${
                            p.is_active 
                              ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border-amber-500/20' 
                              : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white border-cyan-500/20'
                          }`} 
                          title={p.is_active ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                        >
                            {p.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)} 
                          className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all shadow-sm cursor-pointer" 
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 size={15} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500">Chưa có sản phẩm nào trong kho</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-4 py-2 border border-glass bg-slate-900 text-slate-300 rounded-xl text-xs font-bold hover:bg-white/5 disabled:opacity-40 cursor-pointer">Trang trước</button>
          <span className="px-4 py-2 text-xs text-slate-400 font-bold flex items-center">Trang {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-4 py-2 border border-glass bg-slate-900 text-slate-300 rounded-xl text-xs font-bold hover:bg-white/5 disabled:opacity-40 cursor-pointer">Trang sau</button>
        </div>
      )}

      {showModal && (
        <ProductFormModal 
          product={editProduct} 
          categories={categories}
          onClose={(shouldRefresh) => closeForm(shouldRefresh)} 
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, categories, onClose }) {
  const isEditing = !!product;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({
    name: product?.name || '',
    category_id: product?.category_id || (categories[0]?.id ?? 1),
    price: product?.price || 0,
    stock: product?.stock || 0,
    image: product?.image || '',
    specs: product?.specs || '',
    is_active: product?.is_active ?? true
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const res = await api.post('/admin/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        setForm(prev => ({...prev, image: res.data.url}));
    } catch (err) {
        alert("Lỗi upload ảnh!");
    } finally {
        setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/admin/products/${product.id}`, form);
      } else {
        await api.post('/admin/products', form);
      }
      onClose(true);
    } catch(err) {
      alert("Lỗi lưu sản phẩm: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950/95 border border-glass rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-glass flex justify-between items-center bg-slate-900/90">
          <h3 className="text-lg font-heading font-black text-white flex items-center gap-2">
            {isEditing ? <Edit className="text-orange-500" size={18} /> : <Plus className="text-emerald-500" size={18} />}
            {isEditing ? "CHỈNH SỬA SẢN PHẨM" : "THÊM MỚI SẢN PHẨM"}
          </h3>
          <button onClick={() => onClose()} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer">
            <XCircle size={22} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-slate-950/60">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Tên Sản Phẩm *</label>
                    <input required type="text" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-glass text-xs font-medium text-slate-200 outline-none focus:border-orange-500 transition-all" placeholder="VD: Card màn hình RTX 4060..." />
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Danh Mục *</label>
                    <select required value={form.category_id} onChange={e=>setForm({...form, category_id: parseInt(e.target.value)})} className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-glass text-xs font-medium text-slate-200 outline-none focus:border-orange-500 transition-all cursor-pointer">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Đơn Giá (VND) *</label>
                    <input required type="number" min="0" value={form.price} onChange={e=>setForm({...form, price: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-glass text-xs font-medium text-slate-200 outline-none focus:border-orange-500 transition-all" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Tồn kho *</label>
                    <input required type="number" min="0" value={form.stock} onChange={e=>setForm({...form, stock: parseInt(e.target.value)})} className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-glass text-xs font-medium text-slate-200 outline-none focus:border-orange-500 transition-all" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Hình Ảnh Sản Phẩm</label>
                    <div className="flex items-center gap-3">
                        {form.image ? (
                            <div className="relative w-14 h-14 rounded-2xl border border-glass bg-slate-900 flex items-center justify-center shrink-0 group">
                                <img src={getImageUrl(form.image)} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl p-1" />
                                <button type="button" onClick={() => setForm({...form, image: ''})} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all w-5 h-5 flex items-center justify-center shadow-md cursor-pointer">
                                    <XCircle size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="w-14 h-14 rounded-2xl border border-glass flex items-center justify-center bg-slate-900 shrink-0 text-slate-600">
                                <Package size={20} />
                            </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                            <input type="text" value={form.image} onChange={e=>setForm({...form, image: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-glass text-[11px] text-slate-200 outline-none focus:border-orange-500" placeholder="Link URL ảnh..." />
                            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full px-3 py-1.5 bg-slate-900 hover:bg-white/5 text-slate-300 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 border border-glass transition-colors cursor-pointer">
                                {uploading ? <Activity className="animate-spin" size={14}/> : <UploadCloud size={14} />} 
                                {uploading ? "Đang tải..." : "Tải ảnh từ máy"}
                            </button>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Thông số kỹ thuật (Specs)</label>
                    <textarea value={form.specs} onChange={e=>setForm({...form, specs: e.target.value})} className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-glass text-xs text-slate-200 outline-none focus:border-orange-500 h-16 resize-none" placeholder="VD: RAM DDR4 3200MHz | Thép mạ..." />
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-glass flex justify-end gap-3">
                <button type="button" onClick={() => onClose()} className="px-5 py-2.5 rounded-2xl font-bold text-slate-400 bg-white/5 hover:bg-white/10 text-xs transition-colors cursor-pointer">
                    Hủy bỏ
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-2xl font-heading font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20 text-xs transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider">
                    {loading ? "Đang lưu..." : "Xác nhận Lưu"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const limit = 10;
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  function fetchUsers() {
    setLoading(true);
    api.get(`/admin/users?page=${page}&limit=${limit}&search=${debouncedSearch}`).then(res => {
      setUsers(res.data.items);
      setTotalPages(res.data.pages);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch]);

  const handleToggleBlock = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      fetchUsers();
    } catch(e) {
      alert(e.response?.data?.detail || "Lỗi xử lý");
    }
  }

  const handleDelete = async (userId) => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch(e) {
      alert(e.response?.data?.detail || "Lỗi xóa User.");
    }
  }

  const openForm = (u = null) => {
    setEditUser(u);
    setShowModal(true);
  }

  const closeForm = (shouldRefresh) => {
    setEditUser(null);
    setShowModal(false);
    if(shouldRefresh) fetchUsers();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-heading font-black text-white tracking-tight">QUẢN LÝ NGƯỜI DÙNG</h2>
          <p className="text-slate-400 text-xs mt-1">Danh sách tài khoản khách hàng & phân quyền quản trị</p>
        </div>
        <div className="flex gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input 
                  type="text" 
                  placeholder="Tìm theo Email/Tên..." 
                  value={search}
                  onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                  className="pl-10 pr-4 py-2.5 bg-slate-900 border border-glass rounded-2xl outline-none focus:border-orange-500 text-xs font-medium text-slate-200 placeholder:text-slate-500 w-60"
              />
            </div>
            <button 
              onClick={() => openForm()} 
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-orange-500/20 transition-all hover:scale-105 cursor-pointer uppercase tracking-wider"
            >
              <Plus size={16} /> Thêm Mới
            </button>
        </div>
      </div>
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl p-2">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
              <th className="py-3 px-4 w-20">ID</th>
              <th className="py-3 px-4">Thông tin tài khoản</th>
              <th className="py-3 px-4">Vai trò</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-xs font-medium">
            {users.map(u => (
              <tr key={u.id} className="bg-slate-950/80 border border-slate-800/60 hover:border-orange-500/40 hover:bg-slate-900 transition-all rounded-2xl group">
                <td className="py-3.5 px-4 first:rounded-l-2xl">
                  <span className="font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                    #{u.id}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-100 group-hover:text-orange-400 transition-colors">{u.full_name}</p>
                    <p className="text-slate-400 text-[11px]">{u.email}</p>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    u.role === 'admin' 
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm shadow-orange-500/10' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {u.role === 'admin' ? 'QUẢN TRỊ VIÊN' : 'KHÁCH HÀNG'}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      u.is_active 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10' 
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/10'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {u.is_active ? 'HOẠT ĐỘNG' : 'BỊ KHÓA'}
                    </span>
                </td>
                <td className="py-3.5 px-4 text-right last:rounded-r-2xl">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => openForm(u)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20 rounded-xl transition-all shadow-sm cursor-pointer" title="Chỉnh sửa"><Edit size={15} /></button>
                        {u.role !== 'admin' && (
                            <button onClick={() => handleToggleBlock(u.id)} className={`p-2 border rounded-xl transition-all shadow-sm cursor-pointer ${u.is_active ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border-emerald-500/20'}`} title={u.is_active ? 'Khóa TK' : 'Mở Khóa'}>
                                {u.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        )}
                        <button onClick={() => handleDelete(u.id)} className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all shadow-sm cursor-pointer" title="Xóa vĩnh viễn"><Trash2 size={15} /></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-4 py-2 border border-glass bg-slate-900 text-slate-300 rounded-xl text-xs font-bold hover:bg-white/5 disabled:opacity-40 cursor-pointer">Trang trước</button>
          <span className="px-4 py-2 text-xs text-slate-400 font-bold flex items-center">Trang {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-4 py-2 border border-glass bg-slate-900 text-slate-300 rounded-xl text-xs font-bold hover:bg-white/5 disabled:opacity-40 cursor-pointer">Trang sau</button>
        </div>
      )}

      {showModal && (
        <UserFormModal 
          user={editUser} 
          onClose={(shouldRefresh) => closeForm(shouldRefresh)} 
        />
      )}
    </div>
  );
}

function UserFormModal({ user, onClose }) {
  const isEditing = !!user;
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'customer',
    is_active: user?.is_active ?? true,
    phone_number: user?.phone_number || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/users/${user.id}`, payload);
      } else {
        if (!form.password) {
            setLoading(false);
            return alert("Vui lòng nhập mật khẩu cho người dùng mới!");
        }
        await api.post('/admin/users', form);
      }
      onClose(true);
    } catch(err) {
      alert("Lỗi lưu người dùng: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950/95 border border-glass rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-glass flex justify-between items-center bg-slate-900/90">
          <h3 className="text-lg font-heading font-black text-white flex items-center gap-2">
            {isEditing ? <Edit className="text-orange-500" size={18} /> : <Plus className="text-emerald-500" size={18} />}
            {isEditing ? "CHỈNH SỬA TÀI KHOẢN" : "THÊM TÀI KHOẢN MỚI"}
          </h3>
          <button onClick={() => onClose()} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer">
            <XCircle size={22} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-950/60">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Họ và Tên *</label>
                    <input required type="text" value={form.full_name} onChange={e=>setForm({...form, full_name: e.target.value})} className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-glass text-xs font-medium text-slate-200 outline-none focus:border-orange-500 transition-all" />
                </div>
                
                <div className="col-span-2 space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Email *</label>
                    <input required type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-glass text-xs font-medium text-slate-200 outline-none focus:border-orange-500 transition-all" />
                </div>

                <div className="col-span-2 space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Mật khẩu {isEditing ? '(Để trống nếu giữ nguyên)' : '*'}</label>
                    <input type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-glass text-xs font-medium text-slate-200 outline-none focus:border-orange-500 transition-all" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Vai trò</label>
                    <select value={form.role} onChange={e=>setForm({...form, role: e.target.value})} className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-glass text-xs font-medium text-slate-200 outline-none focus:border-orange-500 transition-all cursor-pointer">
                        <option value="customer">Khách hàng</option>
                        <option value="admin">Quản trị viên (Admin)</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Số điện thoại</label>
                    <input type="text" value={form.phone_number} onChange={e=>setForm({...form, phone_number: e.target.value})} className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-glass text-xs font-medium text-slate-200 outline-none focus:border-orange-500 transition-all" />
                </div>

                <div className="col-span-2 flex items-center justify-between p-4 rounded-2xl border border-glass bg-slate-900/80">
                    <span className="text-xs font-bold text-slate-300">Trạng thái kích hoạt tài khoản</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={form.is_active} onChange={e=>setForm({...form, is_active: e.target.checked})} />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-glass flex justify-end gap-3">
                <button type="button" onClick={() => onClose()} className="px-5 py-2.5 rounded-2xl font-bold text-slate-400 bg-white/5 hover:bg-white/10 text-xs transition-colors cursor-pointer">
                    Hủy bỏ
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-2xl font-heading font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20 text-xs transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider">
                    {loading ? "Đang lưu..." : "Lưu Người Dùng"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) return alert("Mật khẩu mới không khớp!");
    if (form.new_password.length < 8) return alert("Mật khẩu mới phải có ít nhất 8 ký tự!");

    setLoading(true);
    try {
      await api.put('/user/change-password', { old_password: form.old_password, new_password: form.new_password });
      alert("Đổi mật khẩu thành công!");
      onClose();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950/95 border border-glass rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-glass flex justify-between items-center bg-slate-900/90">
          <h3 className="text-lg font-heading font-black text-white flex items-center gap-2"><Lock className="text-orange-500" size={18} /> ĐỔI MẬT KHẨU ADMIN</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full cursor-pointer"><XCircle size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-950/60">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Mật khẩu hiện tại *</label>
            <input required type="password" value={form.old_password} onChange={e=>setForm({...form, old_password: e.target.value})} className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-glass text-xs font-medium text-slate-200 outline-none focus:border-orange-500 transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Mật khẩu mới * (Ít nhất 8 ký tự)</label>
            <input required type="password" value={form.new_password} onChange={e=>setForm({...form, new_password: e.target.value})} className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-glass text-xs font-medium text-slate-200 outline-none focus:border-orange-500 transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Xác nhận mật khẩu mới *</label>
            <input required type="password" value={form.confirm} onChange={e=>setForm({...form, confirm: e.target.value})} className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-glass text-xs font-medium text-slate-200 outline-none focus:border-orange-500 transition-all" />
          </div>
          <div className="mt-6 pt-4 border-t border-glass flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-2xl font-bold text-slate-400 bg-white/5 hover:bg-white/10 text-xs transition-colors cursor-pointer">Hủy bỏ</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-2xl font-heading font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20 text-xs transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider">{loading ? "Đang lưu..." : "Xác nhận đổi"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-orange-500/20" />
    </div>
  );
}

function ReviewsView() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const limit = 10;

  function fetchReviews() {
    setLoading(true);
    api.get(`/admin/reviews?page=${page}&limit=${limit}&search=${debouncedSearch}`).then(res => {
      setReviews(res.data.items);
      setTotalPages(res.data.pages);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => {
    fetchReviews();
  }, [page, debouncedSearch]);

  const handleDelete = async (reviewId) => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      fetchReviews();
    } catch(e) {
      alert(e.response?.data?.detail || "Lỗi xóa Review.");
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-heading font-black text-white tracking-tight">QUẢN LÝ ĐÁNH GIÁ SẢN PHẨM</h2>
          <p className="text-slate-400 text-xs mt-1">Duyệt & kiểm duyệt các phản hồi từ phía người mua hàng</p>
        </div>
        <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input 
                  type="text" 
                  placeholder="Tìm bình luận, sản phẩm..." 
                  value={search}
                  onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                  className="pl-10 pr-4 py-2.5 bg-slate-900 border border-glass rounded-2xl outline-none focus:border-orange-500 text-xs font-medium text-slate-200 placeholder:text-slate-500 w-64"
              />
            </div>
        </div>
      </div>
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl p-2">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
              <th className="py-3 px-4 w-20">ID</th>
              <th className="py-3 px-4 w-48">Sản phẩm</th>
              <th className="py-3 px-4 w-48">Người dùng</th>
              <th className="py-3 px-4 w-24">Chất lượng</th>
              <th className="py-3 px-4 flex-1">Nội dung bình luận</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-xs font-medium">
            {reviews.map(r => (
              <tr key={r.id} className="bg-slate-950/80 border border-slate-800/60 hover:border-orange-500/40 hover:bg-slate-900 transition-all rounded-2xl group">
                <td className="py-3.5 px-4 first:rounded-l-2xl">
                  <span className="font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                    #{r.id}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-100 group-hover:text-orange-400 transition-colors truncate max-w-[200px]" title={r.product_name}>{r.product_name}</td>
                <td className="py-3.5 px-4 text-slate-400 truncate max-w-[200px]" title={r.user_email}>{r.user_email}</td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {r.rating} <Star className="fill-current w-3.5 h-3.5" />
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 max-w-sm">
                    <p className="line-clamp-2" title={r.comment}>{r.comment}</p>
                    {r.image && <a href={getImageUrl(r.image)} target="_blank" rel="noreferrer" className="text-orange-400 hover:underline text-[11px] font-bold mt-1 block">Xem ảnh đính kèm</a>}
                </td>
                <td className="py-3.5 px-4 text-right last:rounded-r-2xl">
                    <button onClick={() => handleDelete(r.id)} className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all shadow-sm cursor-pointer" title="Xóa đánh giá"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500">Chưa có đánh giá nào từ người mua</td></tr>}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-4 py-2 border border-glass bg-slate-900 text-slate-300 rounded-xl text-xs font-bold hover:bg-white/5 disabled:opacity-40 cursor-pointer">Trang trước</button>
          <span className="px-4 py-2 text-xs text-slate-400 font-bold flex items-center">Trang {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-4 py-2 border border-glass bg-slate-900 text-slate-300 rounded-xl text-xs font-bold hover:bg-white/5 disabled:opacity-40 cursor-pointer">Trang sau</button>
        </div>
      )}
    </div>
  );
}
