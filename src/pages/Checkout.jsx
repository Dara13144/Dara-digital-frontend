import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Wallet,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  QrCode,
  Sparkles,
  ExternalLink,
  Check,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTelegram } from '../hooks/useTelegram.js';
import { endpoints } from '../services/api.js';
import { Modal } from '../components/common/Modal.jsx';
import { KhqrPaymentCard } from '../components/payment/KhqrPaymentCard.jsx';
import { TopUpModal } from '../components/payment/TopUpModal.jsx';

export function Checkout() {
  const { items, finalTotal, subtotal, discountAmount, couponCode, clearCart } = useCart();
  const { user, refreshProfile } = useAuth();
  const { lang, t } = useLanguage();
  const toast = useToast();
  const { haptic } = useTelegram();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('cutluy_khqr');
  const [customerNotes, setCustomerNotes] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live KHQR Payment State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePayment, setActivePayment] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);

  // Top Up Modal State
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(null);

  if (!items.length && !pendingOrder) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-400">
          {lang === 'km' ? 'មិនមានទំនិញដែលបានជ្រើសរើសទេ' : 'No product selected.'}
        </p>
        <Link to="/shop" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-glow-green">
          {lang === 'km' ? 'មើលទំនិញដើម្បីទិញ' : 'Browse Catalog'}
        </Link>
      </div>
    );
  }

  const userBalance = Number(user?.balance || 0);
  const canPayWithWallet = userBalance >= finalTotal;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!agreedTerms) {
      toast.warning('Please agree to the delivery terms before proceeding.');
      return;
    }

    setIsSubmitting(true);
    haptic('medium');

    try {
      // Step 1: Create PENDING_PAYMENT order
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.id || i.product_id,
          quantity: i.quantity
        })),
        couponCode: couponCode || undefined,
        paymentMethod: paymentMethod === 'wallet' ? 'wallet' : 'cutluy_khqr',
        customerNotes: customerNotes.trim() || undefined
      };

      const orderRes = await endpoints.checkout(orderPayload);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.error?.message || 'Failed to create order.');
      }

      const order = orderRes.data;
      setPendingOrder(order);

      // Step 2: Payment flow
      if (paymentMethod === 'wallet') {
        // Pay directly with Wallet balance
        const payRes = await endpoints.payWithWallet(order.id);
        if (payRes.success) {
          clearCart();
          await refreshProfile();
          haptic('success');
          toast.success('Order completed with Wallet balance!');
          navigate(`/orders/${order.id}`);
        } else {
          throw new Error(payRes.error?.message || 'Wallet payment failed.');
        }
      } else {
        // Step 3: Initiate CutLuy Live KHQR Payment
        const cutluyRes = await endpoints.createCutLuyPayment(order.id);
        if (!cutluyRes.success || !cutluyRes.data) {
          throw new Error(cutluyRes.error?.message || 'Failed to initiate KHQR payment.');
        }

        const paymentData = cutluyRes.data;
        setActivePayment(paymentData);
        setIsPaymentModalOpen(true);
      }
    } catch (err) {
      haptic('error');
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (completedOrder) => {
    clearCart();
    await refreshProfile();
    setIsPaymentModalOpen(false);
    toast.success('🎉 Payment Received! Digital products delivered.');
    navigate(`/orders/${completedOrder?.id || pendingOrder?.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/cart')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          <span>{t('checkout.title')}</span>
        </h1>
      </div>

      <form onSubmit={handleCheckoutSubmit} className="space-y-5">
        {/* Payment Method Selection */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-300">
            {t('checkout.paymentMethod')}
          </label>

          {/* Option 1: CutLuy Bakong KHQR */}
          <div
            onClick={() => {
              haptic('selection');
              setPaymentMethod('cutluy_khqr');
            }}
            className={`p-4 rounded-2xl glass-card cursor-pointer border transition-all ${
              paymentMethod === 'cutluy_khqr'
                ? 'border-emerald-500/80 bg-emerald-500/10 shadow-glow-green'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-red-500/40 shadow-glow-red flex-shrink-0 bg-white flex items-center justify-center p-1">
                  <img
                    src="/aba_khqr.png"
                    alt="ABA KHQR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-100">ABA KHQR</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                      AUTO-DETECT
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Scan with ABA Bank, ACLEDA, Bakong, Canadia, Wing, or any Cambodian banking app.
                  </p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'cutluy_khqr'
                    ? 'border-emerald-400 bg-emerald-400'
                    : 'border-slate-600'
                }`}
              >
                {paymentMethod === 'cutluy_khqr' && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
              </div>
            </div>
          </div>

          {/* Option 2: Internal Wallet Balance */}
          <div
            onClick={() => {
              haptic('selection');
              setPaymentMethod('wallet');
            }}
            className={`p-4 rounded-2xl glass-card cursor-pointer border transition-all ${
              paymentMethod === 'wallet'
                ? 'border-emerald-500/80 bg-emerald-500/10 shadow-glow-green'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center p-1.5 flex-shrink-0 shadow-glow-cyan">
                  <img src="/wallet-icon.png" alt="Wallet" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-100">{t('common.payWallet')}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                      Balance: ${userBalance.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('checkout.walletDesc')}
                  </p>
                  {!canPayWithWallet && (
                    <div className="mt-2 space-y-1.5">
                      <p className="text-[11px] text-rose-400 font-bold">
                        Insufficient wallet balance (${userBalance.toFixed(2)} / Required: ${finalTotal.toFixed(2)})
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          haptic('medium');
                          setTopUpAmount((finalTotal - userBalance).toFixed(2));
                          setTopUpOpen(true);
                        }}
                        className="py-1 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] inline-flex items-center gap-1 shadow-sm transition-all active:scale-95"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                        <span>Top Up +${(finalTotal - userBalance).toFixed(2)} with ABA KHQR</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'wallet'
                    ? 'border-emerald-400 bg-emerald-400'
                    : 'border-slate-600'
                }`}
              >
                {paymentMethod === 'wallet' && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Breakdown */}
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Items Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Coupon Discount ({couponCode})</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-slate-100 pt-2 border-t border-slate-800">
            <span>Final Amount</span>
            <span className="text-emerald-400">${finalTotal.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500/20 bg-slate-900 border-slate-700"
          />
          <span>{t('checkout.agreeTerms')}</span>
        </label>

        {/* Pay Button */}
        <button
          type="submit"
          disabled={isSubmitting || (paymentMethod === 'wallet' && !canPayWithWallet)}
          className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-glow-green flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>{t('common.loading')}</span>
          ) : paymentMethod === 'wallet' ? (
            <>
              <Wallet className="w-4 h-4" />
              <span>Pay ${finalTotal.toFixed(2)} from Wallet</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>{t('common.payNow')} (${finalTotal.toFixed(2)})</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-Bit Encrypted & Instant Delivery Guarantee</span>
        </div>
      </form>

      {/* Live KHQR Auto-Checking Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Scan to Pay with Bakong KHQR"
        maxWidth="max-w-md"
      >
        {activePayment && (
          <KhqrPaymentCard
            paymentId={activePayment.paymentId}
            orderId={pendingOrder?.id}
            qrString={activePayment.qrString}
            checkoutUrl={activePayment.checkoutUrl}
            amount={activePayment.amount}
            currency={activePayment.currency}
            merchantName="Dara Digital Store"
            expiresAt={activePayment.expiresAt}
            onPaid={handlePaymentSuccess}
            onCancel={() => setIsPaymentModalOpen(false)}
          />
        )}
      </Modal>

      {/* Top Up Modal for Wallet */}
      <TopUpModal
        isOpen={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        initialAmount={topUpAmount}
        onSuccess={async () => {
          await refreshProfile();
          setPaymentMethod('wallet');
        }}
      />
    </div>
  );
}
