import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, ExternalLink, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { endpoints } from '../services/api.js';
import { Badge } from '../components/common/Badge.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTelegram } from '../hooks/useTelegram.js';

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { lang, t } = useLanguage();
  const { haptic } = useTelegram();

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const res = await endpoints.getMyOrders({ limit: 50 });
        if (res.success && res.data) {
          setOrders(res.data.items || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        {t('common.loading')}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
          <Package className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-slate-100">{t('orders.noOrders')}</h2>
        <p className="text-xs text-slate-400">Your purchased digital codes will appear here.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow-green"
        >
          <span>{t('cart.startShopping')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
        <Package className="w-5 h-5 text-emerald-400" />
        <span>{t('orders.title')}</span>
      </h1>

      <div className="space-y-3">
        {orders.map((order) => {
          const isCompleted = order.status === 'COMPLETED';

          return (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              onClick={() => haptic('selection')}
              className="block p-4 rounded-2xl glass-card border border-slate-800 hover:border-emerald-500/40 transition-all transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-200">
                    #{order.order_number}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Badge
                  variant={
                    isCompleted
                      ? 'success'
                      : order.status === 'STOCK_ERROR'
                      ? 'danger'
                      : order.status.includes('CANCEL')
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {order.status}
                </Badge>
              </div>

              {/* Items summary */}
              <div className="space-y-1 mb-3">
                {order.items?.map((item) => (
                  <p key={item.id} className="text-xs text-slate-300 line-clamp-1">
                    • {item.product_name} <span className="text-slate-400">× {item.quantity}</span>
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">Total:</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-emerald-400">
                    ${Number(order.total_amount).toFixed(2)} USD
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
