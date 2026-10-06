import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2 } from 'lucide-react';
import { endpoints } from '../../services/api.js';
import { Modal } from '../../components/common/Modal.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    name_km: '',
    icon: 'Gamepad2',
    image_url: '',
    description: '',
    sort_order: 1,
    status: 'active'
  });

  const toast = useToast();

  const loadCategories = async () => {
    try {
      const res = await endpoints.getCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      name_km: '',
      icon: 'Gamepad2',
      image_url: '',
      description: '',
      sort_order: categories.length + 1,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setFormData({
      name: c.name,
      name_km: c.name_km || '',
      icon: c.icon || 'Gamepad2',
      image_url: c.image_url || '',
      description: c.description || '',
      sort_order: c.sort_order || 1,
      status: c.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await endpoints.admin.updateCategory(editingCategory.id, formData);
        toast.success('Category updated');
      } else {
        await endpoints.admin.createCategory(formData);
        toast.success('Category created');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await endpoints.admin.deleteCategory(id);
      toast.success('Category deleted');
      loadCategories();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-emerald-400" />
            <span>Product Categories</span>
          </h2>
          <p className="text-xs text-slate-400">
            Create unlimited categories with custom icons and Khmer localization.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow-green"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center justify-between gap-3"
          >
            <div>
              <h3 className="font-bold text-sm text-slate-100">{c.name}</h3>
              {c.name_km && (
                <p className="text-xs text-emerald-400 font-semibold">{c.name_km}</p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">Slug: {c.slug}</p>
            </div>

            <div className="flex items-center gap-1">
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
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Name (EN) *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Name (Khmer)</label>
            <input
              type="text"
              value={formData.name_km}
              onChange={(e) => setFormData({ ...formData, name_km: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Icon Name (Lucide)</label>
            <select
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            >
              <option value="Gamepad2">Gamepad2 (Games)</option>
              <option value="Gift">Gift (Gift Cards)</option>
              <option value="Code2">Code2 (Software)</option>
              <option value="Sparkles">Sparkles (Subscriptions)</option>
              <option value="Send">Send (Telegram/Discord)</option>
              <option value="Zap">Zap (Top-Up)</option>
            </select>
          </div>

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
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
