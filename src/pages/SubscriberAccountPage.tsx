import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Order } from '../types';
import {
  User,
  ShoppingBag,
  Package,
  Heart,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  LogOut,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface SubscriberAccountPageProps {
  onNavigateToShop: () => void;
  onNavigateToWishlist: () => void;
}

export const SubscriberAccountPage: React.FC<SubscriberAccountPageProps> = ({
  onNavigateToShop,
  onNavigateToWishlist
}) => {
  const { user, token, logout } = useAuth();
  const { wishlistIds } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching subscriber orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold font-serif text-neutral-900">Please Sign In</h2>
        <p className="text-xs text-neutral-500">Log in to view your orders, saved addresses, and profile.</p>
        <button
          onClick={onNavigateToShop}
          className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn space-y-8">
      {/* Header Banner */}
      <div className="bg-neutral-900 text-white p-6 md:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {user.role.toUpperCase()} ACCOUNT
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif mt-1">{user.name}</h1>
            <p className="text-xs text-neutral-300">{user.email} &bull; {user.phone || '+91 98765 43210'}</p>
          </div>
        </div>

        {/* Quick Tabs & Sign Out */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders' ? 'bg-white text-neutral-900' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile' ? 'bg-white text-neutral-900' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Profile &amp; Details
          </button>
          <button
            onClick={logout}
            className="p-2 bg-neutral-800 hover:bg-rose-600 text-neutral-300 hover:text-white rounded-xl text-xs transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif text-neutral-900">Your Order History</h2>
            <button
              onClick={onNavigateToShop}
              className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <span>Explore More Styles</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-neutral-500">Loading your purchase records...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-neutral-100 shadow-xs max-w-md mx-auto">
              <Package className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-800">No Orders Yet</h3>
              <p className="text-xs text-neutral-500 mt-1">
                You haven't placed any orders yet. Discover our latest collections today!
              </p>
              <button
                onClick={onNavigateToShop}
                className="mt-5 px-5 py-2.5 bg-neutral-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const step = getStatusStep(order.status);
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-xs hover:border-neutral-200 transition-all space-y-4"
                  >
                    {/* Order summary bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4 text-xs">
                      <div>
                        <span className="font-mono font-bold text-neutral-900 text-sm">{order.order_number}</span>
                        <p className="text-neutral-400 text-[11px] mt-0.5">Placed on {order.created_at.slice(0, 10)}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {order.payment_status} ({order.payment_method})
                        </span>
                        <span className="text-base font-bold text-neutral-900">
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Progress tracker */}
                    <div className="py-2">
                      <div className="flex justify-between text-[11px] font-semibold text-neutral-600 mb-2">
                        <span className={step >= 1 ? 'text-emerald-600 font-bold' : ''}>1. Order Placed</span>
                        <span className={step >= 2 ? 'text-emerald-600 font-bold' : ''}>2. Processing</span>
                        <span className={step >= 3 ? 'text-emerald-600 font-bold' : ''}>3. Shipped &bull; In Transit</span>
                        <span className={step >= 4 ? 'text-emerald-600 font-bold' : ''}>4. Delivered</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                          style={{ width: `${(step / 4) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Items row preview */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 overflow-x-auto">
                        {order.items?.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-neutral-50 px-2 py-1.5 rounded-lg border border-neutral-100">
                            <img
                              src={it.image || '/img/product-img/product-1.jpg'}
                              alt=""
                              className="w-8 h-10 object-cover rounded"
                            />
                            <span className="text-xs font-medium text-neutral-700 max-w-[120px] truncate">
                              {it.product_name} &times; {it.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        View Full Invoice
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Profile Details Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-8 border border-neutral-100 shadow-xs max-w-xl space-y-6">
          <h2 className="text-lg font-bold font-serif text-neutral-900 border-b border-neutral-100 pb-3">
            Account Profile &amp; Preferences
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-neutral-400 block mb-0.5">Full Name</span>
              <span className="font-bold text-neutral-900 text-sm">{user.name}</span>
            </div>
            <div>
              <span className="text-neutral-400 block mb-0.5">Email Address</span>
              <span className="font-semibold text-neutral-800">{user.email}</span>
            </div>
            <div>
              <span className="text-neutral-400 block mb-0.5">Contact Phone</span>
              <span className="font-semibold text-neutral-800">{user.phone || '+91 98765 43212'}</span>
            </div>
            <div>
              <span className="text-neutral-400 block mb-0.5">Account Role</span>
              <span className="inline-block bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded uppercase">
                {user.role}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block mb-0.5">Saved Delivery Address</span>
              <span className="font-medium text-neutral-700 block">
                42 Rosewood Boulevard, Apartment 3B, Mumbai, Maharashtra - 400050
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-100 p-6 md:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-rose-600 block">OFFICIAL ESSENCE INVOICE</span>
                <h3 className="text-xl font-bold font-serif text-neutral-900">{selectedOrder.order_number}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-neutral-800 text-sm font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <span className="text-neutral-500">Delivery Address</span>
                <span className="font-medium text-neutral-800 text-right max-w-[200px]">
                  {selectedOrder.shipping_address}, {selectedOrder.city}
                </span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <span className="text-neutral-500">Payment Status</span>
                <span className="font-bold text-emerald-600 uppercase">{selectedOrder.payment_status} ({selectedOrder.payment_method})</span>
              </div>
              {selectedOrder.razorpay_payment_id && (
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500">Razorpay Transaction ID</span>
                  <span className="font-mono text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded">
                    {selectedOrder.razorpay_payment_id}
                  </span>
                </div>
              )}

              <div className="pt-2">
                <span className="font-bold text-neutral-800 block mb-2">Order Items:</span>
                <div className="space-y-2">
                  {selectedOrder.items?.map((it, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-neutral-50 rounded-lg">
                      <span>{it.product_name} &times; {it.quantity} ({it.size})</span>
                      <span className="font-bold text-neutral-900">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-base font-bold pt-3 border-t border-neutral-200">
                <span>Grand Total:</span>
                <span className="text-rose-600">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-3 bg-neutral-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
