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
  Plus,
  Minus,
  Trash2
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
import { RobloxUserChecker } from '../components/roblox/RobloxUserChecker.jsx';

export function Checkout() {
  const { items, finalTotal, subtotal, discountAmount, couponCode, clearCart, removeFromCart, updateQuantity, serverCart } = useCart();
  const { user, refreshProfile, openAuthModal } = useAuth();
  const { lang, t } = useLanguage();
  const toast = useToast();
  const { haptic } = useTelegram();
  const navigate = useNavigate();

  const topUpNoteFromItems = items.find((i) => i.customerNotes)?.customerNotes || '';
  const savedTopUpNote = typeof window !== 'undefined' ? (localStorage.getItem('daramini_topup_note') || '') : '';
  const initialNote = topUpNoteFromItems || savedTopUpNote;
  const [customerNotes, setCustomerNotes] = useState(initialNote);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cutluy_khqr'); // 'cutluy_khqr' | 'wallet'

  const [robloxInput, setRobloxInput] = useState(() => {
    try {
      const savedUser = localStorage.getItem('daramini_roblox_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return parsed.username || '';
      }
    } catch (e) {}
    if (initialNote) {
      const match = initialNote.match(/@([a-zA-Z0-9_]+)/) || initialNote.match(/Roblox.*?: (.*?)(\||$)/i);
      if (match) return match[1].trim();
    }
    return '';
  });
  const [verifiedRobloxUser, setVerifiedRobloxUser] = useState(() => {
    try {
      const saved = localStorage.getItem('daramini_roblox_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const hasRobloxItem = items.some((i) => 
    i.customerNotes?.toLowerCase().includes('roblox') ||
    i.name?.toLowerCase().includes('robux') ||
    i.name?.toLowerCase().includes('blox') ||
    i.name?.toLowerCase().includes('top-up') ||
    i.categorySlug === 'topup'
  ) || Boolean(robloxInput || verifiedRobloxUser);

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

  const userBalance = Number(user?.wallet_balance ?? user?.balance ?? 0);
  const canPayWithWallet = userBalance >= finalTotal;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please sign in with Google to complete your order.');
      openAuthModal();
      return;
    }

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
        {/* Order Items Preview with Delete System */}
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Selected Items ({items.length})
            </h3>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  haptic('medium');
                  if (window.confirm('Are you sure you want to clear all selected items?')) {
                    clearCart();
                  }
                }}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                title="Clear all items"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-800/60">
            {items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs gap-3 group">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-1 shrink-0">
                    <img
                      src={item.image_url || '/categories/topup.png'}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-100 truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400">Qty:</span>
                      {/* Quantity Controls */}
                      <div className="inline-flex items-center border border-slate-700/80 rounded-lg bg-slate-900/90 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            haptic('light');
                            updateQuantity(item.id, item.quantity - 1);
                          }}
                          className="px-1.5 py-0.5 text-slate-400 hover:text-white hover:bg-slate-800 text-[10px] transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="px-1.5 text-[10px] font-bold text-slate-200 min-w-[16px] text-center font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            haptic('light');
                            updateQuantity(item.id, item.quantity + 1);
                          }}
                          className="px-1.5 py-0.5 text-slate-400 hover:text-white hover:bg-slate-800 text-[10px] transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {(() => {
                    const serverItem = serverCart?.items?.find((si) => si.product_id === item.id);
                    const liveUnitPrice = serverItem ? Number(serverItem.unit_price) : Number(item.price);
                    const lineTotal = liveUnitPrice * item.quantity;
                    return (
                      <span className="font-black text-emerald-400 text-sm">
                        ${lineTotal.toFixed(2)}
                      </span>
                    );
                  })()}
                  {/* Delete Item Button */}
                  <button
                    type="button"
                    onClick={() => {
                      haptic('medium');
                      removeFromCart(item.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/40 transition-all cursor-pointer active:scale-95"
                    title={`Delete "${item.name}" from selected items`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roblox Account Delivery Verification */}
        {hasRobloxItem && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#140e1b] border border-pink-500/40 shadow-[0_0_25px_rgba(236,72,153,0.15)] space-y-3">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center p-1 shadow-sm">
                <img src="/icons/robux_gold.png" alt="Roblox" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <span>Roblox Delivery Target</span>
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold border border-pink-500/30">
                    Live Check
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Enter and verify your Roblox username. Robux will be sent to this avatar.
                </p>
              </div>
            </div>

            <RobloxUserChecker
              value={robloxInput}
              onChange={(val) => {
                setRobloxInput(val);
                if (!val.trim()) {
                  setCustomerNotes('');
                }
              }}
              onVerified={(u) => {
                setVerifiedRobloxUser(u);
                if (u) {
                  setCustomerNotes(`Roblox: ${u.displayName} (@${u.username}) | ID: ${u.id}`);
                }
              }}
            />
          </div>
        )}

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
            merchantName="Maiser Store"
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
