import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Printer,
  ShoppingBag,
  AlertCircle,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { RazorpayModal } from '../components/RazorpayModal';

interface CheckoutPageProps {
  onOrderSuccess: (orderId: number, orderNumber: string) => void;
  onNavigateToShop: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderSuccess, onNavigateToShop }) => {
  const { user } = useAuth();
  const {
    cart,
    subtotal,
    discountAmount,
    discountCode,
    finalTotal,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  // Form Fields
  const [formData, setFormData] = useState({
    name: user?.name || 'Jessica Taylor',
    email: user?.email || 'customer@essence.com',
    phone: user?.phone || '+91 98765 43210',
    address: '42 Rosewood Boulevard, Apartment 3B',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [razorpayOrderPayload, setRazorpayOrderPayload] = useState<any>(null);
  const [orderCompleted, setOrderCompleted] = useState<{
    orderNumber: string;
    total: number;
    paymentId?: string;
    date: string;
  } | null>(null);

  // Sync user profile if changed
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
      setTimeout(() => setCouponError(null), 3500);
    } else {
      setCouponInput('');
      setCouponError(null);
    }
  };

  // Real-Time Razorpay Handler
  const processRazorpayPayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Request Order Creation from Backend (calls real Razorpay REST API)
      const createOrderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`
        })
      });

      const orderData = await createOrderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to initialize payment gateway.');
      }

      const rzpOrder = orderData.order;
      const keyId = orderData.key_id;

      setRazorpayOrderPayload({
        order_id: rzpOrder.id || null,
        amount: rzpOrder.amount || Math.round(finalTotal * 100),
        currency: rzpOrder.currency || 'INR',
        key_id: keyId,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone
      });

      // Open the interactive Razorpay payment modal
      setIsRazorpayModalOpen(true);
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Razorpay process error:', err);
      alert(err.message || 'Payment initiation error.');
      setIsProcessing(false);
    }
  };

  const handleRazorpaySuccess = async (details: {
    razorpay_payment_id: string;
    razorpay_order_id: string | null;
    razorpay_signature: string;
  }) => {
    try {
      const verifyRes = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: details.razorpay_order_id,
          razorpay_payment_id: details.razorpay_payment_id,
          razorpay_signature: details.razorpay_signature
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyData.verified || verifyData.success) {
        setIsRazorpayModalOpen(false);
        await finalizeOrderCreation(details.razorpay_payment_id, details.razorpay_order_id);
      } else {
        alert('Payment verification failed.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      alert('Payment verification server error.');
    }
  };

  const handleLaunchOfficialCheckout = () => {
    if (!razorpayOrderPayload) return;

    if (typeof (window as any).Razorpay === 'function') {
      const options: any = {
        key: razorpayOrderPayload.key_id,
        amount: razorpayOrderPayload.amount,
        currency: razorpayOrderPayload.currency,
        name: 'Essence Fashion Store',
        description: `Payment for Essence Collection Order (Total: ₹${finalTotal.toLocaleString('en-IN')})`,
        image: '/img/core-img/favicon.ico',
        handler: async (response: any) => {
          await handleRazorpaySuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id || razorpayOrderPayload.order_id,
            razorpay_signature: response.razorpay_signature || ''
          });
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`
        },
        theme: {
          color: '#e11d48'
        }
      };

      if (razorpayOrderPayload.order_id && razorpayOrderPayload.order_id.startsWith('order_')) {
        options.order_id = razorpayOrderPayload.order_id;
      }

      try {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error('Failed to open Razorpay popup:', err);
        alert('Could not open external popup. Please use the instant payment options inside this window.');
      }
    } else {
      alert('Razorpay script blocked by browser extension. Please use the instant payment options.');
    }
  };

  // Finalize Order Creation in Database
  const finalizeOrderCreation = async (paymentId: string | null, rzpOrderId: string | null) => {
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          items: cart,
          discount: discountAmount,
          payment_method: paymentMethod,
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: paymentId
        })
      });

      const orderResult = await orderRes.json();

      if (orderResult.success) {
        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}

        setOrderCompleted({
          orderNumber: orderResult.orderNumber,
          total: finalTotal,
          paymentId: paymentId || undefined,
          date: new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        });

        clearCart();
        onOrderSuccess(orderResult.orderId, orderResult.orderNumber);
      } else {
        alert(orderResult.message || 'Error recording order.');
      }
    } catch (err) {
      console.error('Error recording order:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Your shopping bag is empty.');
      return;
    }

    if (paymentMethod === 'razorpay') {
      processRazorpayPayment();
    } else {
      // Cash on Delivery
      setIsProcessing(true);
      finalizeOrderCreation(null, null);
    }
  };

  // If order completed successfully, display celebration & invoice view
  if (orderCompleted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-fadeIn">
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-xl overflow-hidden p-8 md:p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Payment &amp; Order Confirmed</span>
            <h1 className="text-3xl font-black font-serif text-neutral-900 mt-1">Thank You For Your Order</h1>
            <p className="text-xs md:text-sm text-neutral-500 mt-2">
              We have dispatched your order confirmation and invoice receipt to <strong className="text-neutral-800">{formData.email}</strong>.
            </p>
          </div>

          {/* Receipt Summary Card */}
          <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80 max-w-md mx-auto text-left space-y-3 text-xs">
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500">Order Number</span>
              <span className="font-mono font-bold text-neutral-900">{orderCompleted.orderNumber}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500">Date</span>
              <span className="font-medium text-neutral-900">{orderCompleted.date}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500">Payment Gateway</span>
              <span className="font-semibold text-neutral-900 capitalize">
                {paymentMethod === 'razorpay' ? 'Razorpay (Real-Time)' : 'Cash on Delivery'}
              </span>
            </div>
            {orderCompleted.paymentId && (
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Razorpay Payment ID</span>
                <span className="font-mono text-[11px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  {orderCompleted.paymentId}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-sm font-bold">
              <span className="text-neutral-800">Total Paid</span>
              <span className="text-rose-600">₹{orderCompleted.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Order Receipt</span>
            </button>
            <button
              onClick={onNavigateToShop}
              className="px-6 py-3 bg-neutral-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Page Title */}
      <div className="border-b border-neutral-100 pb-6 mb-8 flex items-baseline justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600">Instant Real-Time Checkout</span>
          <h1 className="text-3xl font-black font-serif text-neutral-900 mt-1">Secure Checkout</h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-neutral-100 shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-neutral-800">Your bag is empty</h2>
          <p className="text-xs text-neutral-500 mt-1">Add items to proceed with the Razorpay checkout.</p>
          <button
            onClick={onNavigateToShop}
            className="mt-6 px-6 py-3 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-rose-600 transition-colors"
          >
            Explore Shop
          </button>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Shipping & Payment Details (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Contact & Shipping Information */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>Shipping &amp; Customer Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Recipient Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Jessica Taylor"
                    className="w-full p-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="customer@essence.com"
                    className="w-full p-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Mobile Phone (For delivery SMS) *</label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Street Address &amp; Apartment *</label>
                <input
                  type="text"
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="42 Rosewood Boulevard, Apartment 3B"
                  className="w-full p-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Mumbai"
                    className="w-full p-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Maharashtra"
                    className="w-full p-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="400050"
                    className="w-full p-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method Selector (Razorpay vs COD) */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>Select Payment Option</span>
              </h2>

              <div className="space-y-3">
                {/* Razorpay Option */}
                <label
                  className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="w-4 h-4 text-rose-600 accent-rose-600 mt-0.5"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-neutral-900">Razorpay Real-Time Payment</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            Verified Gateway
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, NetBanking, and Wallets.
                        </p>
                      </div>
                    </div>
                    <Smartphone className="w-5 h-5 text-neutral-400 shrink-0" />
                  </div>

                  {paymentMethod === 'razorpay' && (
                    <div className="mt-3 pt-3 border-t border-rose-200 text-xs text-rose-900/80 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Key ID: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-rose-200">rzp_test_TvDvxoy4xTNlgK</code>
                      </span>
                    </div>
                  )}
                </label>

                {/* Cash on Delivery Option */}
                <label
                  className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="w-4 h-4 text-rose-600 accent-rose-600"
                      />
                      <div>
                        <span className="font-bold text-sm text-neutral-900">Cash on Delivery (COD)</span>
                        <p className="text-xs text-neutral-500 mt-0.5">Pay via cash or UPI scan at your doorstep upon arrival.</p>
                      </div>
                    </div>
                    <Truck className="w-5 h-5 text-neutral-400 shrink-0" />
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Total (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-100 shadow-xs space-y-5 sticky top-28">
              <h3 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                Order Review ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
              </h3>

              {/* Items List */}
              <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 object-cover rounded-lg bg-neutral-100 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/img/product-img/product-1.jpg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-neutral-800 truncate">{item.name}</h4>
                      <p className="text-[11px] text-neutral-400">
                        Qty: {item.quantity} &bull; Size: {item.size || 'M'}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-neutral-900 shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="pt-2 border-t border-neutral-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Promo (ESSENCE10)"
                    className="flex-1 px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{couponError}</p>
                )}
                {discountCode && (
                  <div className="mt-2 flex items-center justify-between bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-medium">
                    <span>Coupon {discountCode} Applied</span>
                    <button type="button" onClick={removeCoupon} className="text-rose-600 font-semibold hover:underline">
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 text-xs border-t border-neutral-100 pt-3">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount Code Savings</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery Speed</span>
                  <span className="text-emerald-600 font-bold uppercase text-[10px]">Free Express Delivery</span>
                </div>
                <div className="flex justify-between text-base font-black text-neutral-900 border-t border-neutral-200 pt-3">
                  <span>Final Total</span>
                  <span className="text-rose-600">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl hover:shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting Razorpay...</span>
                  </div>
                ) : (
                  <>
                    <span>{paymentMethod === 'razorpay' ? `Pay ₹${finalTotal.toLocaleString('en-IN')} with Razorpay` : 'Confirm Order (COD)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-neutral-400 text-center space-y-1">
                <p>By placing this order, you agree to Essence Terms of Service.</p>
                <p className="text-emerald-600 font-medium flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Test Key Configured
                </p>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Razorpay Interactive Payment Gateway Modal */}
      {isRazorpayModalOpen && razorpayOrderPayload && (
        <RazorpayModal
          isOpen={isRazorpayModalOpen}
          onClose={() => setIsRazorpayModalOpen(false)}
          orderData={razorpayOrderPayload}
          onSuccess={handleRazorpaySuccess}
          onLaunchOfficialCheckout={handleLaunchOfficialCheckout}
        />
      )}
    </div>
  );
};
