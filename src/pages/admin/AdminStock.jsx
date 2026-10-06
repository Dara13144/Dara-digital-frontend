import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Boxes,
  Plus,
  UploadCloud,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  KeyRound
} from 'lucide-react';
import { endpoints } from '../../services/api.js';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function AdminStock() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(searchParams.get('product') || '');
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isSingleOpen, setIsSingleOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [singlePayload, setSinglePayload] = useState('');
  const [stockType, setStockType] = useState('code');

  const toast = useToast();

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await endpoints.admin.getProducts({ limit: 100 });
        if (res.success && res.data.items?.length > 0) {
          setProducts(res.data.items);
          if (!selectedProductId) {
            setSelectedProductId(res.data.items[0].id);
          }
        }
      } catch (err) {
        toast.error(err.message);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if (!selectedProductId) return;
    loadProductStock(selectedProductId);
  }, [selectedProductId]);

  const loadProductStock = async (productId) => {
    setLoading(true);
    try {
      const res = await endpoints.admin.getProductStock(productId, { limit: 100 });
      if (res.success) {
        setStockItems(res.data.items || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (!lines.length) {
      toast.warning('Please enter at least one stock line.');
      return;
    }

    try {
      const res = await endpoints.admin.bulkAddStock({
        productId: selectedProductId,
        stockType,
        lines
      });

      if (res.success) {
        toast.success(
          `Uploaded: ${res.data.inserted} items inserted (${res.data.duplicates} duplicates skipped)`
        );
        setIsBulkOpen(false);
        setBulkText('');
        loadProductStock(selectedProductId);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!singlePayload.trim()) return;

    try {
      const res = await endpoints.admin.addStockItem({
        productId: selectedProductId,
        stockType,
        payload: singlePayload.trim()
      });

      if (res.success) {
        toast.success('Stock item added!');
        setIsSingleOpen(false);
        setSinglePayload('');
        loadProductStock(selectedProductId);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Remove this stock item?')) return;
    try {
      await endpoints.admin.deleteStockItem(id);
      toast.success('Stock item removed.');
      loadProductStock(selectedProductId);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const currentProduct = products.find((p) => p.id === selectedProductId);
  const availableCount = stockItems.filter((s) => s.status === 'available').length;
  const soldCount = stockItems.filter((s) => s.status === 'sold').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-400" />
            <span>Digital Stock Inventory</span>
          </h2>
          <p className="text-xs text-slate-400">
            Add individual or bulk upload product license keys, links, and accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSingleOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            + Single Item
          </button>
          <button
            onClick={() => setIsBulkOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-glow-green"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Bulk Upload Keys</span>
          </button>
        </div>
      </div>

      {/* Product Selector Bar */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400">Select Product:</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-100 outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock counters */}
        <div className="flex items-center gap-3 text-xs">
          <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            Available: {availableCount}
          </span>
          <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-400 font-bold">
            Sold: {soldCount}
          </span>
        </div>
      </div>

      {/* Stock Inventory Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Payload Content / Secret</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Added Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400">
                    Loading stock items...
                  </td>
                </tr>
              ) : stockItems.length > 0 ? (
                stockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 font-mono">
                    <td className="py-3 px-4 uppercase text-[10px] text-slate-400">
                      {item.stock_type}
                    </td>
                    <td className="py-3 px-4 text-emerald-300 select-all break-all max-w-xs">
                      {item.payload}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={item.status === 'available' ? 'success' : 'default'}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.status === 'available' && (
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                          title="Delete unused stock"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-500">
                    No stock inventory found for this product. Use the buttons above to add stock.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      <Modal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title={`Bulk Upload Stock for: ${currentProduct?.name || ''}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleBulkSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Stock Type
            </label>
            <select
              value={stockType}
              onChange={(e) => setStockType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            >
              <option value="code">License Codes / Keys</option>
              <option value="link">Gift Links (https://...)</option>
              <option value="account">Account Credentials (user:pass)</option>
              <option value="text">Digital Text Lines</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Stock Lines (One code/item per line) *
            </label>
            <textarea
              rows={8}
              required
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="KEY-AAAA-BBBB-CCCC&#10;KEY-DDDD-EEEE-FFFF&#10;KEY-GGGG-HHHH-IIII"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none font-mono text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Duplicates within the existing inventory will be automatically detected and skipped.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsBulkOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-glow-green"
            >
              Upload Inventory
            </button>
          </div>
        </form>
      </Modal>

      {/* Single Add Modal */}
      <Modal
        isOpen={isSingleOpen}
        onClose={() => setIsSingleOpen(false)}
        title={`Add Stock Item for: ${currentProduct?.name || ''}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Stock Type
            </label>
            <select
              value={stockType}
              onChange={(e) => setStockType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            >
              <option value="account">Account Credentials (Email: ... | Pass: ...)</option>
              <option value="code">License Code / CD-Key</option>
              <option value="link">Gift / Invitation Link (https://...)</option>
              <option value="text">Digital Text / Secret Notes</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Account Credentials / License Key *</label>
            <textarea
              rows={3}
              required
              value={singlePayload}
              onChange={(e) => setSinglePayload(e.target.value)}
              placeholder="e.g. Email: capcut.pro.vip@gmail.com | Pass: ProVIP2026!"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none font-mono text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              This will be instantly and securely transferred to the user when they purchase this item.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsSingleOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-glow-green"
            >
              Add to Stock Now
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
