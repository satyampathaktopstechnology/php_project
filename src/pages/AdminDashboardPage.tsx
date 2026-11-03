import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Product, Category, Brand, Order, AnalyticsData, User, UserRole } from '../types';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Shield,
  UserCheck,
  Lock,
  ArrowRight,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  X
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigateToShop: () => void;
  onNavigateToAccount: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigateToShop,
  onNavigateToAccount
}) => {
  const { user, token, hasRole, switchDemoRole, setIsAuthModalOpen } = useAuth();

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'users' | 'inquiries'>('analytics');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Analytics data
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Users state
  const [usersList, setUsersList] = useState<User[]>([]);

  // Inquiries state
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    brand_id: 1,
    category_id: 1,
    price: 1999,
    old_price: 2499,
    stock_quantity: 20,
    material: '100% Organic Cotton',
    description: '',
    image: '/img/product-img/product-1.jpg',
    is_featured: false,
    is_popular: true
  });

  // Guard: If not signed in or is a subscriber
  const isSubscriber = user?.role === 'subscriber';
  const isGuest = !user;

  // Fetch Analytics & Dashboard Data
  const fetchDashboardData = async () => {
    if (!token || isSubscriber || isGuest) return;

    setAnalyticsLoading(true);
    try {
      // 1. Analytics
      const anRes = await fetch(`/api/analytics?range=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const anData = await anRes.json();
      if (anData.success) {
        setAnalytics(anData);
      }

      // 2. Products
      const prRes = await fetch('/api/products');
      const prData = await prRes.json();
      if (prData.success) {
        setProducts(prData.products || []);
      }

      // 3. Orders
      const orRes = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const orData = await orRes.json();
      if (orData.success) {
        setOrders(orData.orders || []);
      }

      // 4. Categories & Brands
      const [catRes, brRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/brands')
      ]);
      const [catData, brData] = await Promise.all([catRes.json(), brRes.json()]);
      if (catData.success) setCategories(catData.categories || []);
      if (brData.success) setBrands(brData.brands || []);

      // 5. Users (Admin only)
      if (user?.role === 'admin') {
        const uRes = await fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const uData = await uRes.json();
        if (uData.success) setUsersList(uData.users || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, user?.role, timeRange]);

  // RESTRICTED ACCESS SCREEN FOR SUBSCRIBERS
  if (isSubscriber) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 animate-fadeIn">
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-8 md:p-12 text-center space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
              Access Restricted &bull; 403 Forbidden
            </span>
            <h1 className="text-2xl md:text-3xl font-black font-serif text-neutral-900 mt-3">
              Restricted Dashboard Access
            </h1>
            <p className="text-xs md:text-sm text-neutral-500 mt-2 leading-relaxed">
              Your account is registered as a <strong className="text-neutral-800">Subscriber (Customer)</strong>. Subscribers are strictly restricted from accessing administrative dashboards, analytics metrics, and catalog management.
            </p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-left space-y-2 text-xs">
            <p className="font-bold text-neutral-800">Role Permissions Guide:</p>
            <div className="flex items-center gap-2 text-neutral-600">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span><strong>Administrator:</strong> Full access to Analytics, Products, Orders, Users, and Settings.</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span><strong>Editor:</strong> Catalog management, create/edit products, update orders.</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span><strong>Subscriber:</strong> Customer orders, profile, tracking, and wishlist.</span>
            </div>
          </div>

          {/* Quick Demo Switcher Buttons */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-neutral-500">Test with an authorized role:</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => switchDemoRole('admin')}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Switch to Admin (Alexander)</span>
              </button>
              <button
                onClick={() => switchDemoRole('editor')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Switch to Editor (Sophia)</span>
              </button>
            </div>
          </div>

          <button
            onClick={onNavigateToAccount}
            className="text-xs text-neutral-500 hover:text-neutral-900 font-semibold underline block mx-auto"
          >
            Go to My Customer Account Instead &rarr;
          </button>
        </div>
      </div>
    );
  }

  // GUEST SCREEN (NOT SIGNED IN)
  if (isGuest) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-600">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-serif text-neutral-900">Sign In Required</h1>
        <p className="text-xs text-neutral-500">
          Please authenticate with an Administrator or Editor account to access this management dashboard.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => switchDemoRole('admin')}
            className="w-full py-3 bg-neutral-900 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md"
          >
            Sign In As Demo Administrator
          </button>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3 bg-white border border-neutral-300 text-neutral-700 font-semibold text-xs rounded-xl hover:bg-neutral-50 transition-colors"
          >
            Enter Custom Credentials
          </button>
        </div>
      </div>
    );
  }

  // Product Save/Update Handler
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setIsAddProductModalOpen(false);
        setEditingProduct(null);
        fetchDashboardData();
      } else {
        alert(data.message || 'Operation failed.');
      }
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  // Product Delete Handler (Admin Only)
  const handleDeleteProduct = async (id: number) => {
    if (user.role !== 'admin') {
      alert('Restricted: Only Administrators have permission to delete products.');
      return;
    }

    if (!confirm('Are you sure you want to delete this product? This action is permanent.')) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // Order Status Update Handler
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: status as any } : o))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // User Role Update Handler
  const handleUpdateUserRole = async (targetUserId: number, newRole: UserRole) => {
    if (user.role !== 'admin') return;

    try {
      const res = await fetch(`/api/users/${targetUserId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
        );
        alert('User role updated successfully.');
      }
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-8">
      {/* Dashboard Top Header */}
      <div className="bg-neutral-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              {user.role === 'admin' ? 'Full Administrator Access' : 'Editor Access'}
            </span>
            <span className="text-xs text-neutral-400">&bull; Session Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-serif mt-2">
            Essence Management Center
          </h1>
          <p className="text-xs text-neutral-300 mt-1 max-w-xl">
            Logged in as <strong className="text-white">{user.name}</strong> ({user.email}). All database transactions executed with prepared statements.
          </p>
        </div>

        {/* Top Control Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            ...(user.role === 'admin' ? [{ id: 'users', label: 'User Roles', icon: Users }] : [])
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-rose-600 text-white shadow-lg'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. COMPREHENSIVE ANALYTICS TAB */}
      {/* ======================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Filter Range & Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold font-serif text-neutral-900">Performance &amp; User Behavior Trends</h2>
              <p className="text-xs text-neutral-500">Real-time revenue metrics, order velocity, and visitor telemetry.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-white border border-neutral-200 rounded-xl p-1 flex text-xs font-semibold shadow-xs">
                {(['7d', '30d', '90d', 'all'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1 rounded-lg uppercase tracking-wider text-[11px] transition-all ${
                      timeRange === r ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchDashboardData}
                className="p-2 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl text-neutral-600 shadow-xs"
                title="Refresh analytics"
              >
                <RefreshCw className={`w-4 h-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">₹</div>
              </div>
              <p className="text-2xl font-black text-neutral-900">
                ₹{(analytics?.stats.totalRevenue || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +14.8% vs last cycle
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-neutral-900">
                {analytics?.stats.totalOrders || 0}
              </p>
              <span className="text-[11px] text-neutral-400 font-medium">
                {analytics?.stats.deliveredOrders || 0} Delivered &bull; {analytics?.stats.pendingOrders || 0} Active
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-bold uppercase tracking-wider">Avg Order Value</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-neutral-900">
                ₹{(analytics?.stats.averageOrderValue || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-neutral-400 font-medium">
                Conversion: <strong className="text-emerald-600">{analytics?.stats.conversionRate || '3.4%'}</strong>
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-bold uppercase tracking-wider">Active Customers</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-neutral-900">
                {analytics?.stats.totalCustomers || 0}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> High retention rate
              </span>
            </div>
          </div>

          {/* Interactive Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trends Chart (2 Cols) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Revenue Trajectory ({timeRange.toUpperCase()})</h3>
                  <p className="text-[11px] text-neutral-400">Daily sales captured via Razorpay and prepaid checkouts</p>
                </div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                  Real-time Data
                </span>
              </div>

              {/* Visual Bars Chart */}
              <div className="h-56 flex items-end gap-2 pt-8 pb-2 border-b border-neutral-100">
                {analytics?.salesTrends && analytics.salesTrends.length > 0 ? (
                  analytics.salesTrends.map((trend, i) => {
                    const maxRev = Math.max(...analytics.salesTrends.map((t) => t.revenue), 5000);
                    const heightPercent = Math.max(15, Math.round((trend.revenue / maxRev) * 100));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <div
                          className="w-full bg-gradient-to-t from-rose-600 to-pink-400 rounded-t-md group-hover:from-neutral-900 group-hover:to-neutral-700 transition-all cursor-pointer relative"
                          style={{ height: `${heightPercent}%` }}
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-md">
                            ₹{trend.revenue.toLocaleString('en-IN')} ({trend.orders} orders)
                          </div>
                        </div>
                        <span className="text-[10px] text-neutral-400 truncate w-full text-center">
                          {trend.date.slice(5)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                    No order transactions recorded in this window.
                  </div>
                )}
              </div>
            </div>

            {/* Device & User Behavior Telemetry (1 Col) */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">User Device Breakdown</h3>
              <p className="text-[11px] text-neutral-400">Traffic distribution across mobile, desktop, and tablets.</p>

              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-neutral-700">
                    <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-rose-500" /> Mobile Devices</span>
                    <span>58%</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '58%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-neutral-700">
                    <span className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-blue-500" /> Desktop / Mac</span>
                    <span>34%</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '34%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-neutral-700">
                    <span className="flex items-center gap-1.5"><Tablet className="w-3.5 h-3.5 text-amber-500" /> Tablets &amp; iPad</span>
                    <span>8%</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '8%' }} />
                  </div>
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="pt-4 border-t border-neutral-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">Fulfillment Health</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-emerald-50 rounded-xl">
                    <span className="text-emerald-700 font-bold block">{analytics?.orderBreakdown.delivered_orders || 0}</span>
                    <span className="text-[10px] text-emerald-600">Delivered</span>
                  </div>
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <span className="text-blue-700 font-bold block">{analytics?.orderBreakdown.shipped_orders || 0}</span>
                    <span className="text-[10px] text-blue-600">In Transit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Products & Real-Time Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products Table */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Best Performing Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase text-[10px]">
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Units Sold</th>
                      <th className="pb-3 text-right">Gross Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                      analytics.topProducts.map((p, i) => (
                        <tr key={i} className="hover:bg-neutral-50/50">
                          <td className="py-2.5 flex items-center gap-2.5">
                            <img src={p.image} alt={p.product_name} className="w-8 h-10 object-cover rounded bg-neutral-100" />
                            <span className="font-semibold text-neutral-800 line-clamp-1">{p.product_name}</span>
                          </td>
                          <td className="py-2.5 font-bold text-neutral-700">{p.units_sold}</td>
                          <td className="py-2.5 text-right font-black text-neutral-900">
                            ₹{p.total_sales.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-neutral-400">No sales records yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900">Real-Time Activity Telemetry</h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>

              <div className="space-y-3">
                {analytics?.recentLogs && analytics.recentLogs.length > 0 ? (
                  analytics.recentLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${
                          log.event_type === 'order_placed' ? 'bg-emerald-500' : log.event_type === 'login' ? 'bg-blue-500' : 'bg-neutral-400'
                        }`} />
                        <div>
                          <p className="font-semibold text-neutral-800 capitalize">
                            {log.event_type.replace('_', ' ')}: <span className="font-normal text-neutral-500">{log.page_url}</span>
                          </p>
                          <span className="text-[10px] text-neutral-400">
                            {log.user_name || 'Guest Visitor'} ({log.device_type || 'web'})
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">{log.created_at.slice(11, 16)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400 text-center py-4">No events logged yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PRODUCT MANAGEMENT TAB */}
      {/* ======================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-neutral-900">Product Catalog Management</h2>
              <p className="text-xs text-neutral-500">
                Add, modify and manage stock levels. (Protected with prepared statement queries).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filter products..."
                  className="pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                />
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    brand_id: 1,
                    category_id: 1,
                    price: 1999,
                    old_price: 2499,
                    stock_quantity: 20,
                    material: '100% Organic Cotton',
                    description: '',
                    image: '/img/product-img/product-1.jpg',
                    is_featured: false,
                    is_popular: true
                  });
                  setIsAddProductModalOpen(true);
                }}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50/80 border-b border-neutral-100 text-neutral-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Inventory</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {products
                    .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()))
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-12 object-cover rounded bg-neutral-100 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/img/product-img/product-1.jpg';
                            }}
                          />
                          <div>
                            <span className="font-semibold text-neutral-800 block line-clamp-1">{p.name}</span>
                            <span className="text-[10px] text-neutral-400">{p.material}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-neutral-600">{p.sku}</td>
                        <td className="py-3 px-4 font-medium text-neutral-700">{p.brand_name || 'Essence'}</td>
                        <td className="py-3 px-4 capitalize text-neutral-600">{p.category_name || 'Clothing'}</td>
                        <td className="py-3 px-4 font-bold text-neutral-900">₹{p.price.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.stock_quantity > 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {p.stock_quantity} in stock
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductForm({
                                  name: p.name,
                                  brand_id: p.brand_id,
                                  category_id: p.category_id,
                                  price: p.price,
                                  old_price: p.old_price || 0,
                                  stock_quantity: p.stock_quantity,
                                  material: p.material || '',
                                  description: p.description || '',
                                  image: p.image,
                                  is_featured: p.is_featured === 1,
                                  is_popular: p.is_popular === 1
                                });
                                setIsAddProductModalOpen(true);
                              }}
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete Product (Admin only, Editor is restricted) */}
                            {user.role === 'admin' ? (
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                                title="Delete product (Admin only)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span
                                className="p-1.5 text-neutral-300 cursor-not-allowed"
                                title="Restricted: Only Administrators can delete products"
                              >
                                <Trash2 className="w-4 h-4" />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ORDER MANAGEMENT TAB */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-neutral-900">Customer Orders &amp; Fulfillment</h2>
              <p className="text-xs text-neutral-500">Live transaction records, delivery status updates, and Razorpay logs.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500">Status Filter:</span>
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-neutral-800"
              >
                <option value="all">All Orders ({orders.length})</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50/80 border-b border-neutral-100 text-neutral-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status &amp; Update</th>
                    <th className="py-3 px-4 text-right">Inspection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders
                    .filter((o) => orderFilter === 'all' || o.status === orderFilter)
                    .map((o) => (
                      <tr key={o.id} className="hover:bg-neutral-50/50">
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                          {o.order_number}
                          <span className="block text-[10px] text-neutral-400 font-sans font-normal">{o.created_at.slice(0, 10)}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-neutral-800 block">{o.customer_name}</span>
                          <span className="text-[10px] text-neutral-400">{o.customer_email}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            o.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {o.payment_status} ({o.payment_method})
                          </span>
                          {o.razorpay_payment_id && (
                            <span className="block text-[9px] font-mono text-neutral-400 truncate max-w-[120px]">
                              {o.razorpay_payment_id}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-neutral-900">
                          ₹{o.total.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrderDetails(o)}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-xs font-semibold"
                          >
                            View Items
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. USER & ROLE MANAGEMENT (Admin Only) */}
      {/* ======================================================== */}
      {activeTab === 'users' && user.role === 'admin' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-lg font-bold font-serif text-neutral-900">User Role Administration</h2>
            <p className="text-xs text-neutral-500">
              Assign and modify roles (Admin, Editor, Subscriber) for system users.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50/80 border-b border-neutral-100 text-neutral-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Current Role</th>
                    <th className="py-3 px-4">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50/50">
                      <td className="py-3 px-4 font-mono text-neutral-400">#{u.id}</td>
                      <td className="py-3 px-4 font-semibold text-neutral-800">{u.name}</td>
                      <td className="py-3 px-4 text-neutral-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-rose-100 text-rose-700' : u.role === 'editor' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value as UserRole)}
                          className="bg-neutral-50 border border-neutral-300 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-800"
                        >
                          <option value="admin">Administrator</option>
                          <option value="editor">Editor</option>
                          <option value="subscriber">Subscriber</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-100 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-900 text-white">
              <h3 className="text-base font-bold font-serif">
                {editingProduct ? 'Edit Product Details' : 'Add New Fashion Item'}
              </h3>
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Silk Georgette Evening Dress"
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Brand *</label>
                  <select
                    value={productForm.brand_id}
                    onChange={(e) => setProductForm({ ...productForm, brand_id: Number(e.target.value) })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Category *</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: Number(e.target.value) })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Old Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.old_price}
                    onChange={(e) => setProductForm({ ...productForm, old_price: Number(e.target.value) })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: Number(e.target.value) })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Material Composition</label>
                <input
                  type="text"
                  value={productForm.material}
                  onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                  placeholder="e.g. 100% Organic Silk"
                  className="w-full p-2.5 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Image URL / Asset Path</label>
                <input
                  type="text"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="/img/product-img/product-1.jpg"
                  className="w-full p-2.5 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detailed tailoring and styling notes..."
                  className="w-full p-2.5 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    className="rounded text-rose-600 accent-rose-600"
                  />
                  <span>Featured Collection</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={productForm.is_popular}
                    onChange={(e) => setProductForm({ ...productForm, is_popular: e.target.checked })}
                    className="rounded text-rose-600 accent-rose-600"
                  />
                  <span>Popular In Store</span>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-neutral-900 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Inspection Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-100">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-900 text-white">
              <div>
                <span className="text-[10px] font-mono text-rose-400 font-bold block">ORDER INSPECTION</span>
                <h3 className="text-sm font-bold font-serif">{selectedOrderDetails.order_number}</h3>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 space-y-1">
                <p><strong>Customer:</strong> {selectedOrderDetails.customer_name} ({selectedOrderDetails.customer_email})</p>
                <p><strong>Phone:</strong> {selectedOrderDetails.customer_phone}</p>
                <p><strong>Shipping:</strong> {selectedOrderDetails.shipping_address}, {selectedOrderDetails.city}, {selectedOrderDetails.state} - {selectedOrderDetails.pincode}</p>
                <p><strong>Payment Status:</strong> <span className="font-bold uppercase text-emerald-700">{selectedOrderDetails.payment_status}</span> ({selectedOrderDetails.payment_method})</p>
                {selectedOrderDetails.razorpay_payment_id && (
                  <p><strong>Razorpay ID:</strong> <code className="bg-white px-1.5 py-0.5 rounded">{selectedOrderDetails.razorpay_payment_id}</code></p>
                )}
              </div>

              <div>
                <span className="font-bold text-neutral-800 block mb-2">Itemized List:</span>
                <div className="space-y-2">
                  {selectedOrderDetails.items?.map((it, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-neutral-100">
                      <div className="flex items-center gap-2">
                        <img src={it.image || '/img/product-img/product-1.jpg'} alt="" className="w-8 h-10 object-cover rounded bg-neutral-100" />
                        <div>
                          <p className="font-semibold text-neutral-800">{it.product_name}</p>
                          <p className="text-[10px] text-neutral-400">Qty: {it.quantity} &bull; Size: {it.size}</p>
                        </div>
                      </div>
                      <span className="font-bold text-neutral-900">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between font-bold text-sm pt-2 border-t border-neutral-100">
                <span>Total Order Value:</span>
                <span className="text-rose-600">₹{selectedOrderDetails.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
