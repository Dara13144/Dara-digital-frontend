import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2 } from 'lucide-react';
import { endpoints } from '../../services/api.js';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    minimum_amount: '0.00',
    maximum_discount: '',
    usage_limit: '',
    per_user_limit: 1,
    active: true
  });

  const toast = useToast();

  const loadCoupons = async () => {
    try {
      const res = await endpoints.admin.getCoupons();
      if (res.success) setCoupons(res.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '10',
      minimum_amount: '5.00',
      maximum_discount: '10.00',
      usage_limit: '100',
      per_user_limit: 1,
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      description: c.description || '',
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      minimum_amount: String(c.minimum_amount || '0'),
      maximum_discount: c.maximum_discount ? String(c.maximum_discount) : '',
      usage_limit: c.usage_limit ? String(c.usage_limit) : '',
      per_user_limit: c.per_user_limit || 1,
      active: Boolean(c.active)
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discount_value: Number(formData.discount_value),
        minimum_amount: Number(formData.minimum_amount || 0),
        maximum_discount: formData.maximum_discount ? Number(formData.maximum_discount) : null,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        per_user_limit: Number(formData.per_user_limit || 1)
      };

      if (editingCoupon) {
        await endpoints.admin.updateCoupon(editingCoupon.id, payload);
        toast.success('Coupon updated');
      } else {
        await endpoints.admin.createCoupon(payload);
        toast.success('Coupon created');
      }

      setIsModalOpen(false);
      loadCoupons();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete coupon?')) return;
    try {
      await endpoints.admin.deleteCoupon(id);
      toast.success('Coupon deleted');
      loadCoupons();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" />
            <span>Discount Coupons</span>
          </h2>
          <p className="text-xs text-slate-400">
            Create percentage or fixed discounts with usage and min-order restrictions.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow-green"
        >
          <Plus className="w-4 h-4" />
          <span>New Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-2xl glass-card border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-black text-sm tracking-wider">
                {c.code}
              </span>
              <Badge variant={c.active ? 'success' : 'default'}>
                {c.active ? 'Active' : 'Disabled'}
              </Badge>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-bold text-slate-100">
                Discount: {c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`}
              </p>
              <p className="text-slate-400 text-[11px]">{c.description || 'No description'}</p>
              <p className="text-[11px] text-slate-400">
                Min Order: ${c.minimum_amount} | Uses: {c.used_count || 0}/{c.usage_limit || '∞'}
              </p>
            </div>

            <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleOpenEdit(c)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Coupon Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. VIP2026"
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono uppercase outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Type</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Value *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                placeholder={formData.discount_type === 'percentage' ? '10' : '2.00'}
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Min Order ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.minimum_amount}
                onChange={(e) => setFormData({ ...formData, minimum_amount: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Usage Limit</label>
              <input
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                placeholder="Unlimited if empty"
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
            />
            <span className="font-bold text-slate-200">Active</span>
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-glow-green"
            >
              Save Coupon
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
