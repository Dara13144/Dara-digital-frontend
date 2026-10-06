import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  RotateCw,
  KeyRound,
  ShieldAlert,
  User,
  CreditCard,
  FileText,
  ExternalLink
} from 'lucide-react';
import { endpoints } from '../../services/api.js';
import { Badge } from '../../components/common/Badge.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const toast = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await endpoints.admin.getOrderDetail(id);
      if (res.success && res.data) {
        setOrder(res.data);
        setAdminNotes(res.data.admin_notes || '');
        setNewStatus(res.data.status);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      await endpoints.admin.updateOrderStatus(id, {
        status: newStatus,
        adminNotes: adminNotes.trim()
      });
      toast.success('Order status updated');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRetryDelivery = async () => {
    try {
      const res = await endpoints.admin.retryDelivery(id);
      if (res.success && res.data.success) {
        toast.success('Delivery retry completed successfully!');
      } else {
        toast.warning(res.data?.message || 'Delivery retry pending.');
      }
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="text-slate-400 text-xs">Loading order invoice...</div>;
  if (!order) return <div className="text-slate-400 text-xs">Order not found.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/orders')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </button>

        <Badge variant={order.status === 'COMPLETED' ? 'success' : order.status === 'STOCK_ERROR' ? 'danger' : 'warning'}>
          {order.status}
        </Badge>
      </div>

      {/* Invoice Overview Card */}
      <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-4">
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-100">
              Invoice #{order.order_number}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <span className="text-xl font-black text-emerald-400">
            ${Number(order.total_amount).toFixed(2)} {order.currency}
          </span>
        </div>

        {/* Customer & Payment Meta */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-bold text-slate-400 uppercase text-[10px] mb-1">Customer</p>
            <p className="font-semibold text-slate-200">
              @{order.user?.username || order.user?.first_name || 'Guest'}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              Telegram ID: {order.user?.telegram_id || 'N/A'}
            </p>
          </div>
          <div>
            <p className="font-bold text-slate-400 uppercase text-[10px] mb-1">Payment Method</p>
            <p className="font-semibold text-slate-200 uppercase">
              {order.payment_method}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              Tran ID: {order.payment?.transaction_id || 'N/A'}
            </p>
          </div>
        </div>

        {/* Customer / Top-Up Notes */}
        {order.customer_notes && (() => {
          const robloxUsernameMatch = order.customer_notes.match(/@([a-zA-Z0-9_]+)/);
          const robloxIdMatch = order.customer_notes.match(/ID:\s*(\d+)/i);
          const robloxProfileUrl = robloxIdMatch
            ? `https://www.roblox.com/users/${robloxIdMatch[1]}/profile`
            : robloxUsernameMatch
            ? `https://www.roblox.com/search/users?keyword=${robloxUsernameMatch[1]}`
            : null;

          return (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  ⚡ Top-Up Target Account / Customer Notes
                </p>
                {robloxProfileUrl && (
                  <a
                    href={robloxProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 text-[11px] font-bold transition-all"
                  >
                    <span>Open Roblox Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="font-mono text-xs font-bold text-amber-100 break-words">
                {order.customer_notes}
              </p>
            </div>
          );
        })()}
      </div>

      {/* Purchased Items */}
      <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-300">Items</h3>
        <div className="divide-y divide-slate-800/60">
          {order.items?.map((item) => (
            <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-200">{item.product_name}</p>
                <p className="text-[11px] text-slate-400">
                  Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)} ({item.stock_type})
                </p>
              </div>
              <span className="font-black text-slate-200">
                ${Number(item.total_price).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivered Secrets */}
      {order.deliveries?.length > 0 && (
        <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 space-y-3">
          <h3 className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4" />
            <span>Delivered Digital Secrets</span>
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {order.deliveries.map((d, i) => (
              <div key={d.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 break-all">
                <span className="text-slate-400 mr-2">[{i + 1}]</span>
                <span>{d.delivery_payload}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Actions & Status Editor */}
      <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-4 text-xs">
        <h3 className="text-xs font-black uppercase text-slate-300">Order Status & Admin Management</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-400 block mb-1">Update Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            >
              <option value="COMPLETED">COMPLETED</option>
              <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
              <option value="STOCK_ERROR">STOCK_ERROR</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          <div className="flex items-end">
            {order.status === 'STOCK_ERROR' && (
              <button
                type="button"
                onClick={handleRetryDelivery}
                className="w-full h-10 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center gap-1.5"
              >
                <RotateCw className="w-4 h-4" />
                <span>Retry Delivery</span>
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-400 block mb-1">Internal Admin Notes</label>
          <textarea
            rows={2}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add administrative notes regarding this order..."
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleUpdateStatus}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
        >
          Save Order Changes
        </button>
      </div>
    </div>
  );
}
