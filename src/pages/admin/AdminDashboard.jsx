import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  PackageCheck,
  ShieldAlert,
  ArrowRight,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';
import { endpoints } from '../../services/api.js';
import { Badge } from '../../components/common/Badge.jsx';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [flashSale, setFlashSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const [dashRes, settingsRes] = await Promise.allSettled([
          endpoints.admin.getDashboard(),
          endpoints.admin.getSettings()
        ]);

        if (dashRes.status === 'fulfilled' && dashRes.value?.success && dashRes.value.data) {
          setStats(dashRes.value.data);
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value?.success && settingsRes.value.data) {
          setFlashSale(settingsRes.value.data.flash_sale || null);
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <div className="text-slate-400 text-sm">Loading dashboard analytics...</div>;
  }

  const { overview, lowStockProducts, outOfStockProducts, recentOrders, chartDays } = stats || {};

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-100">
              ${overview?.totalRevenue?.toFixed(2) || '0.00'}
            </h3>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              +${overview?.todayRevenue?.toFixed(2) || '0.00'} today
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-100">
              {overview?.totalOrders || 0}
            </h3>
            <p className="text-[11px] text-sky-400 font-semibold mt-0.5">
              +{overview?.todayOrders || 0} today
            </p>
          </div>
        </div>

        {/* Total Customers */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-100">
              {overview?.totalUsers || 0}
            </h3>
            <p className="text-[11px] text-indigo-400 font-semibold mt-0.5">
              +{overview?.todayUsers || 0} today
            </p>
          </div>
        </div>

        {/* Active Products */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Items</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-100">
              {overview?.totalProductsCount || 0}
            </h3>
            <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
              {overview?.lowStockCount || 0} low stock alerts
            </p>
          </div>
        </div>
      </div>

      {/* Stock Warnings if low or out of stock */}
      {(overview?.outOfStockCount > 0 || overview?.lowStockCount > 0) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-black text-amber-300">Inventory Alert:</span>
            <p className="text-amber-200/80">
              {overview?.outOfStockCount} product(s) are completely out of stock, and{' '}
              {overview?.lowStockCount} product(s) have low stock remaining.
            </p>
            <Link
              to="/admin/stock"
              className="inline-flex items-center gap-1 text-emerald-400 font-bold hover:underline"
            >
              <span>Manage & Upload Stock</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Flash Sale Campaign Management Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-orange-950/20 to-slate-900 border border-rose-500/30 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />
        <div className="flex items-start sm:items-center gap-4 z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-500 p-0.5 shadow-lg flex-shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Flame className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                {flashSale?.badge || '🔥 Flash Sale Campaign'}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  flashSale?.enabled !== false
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {flashSale?.enabled !== false ? '● Live on Storefront' : '○ Paused'}
              </span>
            </div>
            <h4 className="text-base font-black text-slate-100">
              {flashSale?.title || 'Flash Sale & Hot Discounts'}
            </h4>
            <p className="text-xs text-slate-400 line-clamp-1">
              {flashSale?.subtitle || 'Set special promotional prices, timer countdowns, and featured deals.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Link
            to="/admin/flash-sale"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:via-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-900/40 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Open Flash Sale Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 7-Day Performance Chart Breakdown */}
      <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Last 7 Days Revenue & Order Trends</span>
        </h3>

        <div className="grid grid-cols-7 gap-2 pt-2">
          {chartDays?.map((day) => (
            <div
              key={day.date}
              className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center space-y-1"
            >
              <p className="text-[10px] text-slate-400 uppercase font-bold">{day.label}</p>
              <p className="text-xs font-black text-emerald-400">${day.revenue}</p>
              <p className="text-[10px] text-slate-400">{day.orders} orders</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-sky-400" />
            <span>Recent Store Orders</span>
          </h3>
          <Link
            to="/admin/orders"
            className="text-xs text-emerald-400 font-semibold hover:underline"
          >
            View All Orders
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              <tr>
                <th className="py-2.5">Order #</th>
                <th className="py-2.5">Customer</th>
                <th className="py-2.5">Amount</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5">Date</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentOrders?.map((o) => (
                <tr key={o.id} className="hover:bg-slate-900/40">
                  <td className="py-3 font-mono font-bold text-slate-200">
                    #{o.order_number}
                  </td>
                  <td className="py-3 text-slate-300">{o.customer_name}</td>
                  <td className="py-3 font-black text-emerald-400">
                    ${Number(o.total_amount).toFixed(2)}
                  </td>
                  <td className="py-3">
                    <Badge
                      variant={
                        o.status === 'COMPLETED'
                          ? 'success'
                          : o.status === 'STOCK_ERROR'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {o.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-slate-400">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/admin/orders/${o.id}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
