import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, 
  LogOut, TrendingUp, DollarSign, PackageSearch, Activity,
  CheckCircle, XCircle, Search, Edit, Trash2, Eye, EyeOff, Plus, Lock, UploadCloud, MessageSquare, Star
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
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="text-orange-500">VUA</span>ADMIN
          </h2>
          <p className="text-xs text-slate-500 mt-1">Quản lý hệ thống</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Tổng quan" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<ShoppingCart size={20} />} label="Đơn hàng" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          <SidebarItem icon={<Package size={20} />} label="Sản phẩm & Kho" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <SidebarItem icon={<Users size={20} />} label="Người dùng" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <SidebarItem icon={<MessageSquare size={20} />} label="Đánh giá" active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => setShowPasswordModal(true)} className="flex items-center gap-3 mb-4 px-2 hover:bg-slate-800 p-2 rounded-xl transition-colors w-full text-left">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shrink-0">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-bold text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-slate-400">ADMIN (Đổi mật khẩu)</p>
            </div>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50 relative">
        <div className="p-8">
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
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-orange-500 text-white font-medium shadow-md shadow-orange-500/20' 
          : 'hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ======================================
// DASHBOARD
// ======================================

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
          <h2 className="text-3xl font-black text-slate-800">Tổng quan Hệ thống</h2>
          <div className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-slate-600 border border-slate-100 flex items-center gap-2">
            <Activity className="text-emerald-500" size={18}/> LIVE
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<DollarSign size={24} />} title="Tổng doanh thu" value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.total_revenue || 0)} color="bg-emerald-500" />
        <StatCard icon={<ShoppingCart size={24} />} title="Lượt đặt hàng" value={stats?.total_orders || 0} color="bg-blue-500" />
        <StatCard icon={<Users size={24} />} title="Khách hàng" value={stats?.total_users || 0} color="bg-cyan-500" />
        <StatCard icon={<PackageSearch size={24} />} title="Sản phẩm sắp hết" value={stats?.low_stock_products || 0} color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <TrendingUp className="text-orange-500"/>
                  Xu hướng Doanh Thu (14 Ngày)
              </h3>
              <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats?.revenue_chart || []}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                          <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fill: '#94a3b8', fontSize: 12}} 
                              tickFormatter={(val) => ` ${(val/1000000).toFixed(1)}M`}
                              width={60}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), 'Doanh thu']}
                          />
                          <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={4} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Activity className="text-blue-500"/>
                  Tần suất Giao Dịch
              </h3>
              <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.revenue_chart || []}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                          <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fill: '#94a3b8', fontSize: 12}} 
                              tickFormatter={(val) => ` ${(val/1000000).toFixed(1)}M`}
                              width={60}
                          />
                          <Tooltip 
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), 'Doanh thu']}
                          />
                          <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white ${color} bg-opacity-90 shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

