import React, { useState, useEffect } from 'react';
import { Users, Search, Wallet, DollarSign, ShieldAlert, UserCheck } from 'lucide-react';
import { endpoints } from '../../services/api.js';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { UserAvatar } from '../../components/common/UserAvatar.jsx';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Balance Adjustment Modal
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState('ADMIN_CREDIT');
  const [adjustDesc, setAdjustDesc] = useState('');

  const toast = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await endpoints.admin.getUsers({ search, limit: 50 });
      if (res.success && res.data) {
        setUsers(res.data.items || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  const handleOpenBalance = (u) => {
    setSelectedUser(u);
    setAdjustAmount('');
    setAdjustType('ADMIN_CREDIT');
    setAdjustDesc('');
    setIsBalanceModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustAmount || Number(adjustAmount) <= 0) return;

    try {
      await endpoints.admin.adjustUserBalance({
        userId: selectedUser.id,
        amount: Number(adjustAmount),
        type: adjustType,
        description: adjustDesc || 'Admin adjustment'
      });
      toast.success('User balance adjusted and ledger recorded');
      setIsBalanceModalOpen(false);
      loadUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'banned' : 'active';
    try {
      await endpoints.admin.updateUserStatus(user.id, nextStatus);
      toast.success(`User marked as ${nextStatus}`);
      loadUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <span>User Accounts & Wallets</span>
        </h2>
        <p className="text-xs text-slate-400">
          Manage Telegram Mini App customers, credit balances, and audit activities.
        </p>
      </div>

      <div className="relative max-w-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username or Telegram ID..."
          className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 outline-none focus:border-emerald-500"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Telegram ID</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar user={u} size="sm" showBadge={u.roles?.includes('ADMIN') || u.username === 'darazzdev'} />
                        <div>
                          <p className="font-bold text-slate-200">{u.first_name} {u.last_name || ''}</p>
                          <p className="text-[10px] text-slate-400">@{u.username || 'user'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {u.telegram_id}
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-400">
                      ${Number(u.balance || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      ${Number(u.total_spent || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-bold">
                      {u.order_count || 0}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={u.status === 'active' ? 'success' : 'danger'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenBalance(u)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-[11px] flex items-center gap-1"
                          title="Adjust Balance"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>Balance</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                            u.status === 'active'
                              ? 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {u.status === 'active' ? 'Ban' : 'Unban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Adjust Modal */}
      <Modal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        title={`Adjust Balance for @${selectedUser?.username || selectedUser?.telegram_id || 'User'}`}
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
          {/* User Info & Current Balance Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400">Current User Balance</p>
              <p className="text-base font-black text-emerald-400">
                ${Number(selectedUser?.balance || 0).toFixed(2)} USD
              </p>
            </div>
            {adjustAmount && Number(adjustAmount) > 0 && (
              <div className="text-right">
                <p className="text-[11px] text-slate-400">New Balance</p>
                <p className={`text-base font-black ${
                  adjustType === 'ADMIN_DEBIT' && (Number(selectedUser?.balance || 0) - Number(adjustAmount)) < 0
                    ? 'text-rose-400'
                    : 'text-cyan-400'
                }`}>
                  ${Math.max(0, adjustType === 'ADMIN_DEBIT' 
                    ? (Number(selectedUser?.balance || 0) - Number(adjustAmount)) 
                    : (Number(selectedUser?.balance || 0) + Number(adjustAmount))
                  ).toFixed(2)} USD
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Action Type</label>
            <select
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-500"
            >
              <option value="ADMIN_CREDIT">➕ ADMIN_CREDIT (Add / Deposit Balance)</option>
              <option value="ADMIN_DEBIT">➖ ADMIN_DEBIT (Deduct / Charge Balance)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-300">Amount ($ USD) *</label>
              <div className="flex items-center gap-1">
                {[5, 10, 20, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAdjustAmount(String(val))}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-bold"
                  >
                    +${val}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              placeholder="e.g. 10.00"
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-500 font-mono text-sm"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Ledger Note / Reason</label>
            <input
              type="text"
              value={adjustDesc}
              onChange={(e) => setAdjustDesc(e.target.value)}
              placeholder="e.g. Customer support compensation, manual top-up"
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsBalanceModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-glow-green transition-all"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
