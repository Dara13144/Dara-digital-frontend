import React, { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { endpoints } from '../../services/api.js';
import { Badge } from '../../components/common/Badge.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadPayments() {
      setLoading(true);
      try {
        const res = await endpoints.admin.getPayments({
          status: status || undefined,
          limit: 50
        });
        if (res.success && res.data) {
          setPayments(res.data.items || []);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, [status]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-400" />
          <span>Payment Gateway Transactions</span>
        </h2>
        <p className="text-xs text-slate-400">
          Inspect ABA PayWay and Wallet payment transaction logs.
        </p>
      </div>

      <div className="flex gap-3 max-w-xs">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-100 outline-none"
        >
          <option value="">All Payment Statuses</option>
          <option value="PAID">PAID</option>
          <option value="PENDING">PENDING</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="FAILED">FAILED</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4">Paid At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400 font-sans">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-bold text-slate-200">
                      {p.transaction_id}
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] text-slate-300 font-sans font-bold">
                      {p.gateway}
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-400 font-sans">
                      ${Number(p.amount).toFixed(2)} {p.currency}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <Badge variant={p.status === 'PAID' ? 'success' : p.status === 'PENDING' ? 'warning' : 'danger'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(p.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      {p.paid_at ? new Date(p.paid_at).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-500 font-sans">
                    No payment records found.
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
