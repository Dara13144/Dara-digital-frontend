import React, { useState, useEffect } from 'react';
import { endpoints } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { TopUpPackageModal } from '../../components/topup/TopUpPackageModal.jsx';
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
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export function AdminTopUp() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState(
    tabParam === 'gamepass' ? 'gamepass' : tabParam === 'robux' ? 'robux' : 'all'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [packageToEdit, setPackageToEdit] = useState(null);

  const toast = useToast();

  const loadPackages = async () => {
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
      toast.error('Failed to load topup packages: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleOpenCreate = () => {
    setPackageToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setPackageToEdit({
      ...pkg,
      isGamepass: pkg.category?.slug === 'gamepass' || pkg.name?.toLowerCase().includes('gamepass'),
      productData: pkg
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (pkg) => {
    if (!window.confirm(`Delete package: "${pkg.name}"?`)) return;
    try {
      const res = await endpoints.admin.deleteProduct(pkg.id);
      if (res.success) {
        toast.success(`Deleted package: ${pkg.name}`);
        loadPackages();
      } else {
        toast.error(res.error?.message || 'Delete failed');
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const gamepassCount = packages.filter(
    (p) => p.category?.slug === 'gamepass' || p.name?.toLowerCase().includes('gamepass')
  ).length;
  const robuxCount = packages.length - gamepassCount;

  const filteredPackages = packages.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name?.toLowerCase().includes(q) ||
      p.name_km?.toLowerCase().includes(q) ||
      p.badge?.toLowerCase().includes(q);

    const isGp = p.category?.slug === 'gamepass' || p.name?.toLowerCase().includes('gamepass');
    if (filterTab === 'gamepass') return matchesSearch && isGp;
    if (filterTab === 'robux') return matchesSearch && !isGp;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Roblox & Blox Fruits GamePass Top-Up Hub</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/40">
              System Editor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage live prices, package icons, badges, descriptions, and automatic delivery settings for GamePass and Robux.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/topup?tab=gamepass"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-amber-500/40 hover:border-pink-500/60 text-amber-300 hover:text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>View GamePass [HOT]</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/70" />
          </Link>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-black text-xs shadow-glow-pink flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Package</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Packages</p>
            <p className="text-2xl font-black text-white font-mono mt-1">{packages.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blox Fruits GamePass</p>
            <p className="text-2xl font-black text-amber-300 font-mono mt-1">{gamepassCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Robux & Raid Packs</p>
            <p className="text-2xl font-black text-purple-300 font-mono mt-1">{robuxCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs flex-wrap">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterTab === 'all'
                ? 'bg-pink-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({packages.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('gamepass')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              filterTab === 'gamepass'
                ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-sm font-black'
                : 'text-amber-400/90 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Blox Fruits GamePass ({gamepassCount})</span>
            <span className="px-1 py-0.2 rounded text-[9px] bg-amber-500/30 text-amber-100 font-black">
              HOT
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('robux')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
              filterTab === 'robux'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Robux Top-Up ({robuxCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by package name..."
              className="w-full h-10 pl-9 pr-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-pink-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={loadPackages}
            title="Reload list"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Packages Table Card */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Price ($)</th>
                <th className="py-3 px-4">Badge</th>
                <th className="py-3 px-4">Delivery</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-pink-400" />
                      <span>Loading packages...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No packages found. Click "Add New Package" to get started.
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => {
                  const isGp = pkg.category?.slug === 'gamepass' || pkg.name?.toLowerCase().includes('gamepass');
                  const img = pkg.images?.[0] || (isGp ? '/categories/gamepass.png' : '/categories/topup.png');

                  return (
                    <tr key={pkg.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                            <img
                              src={img}
                              alt={pkg.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.src = '/categories/topup.png';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-100">{pkg.name}</p>
                            <p className="text-[11px] text-slate-400">{pkg.name_km || 'Instant delivery'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isGp
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {isGp ? 'GamePass' : 'Robux'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-black text-emerald-400 text-sm">
                        ${Number(pkg.discount_price || pkg.price).toFixed(2)}
                        {pkg.discount_price && (
                          <span className="ml-1.5 text-xs text-slate-500 line-through">
                            ${Number(pkg.price).toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {pkg.badge ? (
                          <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-bold">
                            {pkg.badge}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Instant Check</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(pkg)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-pink-500 text-slate-300 hover:text-white transition-all shadow-sm"
                            title="Edit package"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(pkg)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500 text-slate-400 hover:text-white transition-all shadow-sm"
                            title="Delete package"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Package Editor Modal with Image Uploader */}
      <TopUpPackageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageToEdit={packageToEdit}
        defaultType={filterTab === 'gamepass' ? 'gamepass' : 'robux'}
        onSaved={loadPackages}
      />
    </div>
  );
}
