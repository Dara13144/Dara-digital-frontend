import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Boxes,
  Eye,
  CheckCircle2,
  XCircle,
  Search
} from 'lucide-react';
import { endpoints } from '../../services/api.js';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    name_km: '',
    category_id: '',
    price: '',
    stock_type: 'code',
    description: '',
    description_km: '',
    images: '',
    instructions: '',
    featured: false,
    published: true
  });

  // Quick Stock Add Modal
  const [isQuickStockOpen, setIsQuickStockOpen] = useState(false);
  const [quickProduct, setQuickProduct] = useState(null);
  const [quickStockType, setQuickStockType] = useState('account');
  const [quickStockMode, setQuickStockMode] = useState('single');
  const [quickPayload, setQuickPayload] = useState('');
  const [quickBulkText, setQuickBulkText] = useState('');
  const [submittingStock, setSubmittingStock] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        endpoints.admin.getProducts({ search, limit: 100 }),
        endpoints.getCategories()
      ]);
      if (prodRes.success) setProducts(prodRes.data.items);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      name_km: '',
      category_id: categories[0]?.id || '',
      price: '',
      stock_type: 'code',
      description: '',
      description_km: '',
      images: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
      instructions: '',
      featured: false,
      published: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      name_km: p.name_km || '',
      category_id: p.category_id,
      price: String(p.price),
      stock_type: p.stock_type,
      description: p.description || '',
      description_km: p.description_km || '',
      images: p.images?.join('\n') || '',
      instructions: p.instructions || '',
      featured: Boolean(p.featured),
      published: Boolean(p.published)
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discount_price: null,
        images: formData.images
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      };

      if (editingProduct) {
        await endpoints.admin.updateProduct(editingProduct.id, payload);
        toast.success('Product updated successfully');
      } else {
        await endpoints.admin.createProduct(payload);
        toast.success('Product created successfully');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await endpoints.admin.deleteProduct(id);
      toast.success('Product deleted');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleOpenQuickStock = (p) => {
    setQuickProduct(p);
    setQuickStockType(p.stock_type || 'account');
    setQuickPayload('');
    setQuickBulkText('');
    setQuickStockMode('single');
    setIsQuickStockOpen(true);
  };

  const handleQuickStockSubmit = async (e) => {
    e.preventDefault();
    if (!quickProduct) return;
    setSubmittingStock(true);

    try {
      if (quickStockMode === 'single') {
        if (!quickPayload.trim()) {
          toast.warning('Please enter account credentials or license key.');
          return;
        }
        await endpoints.admin.addStockItem({
          productId: quickProduct.id,
          stockType: quickStockType,
          payload: quickPayload.trim()
        });
        toast.success(`1 stock item added for "${quickProduct.name}"!`);
      } else {
        const lines = quickBulkText
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);

        if (!lines.length) {
          toast.warning('Please enter at least 1 line of stock.');
          return;
        }

        const res = await endpoints.admin.bulkAddStock({
          productId: quickProduct.id,
          stockType: quickStockType,
          lines
        });

        toast.success(
          `Bulk Upload: ${res.data.inserted} items added (${res.data.duplicates} duplicates skipped)`
        );
      }

      setIsQuickStockOpen(false);
      setQuickPayload('');
      setQuickBulkText('');
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingStock(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <span>Products Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Create, edit prices, upload images, and control catalog items.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow-green"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter products..."
          className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 outline-none focus:border-emerald-500"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600'}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-contain p-0.5 bg-slate-950 border border-slate-800"
                      />
                      <div>
                        <p className="font-bold text-slate-100 line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-400">
                      ${Number(p.price).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 uppercase font-bold text-[10px] text-slate-300">
                    {p.stock_type}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/stock?product=${p.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px]"
                      >
                        <Boxes className="w-3 h-3 text-emerald-400" />
                        <span>{p.stock_quantity || 0} in stock</span>
                      </Link>
                      <button
                        onClick={() => handleOpenQuickStock(p)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-[11px] border border-emerald-500/30"
                        title="Add Stock / Accounts"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Stock</span>
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={p.published ? 'success' : 'default'}>
                      {p.published ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenQuickStock(p)}
                        className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs"
                        title="Quick Add Stock"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Digital Product' : 'Create New Product'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Product Name (EN) *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Product Name (Khmer - Optional)</label>
            <input
              type="text"
              value={formData.name_km}
              onChange={(e) => setFormData({ ...formData, name_km: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Category *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Stock Delivery Type *</label>
              <select
                value={formData.stock_type}
                onChange={(e) => setFormData({ ...formData, stock_type: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
              >
                <option value="code">License Code / Key</option>
                <option value="link">Gift Link</option>
                <option value="account">Account (User/Pass)</option>
                <option value="text">Digital Text</option>
                <option value="file">File Download</option>
                <option value="manual">Manual Customer Support</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Price ($ USD) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Image URLs (One per line)</label>
            <textarea
              rows={2}
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Description (EN)</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Redemption Instructions (Delivered to Customer)</label>
            <textarea
              rows={2}
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none font-mono"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
              />
              <span className="font-bold text-slate-200">Published to Store</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
              />
              <span className="font-bold text-slate-200">Featured / Hot</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
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
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Stock Modal */}
      <Modal
        isOpen={isQuickStockOpen}
        onClose={() => setIsQuickStockOpen(false)}
        title={`⚡ Add Digital Stock: ${quickProduct?.name || ''}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleQuickStockSubmit} className="space-y-4 text-xs">
          {/* Mode Switch: Single Item or Bulk Upload */}
          <div className="flex rounded-xl p-1 bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setQuickStockMode('single')}
              className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                quickStockMode === 'single'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              + Single Account / Key
            </button>
            <button
              type="button"
              onClick={() => setQuickStockMode('bulk')}
              className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                quickStockMode === 'bulk'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bulk Upload Lines (Paste Many)
            </button>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Stock Type
            </label>
            <select
              value={quickStockType}
              onChange={(e) => setQuickStockType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            >
              <option value="account">Account Credentials (Email: ... | Pass: ...)</option>
              <option value="code">License Key / CD-Key</option>
              <option value="link">Gift / Invitation Link (https://...)</option>
              <option value="text">Digital Credentials / Secret Text</option>
            </select>
          </div>

          {quickStockMode === 'single' ? (
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Account Credentials / Secret Key *
              </label>
              <textarea
                rows={3}
                required
                value={quickPayload}
                onChange={(e) => setQuickPayload(e.target.value)}
                placeholder="e.g. Email: capcut.pro.vip@gmail.com | Pass: ProVIP2026!"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This exact text will be delivered automatically to the customer upon purchase.
              </p>
            </div>
          ) : (
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Bulk Stock Lines (1 item per line) *
              </label>
              <textarea
                rows={6}
                required
                value={quickBulkText}
                onChange={(e) => setQuickBulkText(e.target.value)}
                placeholder="Email: user1@gmail.com | Pass: pass123&#10;Email: user2@gmail.com | Pass: pass456&#10;Email: user3@gmail.com | Pass: pass789"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Paste multiple accounts or keys separated by newlines. Duplicates will be automatically detected and skipped.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Current Stock: <strong className="text-emerald-400">{quickProduct?.stock_quantity || 0}</strong>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsQuickStockOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingStock}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-glow-green disabled:opacity-50"
              >
                {submittingStock ? 'Adding...' : '⚡ Add to Stock Now'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
