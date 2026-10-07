import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { TopUpPackageModal } from './TopUpPackageModal.jsx';
import { endpoints } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Sparkles,
  Gamepad2,
  Zap,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  ExternalLink,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function TopUpHubEditorModal({ isOpen, onClose, onRefreshRequired, initialTab = 'all' }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab || 'all'); // 'all' | 'gamepass' | 'robux'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const toast = useToast();

  const loadAllPackages = async () => {
    setLoading(true);
    try {
      const [topupRes, gamepassRes] = await Promise.all([
        endpoints.getProducts({ categorySlug: 'topup', limit: 100 }),
        endpoints.getProducts({ categorySlug: 'gamepass', limit: 100 })
      ]);

      const items = [
        ...(topupRes.success && Array.isArray(topupRes.data?.items) ? topupRes.data.items : []),
        ...(gamepassRes.success && Array.isArray(gamepassRes.data?.items) ? gamepassRes.data.items : [])
      ];

      setPackages(items);
    } catch (err) {
      toast.error('Failed to load packages: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      loadAllPackages();
    }
  }, [isOpen, initialTab]);

  const handleOpenCreate = () => {
    setEditingPackage(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPackage({
      ...pkg,
      isGamepass: pkg.category?.slug === 'gamepass' || pkg.name?.toLowerCase().includes('gamepass'),
      productData: pkg
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (pkg) => {
    if (!window.confirm(`Are you sure you want to delete package: "${pkg.name}"?`)) return;
    try {
      const res = await endpoints.admin.deleteProduct(pkg.id);
      if (res.success) {
        toast.success(`Deleted: ${pkg.name}`);
        loadAllPackages();
        if (onRefreshRequired) onRefreshRequired();
      } else {
        toast.error(res.error?.message || 'Failed to delete');
      }
    } catch (err) {
      toast.error(err.message || 'Delete error');
    }
  };

  const filteredPackages = packages.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name?.toLowerCase().includes(q) ||
      p.name_km?.toLowerCase().includes(q) ||
      p.badge?.toLowerCase().includes(q);

    const isGp = p.category?.slug === 'gamepass' || p.name?.toLowerCase().includes('gamepass');
    if (activeTab === 'gamepass') return matchesSearch && isGp;
    if (activeTab === 'robux') return matchesSearch && !isGp;
    return matchesSearch;
  });

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Roblox & Blox Fruits GamePass Top-Up Hub Editor"
        size="2xl"
      >
        <div className="space-y-4">
          {/* Subheader banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 border border-pink-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Package Management & Live Store Pricing</span>
              </p>
              <p className="text-[11px] text-slate-300">
                Create, update prices, change badges, and upload custom banners for Blox Fruits & Robux packages.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/topup?tab=gamepass"
                target="_blank"
                className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Store (/topup?tab=gamepass)</span>
              </Link>
              <button
                onClick={handleOpenCreate}
                className="px-3.5 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-black text-xs shadow-glow-pink flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add {activeTab === 'gamepass' ? 'GamePass' : 'Package'}</span>
              </button>
            </div>
          </div>

          {/* Search and Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Packages ({packages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('gamepass')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'gamepass'
                    ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-sm font-black'
                    : 'text-amber-400/90 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>GamePass</span>
                <span className="px-1 py-0.2 rounded text-[9px] bg-amber-500/30 text-amber-100 font-black">
                  HOT
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('robux')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'robux'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Robux & Raids</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter packages..."
                  className="w-full h-9 pl-8 pr-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-pink-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="button"
                onClick={loadAllPackages}
                title="Refresh list"
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Packages List */}
          <div className="max-h-[55vh] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/40">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-pink-400" />
                <span>Loading top-up packages...</span>
              </div>
            ) : filteredPackages.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
                <p className="font-bold text-slate-300">No packages found.</p>
                <p className="text-[11px] text-slate-500 mt-1">Click "Add New Package" above to create one.</p>
              </div>
            ) : (
              filteredPackages.map((pkg) => {
                const isGp = pkg.category?.slug === 'gamepass' || pkg.name?.toLowerCase().includes('gamepass');
                const img = pkg.images?.[0] || (isGp ? '/categories/gamepass.png' : '/categories/topup.png');

                return (
                  <div
                    key={pkg.id}
                    className="pt-2 pb-2 flex items-center justify-between gap-3 hover:bg-slate-900/60 p-2 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                        <img
                          src={img}
                          alt={pkg.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.src = '/categories/topup.png';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-white truncate max-w-xs sm:max-w-md">
                            {pkg.name}
                          </h4>
                          {pkg.badge && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/30">
                              {pkg.badge}
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                              isGp
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {isGp ? 'Blox Fruits GamePass' : 'Robux'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {pkg.name_km || pkg.description || 'Instant delivery package'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-black text-emerald-400 font-mono">
                          ${Number(pkg.discount_price || pkg.price).toFixed(2)}
                        </div>
                        {pkg.discount_price && (
                          <div className="text-[10px] text-slate-500 line-through">
                            ${Number(pkg.price).toFixed(2)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(pkg)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-pink-500 text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
                          title="Edit package"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(pkg)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500 text-slate-400 hover:text-white transition-all active:scale-95"
                          title="Delete package"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer close */}
          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              Close Editor
            </button>
          </div>
        </div>
      </Modal>

      {/* Package Edit/Create Modal with ImageUploader */}
      <TopUpPackageModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        packageToEdit={editingPackage}
        defaultType={activeTab === 'gamepass' ? 'gamepass' : 'robux'}
        onSaved={() => {
          loadAllPackages();
          if (onRefreshRequired) onRefreshRequired();
        }}
      />
    </>
  );
}
