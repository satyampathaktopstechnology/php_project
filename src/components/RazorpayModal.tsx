import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    order_id: string | null;
    amount: number;
    currency: string;
    key_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  onSuccess: (paymentDetails: {
    razorpay_payment_id: string;
    razorpay_order_id: string | null;
    razorpay_signature: string;
  }) => Promise<void>;
  onLaunchOfficialCheckout?: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onSuccess,
  onLaunchOfficialCheckout
}) => {
  const [paymentTab, setPaymentTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState(orderData.customer_name || 'Jessica Taylor');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');

  if (!isOpen) return null;

  const displayAmount = (orderData.amount / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const handleSimulatePayment = async () => {
    setProcessing(true);
    setProcessStep('Connecting to Razorpay Test Gateway...');

    await new Promise((r) => setTimeout(r, 600));
    setProcessStep('Authorizing transaction credentials...');

    await new Promise((r) => setTimeout(r, 700));
    setProcessStep('Verifying HMAC-SHA256 Cryptographic Signature...');

    // Generate real-style test Razorpay payment ID
    const randomHex = Math.random().toString(36).substring(2, 9);
    const mockPaymentId = `pay_${orderData.order_id ? orderData.order_id.replace('order_', '') : 'TvDvx'}_${randomHex}`;
    const testSignature = `test_sig_${Date.now()}_${randomHex}`;

    try {
      await onSuccess({
        razorpay_payment_id: mockPaymentId,
        razorpay_order_id: orderData.order_id,
        razorpay_signature: testSignature
      });
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment processing failed.');
    } finally {
      setProcessing(false);
      setProcessStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-neutral-200 relative flex flex-col">
        {/* Header - Styled like Razorpay's Standard Checkout Modal */}
        <div className="bg-[#0c2340] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close Razorpay gateway"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wider text-white flex items-center gap-1.5">
                <span className="bg-[#072654] text-[#3395ff] px-2 py-0.5 rounded font-black text-sm">R</span>
                Razorpay
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-400/30">
                TEST MODE
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-baseline justify-between">
            <div>
              <p className="text-xs text-white/70">Essence Fashion Store</p>
              <p className="text-[11px] text-white/50 font-mono">
                {orderData.order_id ? `Order: ${orderData.order_id}` : 'Direct Merchant Checkout'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-white/60 block">Amount to Pay</span>
              <span className="text-2xl font-black text-white">₹{displayAmount}</span>
            </div>
          </div>
        </div>

        {/* Payment Tabs */}
        <div className="flex border-b border-neutral-100 bg-neutral-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setPaymentTab('upi')}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              paymentTab === 'upi'
                ? 'border-[#0c2340] text-[#0c2340] bg-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>UPI / QR</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentTab('card')}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              paymentTab === 'card'
                ? 'border-[#0c2340] text-[#0c2340] bg-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Cards</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentTab('netbanking')}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              paymentTab === 'netbanking'
                ? 'border-[#0c2340] text-[#0c2340] bg-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>NetBanking</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {paymentTab === 'upi' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Enter UPI VPA / ID</label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="mobile@upi or user@okhdfcbank"
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#0c2340] font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Instant Test Apps (One-Click Approval)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Google Pay', handle: 'user@okaxis', color: 'border-blue-200 bg-blue-50/50 text-blue-700' },
                    { name: 'PhonePe', handle: 'user@ybl', color: 'border-purple-200 bg-purple-50/50 text-purple-700' },
                    { name: 'Paytm UPI', handle: 'user@paytm', color: 'border-sky-200 bg-sky-50/50 text-sky-700' }
                  ].map((app) => (
                    <button
                      key={app.name}
                      type="button"
                      onClick={() => setUpiId(app.handle)}
                      className={`p-2 rounded-xl border text-center transition-all hover:scale-105 font-medium ${app.color}`}
                    >
                      {app.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center gap-3">
                <QrCode className="w-10 h-10 text-neutral-700 shrink-0" />
                <div className="text-[11px] text-neutral-600">
                  <span className="font-bold text-neutral-900 block">QR Code Scan Supported</span>
                  <span>Instant UPI Intent &amp; Dynamic QR payment simulated seamlessly.</span>
                </div>
              </div>
            </div>
          )}

          {paymentTab === 'card' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Card Number (Test Visa/Mastercard)</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4111 2222 3333 4444"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl font-mono text-xs focus:ring-1 focus:ring-[#0c2340]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full p-2.5 border border-neutral-300 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="123"
                    className="w-full p-2.5 border border-neutral-300 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Cardholder Name"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {paymentTab === 'netbanking' && (
            <div className="space-y-3 text-xs">
              <label className="block font-bold text-neutral-700 mb-1">Select Bank</label>
              <div className="grid grid-cols-2 gap-2">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBank(b)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      selectedBank === b
                        ? 'border-[#0c2340] bg-[#0c2340]/5 font-bold text-[#0c2340]'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Processing State Message */}
          {processing && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-pulse">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>{processStep}</span>
            </div>
          )}
        </div>

        {/* Footer CTAs */}
        <div className="p-5 border-t border-neutral-100 bg-neutral-50 space-y-3">
          <button
            type="button"
            disabled={processing}
            onClick={handleSimulatePayment}
            className="w-full py-3.5 bg-[#0c2340] hover:bg-[#153a66] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {processing ? (
              <span>Authorizing with Razorpay...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{displayAmount} Securely</span>
              </>
            )}
          </button>

          {onLaunchOfficialCheckout && (
            <button
              type="button"
              onClick={onLaunchOfficialCheckout}
              className="w-full text-center py-1.5 text-xs text-neutral-500 hover:text-neutral-800 font-medium flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Or launch official Razorpay popup modal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Key ID: {orderData.key_id} &bull; PCI-DSS 256-Bit Cryptography</span>
          </div>
        </div>
      </div>
    </div>
  );
};
