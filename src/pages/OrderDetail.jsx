import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  KeyRound,
  AlertTriangle,
  ArrowLeft,
  PackageCheck,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { endpoints } from '../services/api.js';
import { Badge } from '../components/common/Badge.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTelegram } from '../hooks/useTelegram.js';
import { KhqrPaymentCard } from '../components/payment/KhqrPaymentCard.jsx';
import { Modal } from '../components/common/Modal.jsx';

export function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePayment, setActivePayment] = useState(null);
  const [initiatingPay, setInitiatingPay] = useState(false);

  const { lang, t } = useLanguage();
  const toast = useToast();
  const { haptic } = useTelegram();
  const navigate = useNavigate();

  const loadOrder = async () => {
    try {
      const [orderRes, delivRes] = await Promise.all([
        endpoints.getOrder(id),
        endpoints.getOrderDeliveries(id).catch(() => ({ data: [] }))
      ]);

      if (orderRes.success && orderRes.data) {
        setOrder(orderRes.data);
      }
      if (delivRes.success && delivRes.data) {
        setDeliveries(delivRes.data);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadOrder();
  }, [id]);

  const handlePayNow = async () => {
    setInitiatingPay(true);
    haptic('medium');
    try {
      const res = await endpoints.createCutLuyPayment(order.id);
      if (res.success && res.data) {
        setActivePayment(res.data);
        setIsPaymentModalOpen(true);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setInitiatingPay(false);
    }
  };

  const handlePaidSuccess = async () => {
    setIsPaymentModalOpen(false);
    toast.success('🎉 Payment Received! Loading your digital keys...');
    await loadOrder();
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    haptic('light');
    toast.success(t('common.copied'));
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        {t('common.loading')}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-400">Order not found.</p>
        <Link to="/orders" className="text-xs text-emerald-400 font-bold hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isCompleted = order.status === 'COMPLETED';
  const isStockError = order.status === 'STOCK_ERROR';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')}</span>
        </button>
        <Badge
          variant={
            isCompleted
              ? 'success'
              : isStockError
              ? 'danger'
              : order.status.includes('CANCEL')
              ? 'danger'
              : 'warning'
          }
        >
          {order.status}
        </Badge>
      </div>

      {/* Success banner if completed */}
      {isCompleted && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <PackageCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-100">{t('orders.thankYou')}</h2>
          <p className="text-xs text-slate-300">
            Order <code>#{order.order_number}</code> is completed. Your digital products are delivered below!
          </p>
        </div>
      )}

      {/* Pending Payment banner */}
      {(order.status === 'PENDING_PAYMENT' || order.status === 'PAYMENT_PROCESSING') && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-sm text-slate-100 block">
              Payment Pending (${Number(order.total_amount).toFixed(2)} {order.currency})
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Scan with any Cambodian banking app (ABA, Bakong, ACLEDA, Wing) to complete.
            </p>
          </div>
          <button
            onClick={handlePayNow}
            disabled={initiatingPay}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-glow-red flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
          >
            <span>Pay with KHQR Now</span>
          </button>
        </div>
      )}

      {/* Stock error alert */}
      {isStockError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <div>
            <span className="font-bold">Payment Confirmed - Delivery Pending Review</span>
            <p className="mt-0.5 text-[11px] text-rose-200/80">
              Payment was received, but stock was temporarily exhausted. Our store support team has been notified and will fulfill or refund your order shortly.
            </p>
          </div>
        </div>
      )}

      {/* Delivered Digital Secrets (Keys / Links / Accounts) */}
      {deliveries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span>{t('orders.deliveredSecrets')}</span>
          </h3>

          {deliveries.map((delivery, index) => {
            const isCopied = copiedId === delivery.id;
            const isUrl = delivery.delivery_payload.startsWith('http');

            return (
              <div
                key={delivery.id}
                className="p-4 rounded-2xl glass-panel border border-emerald-500/30 space-y-2 bg-slate-900/90"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold uppercase text-emerald-400">
                    Item {index + 1} ({delivery.delivery_type})
                  </span>
                  <span>{new Date(delivery.delivered_at).toLocaleTimeString()}</span>
                </div>

                {/* Secret payload with copy button */}
                <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 break-all select-all">
                  <span>{delivery.delivery_payload}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isUrl && (
                      <a
                        href={delivery.delivery_payload}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Open Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleCopy(delivery.delivery_payload, delivery.id)}
                      className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors"
                      title={t('common.copy')}
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Notes / Roblox Target */}
      {order.customer_notes && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/30 via-slate-900 to-slate-900 border border-pink-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-400" />
              <span>Target Account / Delivery Notes</span>
            </span>
          </div>
          <p className="font-mono text-xs font-bold text-slate-100 break-words">
            {order.customer_notes}
          </p>
        </div>
      )}

      {/* Order Items Breakdown */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card border border-slate-800 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
          Order Items & Details
        </h3>

        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-100">{item.product_name}</p>
                <p className="text-[11px] text-slate-400">
                  Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                </p>
              </div>
              <span className="font-black text-slate-200">
                ${Number(item.total_price).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span>${Number(order.subtotal).toFixed(2)}</span>
          </div>
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Discount</span>
              <span>-${Number(order.discount_amount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-slate-100 pt-2 border-t border-slate-800">
            <span>Total Paid</span>
            <span className="text-emerald-400">${Number(order.total_amount).toFixed(2)} {order.currency}</span>
          </div>
        </div>
      </div>

      {/* Need Help Support & Telegram Bot Delivery Notice */}
      <div className="p-4 rounded-2xl glass-panel border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-slate-100">
              <span>Need help or instant notifications?</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">24/7 Bot</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Contact our official bot <span className="text-sky-400 font-mono font-bold">@MaiserStore_bot</span> for instant customer support.
            </p>
          </div>
        </div>
        <a
          href="https://t.me/MaiserStore_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg flex-shrink-0"
        >
          <span>Open @MaiserStore_bot</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Live KHQR Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Scan to Pay with Bakong KHQR"
        maxWidth="max-w-md"
      >
        {activePayment && (
          <KhqrPaymentCard
            paymentId={activePayment.paymentId}
            orderId={order.id}
            qrString={activePayment.qrString}
            checkoutUrl={activePayment.checkoutUrl}
            amount={activePayment.amount}
            currency={activePayment.currency}
            merchantName="Maiser Store"
            expiresAt={activePayment.expiresAt}
            onPaid={handlePaidSuccess}
            onCancel={() => setIsPaymentModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}
