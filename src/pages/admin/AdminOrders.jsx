import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  RotateCw,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { endpoints } from '../../services/api.js';
import { Badge } from '../../components/common/Badge.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await endpoints.admin.getOrders({
        status: statusFilter || undefined,
        search: search || undefined,
        limit: 50
      });
      if (res.success && res.data) {
        setOrders(res.data.items || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, search]);

  const handleRetryDelivery = async (orderId) => {
    try {
      const res = await endpoints.admin.retryDelivery(orderId);
      if (res.success && res.data.success) {
        toast.success('Stock delivered and order completed!');
      } else {
        toast.warning(res.data?.message || 'Stock delivery retry pending.');
      }
      loadOrders();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-emerald-400" />
          <span>Orders Management</span>
        </h2>
        <p className="text-xs text-slate-400">
          View all store transactions, review customer deliveries, and manage error recoveries.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number (#ORD-...)"
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 outline-none focus:border-emerald-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-100 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
          <option value="STOCK_ERROR">STOCK_ERROR (Action Needed)</option>
          <option value="FAILED">FAILED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((o) => {
                  const isStockError = o.status === 'STOCK_ERROR';

                  return (
                    <tr key={o.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        #{o.order_number}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-300">
                          @{o.user?.username || o.user?.telegram_id || 'User'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {o.items?.length || 0} item(s)
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-400">
                        ${Number(o.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] text-slate-400 font-bold">
                        {o.payment_method}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            o.status === 'COMPLETED'
                              ? 'success'
                              : isStockError
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {o.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isStockError && (
                            <button
                              onClick={() => handleRetryDelivery(o.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold text-[11px] flex items-center gap-1"
                              title="Retry Delivery"
                            >
                              <RotateCw className="w-3 h-3" />
                              <span>Retry</span>
                            </button>
                          )}
                          <Link
                            to={`/admin/orders/${o.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