// ======================================
// ORDERS
// ======================================

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
        <h2 className="text-3xl font-bold text-slate-800">Quản lý Đơn hàng</h2>
        <div className="flex gap-4 items-center">
            <select 
              value={status} 
              onChange={(e) => {setStatus(e.target.value); setPage(1);}}
              className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 text-sm bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="SHIPPED">Đang giao hàng</option>
              <option value="DELIVERED">Đã giao</option>
              <option value="CANCELLED">Hủy bỏ</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm Mã ĐH, Địa chỉ..." 
                value={search}
                onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 text-sm w-64"
              />
            </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm">
              <th className="p-4 font-medium border-b border-slate-100">Mã ĐH</th>
              <th className="p-4 font-medium border-b border-slate-100">Ngày đặt</th>
              <th className="p-4 font-medium border-b border-slate-100">Khách hàng</th>
              <th className="p-4 font-medium border-b border-slate-100">Tổng tiền</th>
              <th className="p-4 font-medium border-b border-slate-100">Trạng thái</th>
              <th className="p-4 font-medium border-b border-slate-100">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.map(order => (
              <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-4 font-mono font-medium text-slate-700">#{order.id.toString().padStart(4, '0')}</td>
                <td className="p-4 text-slate-500">{order.created_at}</td>
                <td className="p-4 text-slate-600 max-w-[200px] truncate" title={order.shipping_address}>{order.shipping_address}</td>
                <td className="p-4 font-bold text-slate-800">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
                </td>
                <td className="p-4">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="p-2 bg-slate-100 border-none rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
                  >
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="PAID">Đã thanh toán</option>
                    <option value="SHIPPED">Đang giao hàng</option>
                    <option value="DELIVERED">Đã giao</option>
                    <option value="CANCELLED">Hủy bỏ</option>
                  </select>
                </td>
                <td className="p-4">
                  <button onClick={() => setSelectedOrder(order)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                    Xem Items
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">Chưa có đơn hàng nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50">Trang trước</button>
          <span className="px-4 py-2 text-sm text-slate-600 font-medium">Trang {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50">Trang sau</button>
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-black text-slate-800">Chi tiết Mã ĐH: #{order.id.toString().padStart(4, '0')}</h3>
            <p className="text-sm text-slate-500 mt-1">Giao tới: {order.shipping_address}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <XCircle size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center p-4 rounded-xl border border-slate-100 bg-white">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  {item.product_image ? (
                    <img src={getImageUrl(item.product_image)} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={24} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{item.product_name}</p>
                  <p className="text-sm text-slate-500">SL: <span className="font-bold text-orange-500">{item.quantity}</span></p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price_at_purchase)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium text-slate-600">Tổng cộng:</span>
            <span className="font-black text-slate-800 text-2xl text-orange-600">
               {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================================
// PRODUCTS (PAGINATED & CRUD)
// ======================================

function ProductsView() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [categoryId, setCategoryId] = useState('');
  const limit = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    // Tải Category để dùng trong Form Options
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
      alert(e.response?.data?.detail || "Lỗi xóa sản phẩm. Hãy dùng tính năng Ẩn nếu sản phẩm đang kẹt đơn hàng lịch sử.");
    }
  };

  const handleToggleActive = async (p) => {
    try {
      // Toggle the boolean
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
        <h2 className="text-3xl font-bold text-slate-800">Kho Sản phẩm</h2>
        <div className="flex gap-4 items-center">
            <select 
              value={categoryId} 
              onChange={(e) => {setCategoryId(e.target.value); setPage(1);}}
              className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 text-sm bg-white"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm sản phẩm..." 
                value={search}
                onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 text-sm w-64"
              />
            </div>
            <button onClick={() => openForm()} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5">
              <Plus size={18} /> Thêm Mới
            </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-4 font-medium border-b border-slate-100 w-16">ID</th>
                <th className="p-4 font-medium border-b border-slate-100 w-96">Sản phẩm</th>
                <th className="p-4 font-medium border-b border-slate-100">Đơn giá</th>
                <th className="p-4 font-medium border-b border-slate-100">Kho</th>
                <th className="p-4 font-medium border-b border-slate-100 text-center">Trạng Thái</th>
                <th className="p-4 font-medium border-b border-slate-100 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {products.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="p-4 font-mono text-slate-400">#{p.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-slate-100 overflow-hidden shrink-0">
                        {p.image ? <img src={getImageUrl(p.image)} className="w-full h-full object-cover" alt={p.name} /> : <Package className="w-full h-full p-2 text-slate-300"/>}
                      </div>
                      <p className="font-bold text-slate-700 truncate max-w-[300px]" title={p.name}>{p.name}</p>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-emerald-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-emerald-50 text-emerald-600' : p.stock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                      {p.stock} cái
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                      {p.is_active ? 'Hiện' : 'Đang Ẩn'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => openForm(p)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg" title="Chỉnh sửa"><Edit size={18} /></button>
                        <button onClick={() => handleToggleActive(p)} className={`p-2 rounded-lg ${p.is_active ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50'}`} title={p.is_active ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}>
                            {p.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Xóa vĩnh viễn"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500">Giỏ hàng rỗng!</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Basic Pagination Bottom */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(page-1)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="px-4 py-2 text-sm text-slate-600 font-medium">Trang {page} / {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(page+1)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Trang sau
          </button>
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

// Product Form Modal (Tương thức cả Thêm & Sửa)
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
      onClose(true); // Close and refresh
    } catch(err) {
      alert("Lỗi lưu sản phẩm: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            {isEditing ? <Edit className="text-orange-500" /> : <Plus className="text-emerald-500" />}
            {isEditing ? "Chỉnh sửa Sản Phẩm" : "Thêm mới Sản Phẩm"}
          </h3>
          <button onClick={() => onClose()} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full">
            <XCircle size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tên */}
                <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Tên Sản Phẩm *</label>
                    <input required type="text" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-brand)] text-sm" placeholder="VD: Card màn hình RTX 4060..." />
                </div>
                
                {/* Danh mục */}
                <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Danh Mục</label>
                    <select required value={form.category_id} onChange={e=>setForm({...form, category_id: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-brand)] bg-white text-sm">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {/* Đơn Giá */}
                <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Đơn Giá (VND) *</label>
                    <input required type="number" min="0" value={form.price} onChange={e=>setForm({...form, price: parseFloat(e.target.value)})} className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-brand)] text-sm" />
                </div>

                {/* Tồn kho */}
                <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Tồn kho *</label>
                    <input required type="number" min="0" value={form.stock} onChange={e=>setForm({...form, stock: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-brand)] text-sm" />
                </div>

                {/* Hình Ảnh (Có Xóa) */}
                <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Hình Ảnh Sản Phẩm</label>
                    <div className="flex items-center gap-3">
                        {form.image ? (
                            <div className="relative w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 group">
                                <img src={getImageUrl(form.image)} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl p-1" />
                                <button type="button" onClick={() => setForm({...form, image: ''})} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all w-5 h-5 flex items-center justify-center shadow-md">
                                    <XCircle size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 shrink-0 text-slate-300">
                                <Package size={20} />
                            </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                            <input type="text" value={form.image} onChange={e=>setForm({...form, image: e.target.value})} className="w-full px-2 py-1.5 rounded-md border border-slate-200 outline-none focus:border-[var(--color-brand)] text-[11px]" placeholder="Dán link URL..." />
                            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-[11px] flex items-center justify-center gap-1.5 border border-slate-200 transition-colors">
                                {uploading ? <Activity className="animate-spin" size={14}/> : <UploadCloud size={14} />} 
                                {uploading ? "Đang tải..." : "Tải ảnh lên"}
                            </button>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        </div>
                    </div>
                </div>

                {/* Specs */}
                <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Cấu hình cấu thành (Specs)</label>
                    <textarea value={form.specs} onChange={e=>setForm({...form, specs: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-brand)] h-16 resize-none text-sm" placeholder="VD: RAM DDR4 3200MHz | Case thép..." />
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white shadow-[0_-10px_20px_-10px_white]">
                <button type="button" onClick={() => onClose()} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs transition-colors">
                    Hủy bỏ
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] shadow-md shadow-orange-500/20 text-xs transition-colors disabled:opacity-50">
                    {loading ? "Đang xử lý..." : "Xác nhận Lưu"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

// ======================================
// USERS
// ======================================

function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const limit = 10;

  // Modal State
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
      alert(e.response?.data?.detail || "Lỗi xóa User. Hãy kiểm tra nếu họ đã có lịch sử đơn hàng.");
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
        <h2 className="text-3xl font-bold text-slate-800">Quản lý Người dùng</h2>
        <div className="flex gap-4 items-center">
            <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
                type="text" 
                placeholder="Tìm theo Email/Tên..." 
                value={search}
                onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 text-sm w-64"
            />
            </div>
            <button onClick={() => openForm()} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5">
              <Plus size={18} /> Thêm Mới
            </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm">
              <th className="p-4 font-medium border-b border-slate-100">ID</th>
              <th className="p-4 font-medium border-b border-slate-100">Email</th>
              <th className="p-4 font-medium border-b border-slate-100">Vai trò</th>
              <th className="p-4 font-medium border-b border-slate-100">Trạng thái</th>
              <th className="p-4 font-medium border-b border-slate-100 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-4 font-mono text-slate-400">#{u.id}</td>
                <td className="p-4">
                    <p className="font-bold text-slate-700">{u.full_name}</p>
                    <p className="text-slate-500 text-xs">{u.email}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>{u.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</span>
                </td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {u.is_active ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                </td>
                <td className="p-4">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => openForm(u)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg" title="Chỉnh sửa"><Edit size={18} /></button>
                        {u.role !== 'admin' && (
                            <button onClick={() => handleToggleBlock(u.id)} className={`p-2 rounded-lg ${u.is_active ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50'}`} title={u.is_active ? 'Khóa TK' : 'Mở Khóa'}>
                                {u.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        )}
                        <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Xóa vĩnh viễn"><Trash2 size={18} /></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50">Trang trước</button>
          <span className="px-4 py-2 text-sm text-slate-600 font-medium">Trang {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50">Trang sau</button>
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
        // Chỉ gửi password nếu có nhập
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
      onClose(true); // Close and refresh
    } catch(err) {
      alert("Lỗi lưu người dùng: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            {isEditing ? <Edit className="text-orange-500" /> : <Plus className="text-emerald-500" />}
            {isEditing ? "Chỉnh sửa Người Dùng" : "Thêm Người Dùng Mới"}
          </h3>
          <button onClick={() => onClose()} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full">
            <XCircle size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500">Họ và Tên *</label>
                    <input required type="text" value={form.full_name} onChange={e=>setForm({...form, full_name: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-orange-500" />
                </div>
                
                <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500">Email *</label>
                    <input required type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-orange-500" />
                </div>

                <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500">Mật khẩu {isEditing ? '(Bỏ trống nếu không đổi)' : '*'}</label>
                    <input type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-orange-500" />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Vai trò</label>
                    <select value={form.role} onChange={e=>setForm({...form, role: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-orange-500 bg-white">
                        <option value="customer">Khách hàng</option>
                        <option value="admin">Quản trị viên (Admin)</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Số điện thoại</label>
                    <input type="text" value={form.phone_number} onChange={e=>setForm({...form, phone_number: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-orange-500" />
                </div>

                <div className="col-span-2 flex items-center justify-between p-4 mt-2 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-sm font-bold text-slate-700">Trạng thái hoạt động</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={form.is_active} onChange={e=>setForm({...form, is_active: e.target.checked})} />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => onClose()} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                    Hủy bỏ
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-500/30 transition-colors disabled:opacity-50">
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Lock className="text-orange-500" /> Đổi Mật Khẩu Admin</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"><XCircle size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Mật khẩu hiện tại *</label>
            <input required type="password" value={form.old_password} onChange={e=>setForm({...form, old_password: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-orange-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Mật khẩu mới * (Tối thiểu 8 ký tự)</label>
            <input required type="password" value={form.new_password} onChange={e=>setForm({...form, new_password: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-orange-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Xác nhận mật khẩu mới *</label>
            <input required type="password" value={form.confirm} onChange={e=>setForm({...form, confirm: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-orange-500" />
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Hủy bỏ</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-500 transition-colors disabled:opacity-50">{loading ? "Đang lưu..." : "Xác nhận đổi"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ======================================
// REVIEWS
// ======================================

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
        <h1 className="text-3xl font-bold text-slate-800">Quản lý Đánh Giá</h1>
        <div className="flex gap-4 items-center">
            <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
                type="text" 
                placeholder="Tìm bình luận, sản phẩm..." 
                value={search}
                onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 text-sm w-64"
            />
            </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm">
              <th className="p-4 font-medium border-b border-slate-100 w-16">ID</th>
              <th className="p-4 font-medium border-b border-slate-100 w-48">Sản phẩm</th>
              <th className="p-4 font-medium border-b border-slate-100 w-48">Người dùng</th>
              <th className="p-4 font-medium border-b border-slate-100 w-16">Chất lượng</th>
              <th className="p-4 font-medium border-b border-slate-100 flex-1">Nội dung</th>
              <th className="p-4 font-medium border-b border-slate-100 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {reviews.map(r => (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-4 font-mono text-slate-400">#{r.id}</td>
                <td className="p-4 font-bold text-slate-700 truncate max-w-[200px]" title={r.product_name}>{r.product_name}</td>
                <td className="p-4 text-slate-600 truncate max-w-[200px]" title={r.user_email}>{r.user_email}</td>
                <td className="p-4 font-bold text-amber-500 flex items-center gap-1">{r.rating} <Star className="fill-current w-4 h-4" /></td>
                <td className="p-4 text-slate-600 max-w-sm">
                    <p className="line-clamp-2" title={r.comment}>{r.comment}</p>
                    {r.image && <a href={r.image} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs mt-1 block">Xem ảnh đính kèm</a>}
                </td>
                <td className="p-4 text-right">
                    <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Xóa đánh giá"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500">Chưa có đánh giá nào</td></tr>}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50">Trang trước</button>
          <span className="px-4 py-2 text-sm text-slate-600 font-medium">Trang {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50">Trang sau</button>
        </div>
      )}
    </div>
  );
}
