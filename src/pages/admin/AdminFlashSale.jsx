import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Zap,
  Save,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Percent,
  Calendar,
  Eye,
  RefreshCw,
  ArrowLeft,
  Tag,
  DollarSign
} from 'lucide-react';
import { endpoints } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function AdminFlashSale() {
  const toast = useToast();
  const { lang } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  // Campaign Settings
  const [campaign, setCampaign] = useState({
    enabled: true,
    title: 'Flash Sale & Hot Discounts',
    title_km: 'ការបញ្ចុះតម្លៃពិសេស និងទំនិញពេញនិយម',
    subtitle: 'Limited Time Deals! Up to 50% Off Top Digital Keys & Robux',
    subtitle_km: 'ការផ្តល់ជូនពិសេសមានកំណត់! បញ្ចុះតម្លៃរហូតដល់ 50%',
    badge: '⚡ FLASH SALE',
    end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  });

  // Track product edits: { [productId]: { featured: boolean, discount_price: number|null } }
  const [productEdits, setProductEdits] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [settingsRes, prodsRes, catsRes] = await Promise.all([
        endpoints.getSettings(),
        endpoints.admin.getProducts({ limit: 100 }),
        endpoints.getCategories()
      ]);

      if (settingsRes.success && settingsRes.data?.flash_sale) {
        const fs = settingsRes.data.flash_sale;
        setCampaign({
          enabled: fs.enabled !== false,
          title: fs.title || 'Flash Sale & Hot Discounts',
          title_km: fs.title_km || 'ការបញ្ចុះតម្លៃពិសេស និងទំនិញពេញនិយម',
          subtitle: fs.subtitle || 'Limited Time Deals! Up to 50% Off Top Digital Keys & Robux',
          subtitle_km: fs.subtitle_km || 'ការផ្តល់ជូនពិសេសមានកំណត់! បញ្ចុះតម្លៃរហូតដល់ 50%',
          badge: fs.badge || '⚡ FLASH SALE',
          end_time: fs.end_time ? new Date(fs.end_time).toISOString().slice(0, 16) : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
        });
      }

      if (catsRes.success) {
        setCategories(catsRes.data || []);
      }

      if (prodsRes.success && prodsRes.data?.items) {
        setProducts(prodsRes.data.items);
        const initialEdits = {};
        for (const p of prodsRes.data.items) {
          initialEdits[p.id] = {
            featured: !!p.featured,
            discount_price: p.discount_price ? Number(p.discount_price) : null
          };
        }
        setProductEdits(initialEdits);
      }
    } catch (err) {
      toast.error('Failed to load flash sale data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleProduct = (productId) => {
    setProductEdits((prev) => {
      const current = prev[productId] || { featured: false, discount_price: null };
      const nextFeatured = !current.featured;
      const product = products.find((p) => p.id === productId);
      
      // If enabling and no discount price yet, suggest a 15% discount
      let nextDiscount = current.discount_price;
      if (nextFeatured && !nextDiscount && product) {
        const origPrice = Number(product.price);
        nextDiscount = Number((origPrice * 0.85).toFixed(2));
      }

      return {
        ...prev,
        [productId]: {
          ...current,
          featured: nextFeatured,
          discount_price: nextFeatured ? nextDiscount : null
        }
      };
    });
  };

  const handleDiscountChange = (productId, newDiscount) => {
    setProductEdits((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        discount_price: newDiscount ? Number(newDiscount) : null
      }
    }));
  };

  const applyBulkDiscount = (percent) => {
    setProductEdits((prev) => {
      const updated = { ...prev };
      for (const p of products) {
        if (updated[p.id]?.featured) {
          const orig = Number(p.price);
          const discounted = Number((orig * (1 - percent / 100)).toFixed(2));
          updated[p.id] = {
            ...updated[p.id],
            discount_price: discounted
          };
        }
      }
      return updated;
    });
    toast.success(`Applied ${percent}% discount to all featured items!`);
  };

  const setTimerPreset = (hours) => {
    const d = new Date(Date.now() + hours * 60 * 60 * 1000);
    setCampaign((prev) => ({
      ...prev,
      end_time: d.toISOString().slice(0, 16)
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // 1. Save campaign settings to global settings table
      const settingsPayload = {
        flash_sale: {
          enabled: campaign.enabled,
          title: campaign.title,
          title_km: campaign.title_km,
          subtitle: campaign.subtitle,
          subtitle_km: campaign.subtitle_km,
          badge: campaign.badge,
          end_time: new Date(campaign.end_time).toISOString()
        }
      };

      await endpoints.admin.updateSettings(settingsPayload);

      // 2. Save each modified product's featured and discount_price
      let updatedCount = 0;
      for (const p of products) {
        const edit = productEdits[p.id];
        if (edit) {
          const hasFeaturedChanged = !!edit.featured !== !!p.featured;
          const hasDiscountChanged = Number(edit.discount_price || 0) !== Number(p.discount_price || 0);

          if (hasFeaturedChanged || hasDiscountChanged) {
            await endpoints.admin.updateProduct(p.id, {
              featured: edit.featured,
              discount_price: edit.discount_price
            });
            updatedCount++;
          }
        }
      }

      toast.success(`🎉 Flash Sale settings saved! (${updatedCount} products updated)`);
      await loadData();
    } catch (err) {
      toast.error('Failed to save flash sale changes: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category_id !== categoryFilter) return false;
    if (search.trim() && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const featuredCount = Object.values(productEdits).filter((e) => e.featured).length;

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-pink-400" />
        <span>Loading Flash Sale & Discounts Manager...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500/20 via-orange-500/20 to-amber-500/20 border border-rose-500/50 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Flame className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
              </div>
              <span className="bg-gradient-to-r from-rose-400 via-orange-300 to-amber-300 bg-clip-text text-transparent font-black">
                Flash Sale & Hot Discounts Editor
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure deals, discount pricing, and live countdown timer displayed on the store homepage.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-glow-green flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Publish to Store</span>
            </>
          )}
        </button>
      </div>

      {/* Campaign Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Campaign Configuration */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 sm:p-6 rounded-3xl glass-card border border-rose-500/30 bg-[#160e19]/90 shadow-[0_0_30px_rgba(244,63,94,0.12)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-black uppercase tracking-wider text-rose-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>1. Campaign Status & Live Timer</span>
              </h2>

              {/* Status Switch */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs font-bold text-slate-300">
                  {campaign.enabled ? (
                    <span className="text-emerald-400">ACTIVE ON WEBSITE</span>
                  ) : (
                    <span className="text-slate-500">PAUSED</span>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={campaign.enabled}
                  onChange={(e) => setCampaign((c) => ({ ...c, enabled: e.target.checked }))}
                  className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Campaign Badge Text */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Sale Badge Text</label>
                <input
                  type="text"
                  value={campaign.badge}
                  onChange={(e) => setCampaign((c) => ({ ...c, badge: e.target.value }))}
                  placeholder="e.g. ⚡ FLASH SALE"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold focus:border-rose-500 outline-none"
                />
              </div>

              {/* End Date & Time */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  <span>Countdown End Date & Time</span>
                </label>
                <input
                  type="datetime-local"
                  value={campaign.end_time}
                  onChange={(e) => setCampaign((c) => ({ ...c, end_time: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:border-rose-500 outline-none"
                />
              </div>
            </div>

            {/* Quick Timer Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">Quick Timer Presets:</label>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { label: '+6 Hours', hours: 6 },
                  { label: '+12 Hours', hours: 12 },
                  { label: '+24 Hours (1 Day)', hours: 24 },
                  { label: '+3 Days', hours: 72 },
                  { label: '+7 Days', hours: 168 }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setTimerPreset(preset.hours)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-bold transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Section Title (EN)</label>
                  <input
                    type="text"
                    value={campaign.title}
                    onChange={(e) => setCampaign((c) => ({ ...c, title: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-semibold focus:border-rose-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Section Title (KH)</label>
                  <input
                    type="text"
                    value={campaign.title_km}
                    onChange={(e) => setCampaign((c) => ({ ...c, title_km: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-semibold focus:border-rose-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Campaign Subtitle / Tagline</label>
                <input
                  type="text"
                  value={campaign.subtitle}
                  onChange={(e) => setCampaign((c) => ({ ...c, subtitle: e.target.value }))}
                  placeholder="e.g. Limited Time Deals! Up to 50% Off Top Digital Keys & Robux"
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-rose-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Storefront Preview Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl glass-card border border-amber-500/30 bg-[#16120e]/90 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Live Storefront Preview</span>
            </h3>

            {/* Preview Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-orange-950/60 border border-rose-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                  </div>
                  <span className="font-black text-sm bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
                    {campaign.title}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black">
                  {campaign.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{campaign.subtitle}</p>

              {/* Countdown badge */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ends In:</span>
                </span>
                <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                  {new Date(campaign.end_time).toLocaleDateString()} {new Date(campaign.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Quick Summary Pill */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Featured Products:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {featuredCount} items in Flash Sale
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selection & Discount Pricing Table */}
      <div className="p-5 sm:p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-rose-400" />
              <span>2. Select Products & Set Discount Prices</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Check products to include them in Flash Sale & Hot Discounts. Set the custom discount price.
            </p>
          </div>

          {/* Quick Bulk Discount Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Bulk %:</span>
            {[10, 15, 20, 25, 30, 50].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => applyBulkDiscount(pct)}
                className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-[11px] font-bold transition-colors"
                title={`Apply ${pct}% discount to all currently featured items`}
              >
                -{pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:border-rose-500 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-rose-500 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              <tr>
                <th className="py-2.5 px-3">Flash Sale</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Original Price</th>
                <th className="py-2.5 px-3">Sale Price (USD)</th>
                <th className="py-2.5 px-3">Discount Tag</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((p) => {
                const edit = productEdits[p.id] || { featured: false, discount_price: null };
                const isFeatured = !!edit.featured;
                const origPrice = Number(p.price);
                const discountPrice = edit.discount_price !== null && edit.discount_price !== undefined ? Number(edit.discount_price) : null;
                const savingsPct = discountPrice && discountPrice < origPrice ? Math.round((1 - discountPrice / origPrice) * 100) : null;

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isFeatured ? 'bg-rose-500/5 hover:bg-rose-500/10' : 'hover:bg-slate-900/40'
                    }`}
                  >
                    {/* Checkbox Toggle */}
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={() => handleToggleProduct(p.id)}
                        className="w-5 h-5 rounded text-rose-500 focus:ring-rose-500 bg-slate-900 border-slate-700 cursor-pointer"
                      />
                    </td>

                    {/* Product Info */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          <img
                            src={p.images?.[0] || '/categories/topup.png'}
                            alt={p.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.src = '/categories/topup.png';
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Original Price */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-300">
                      ${origPrice.toFixed(2)}
                    </td>

                    {/* Editable Sale Price */}
                    <td className="py-3 px-3">
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={discountPrice !== null ? discountPrice : ''}
                          disabled={!isFeatured}
                          onChange={(e) => handleDiscountChange(p.id, e.target.value)}
                          placeholder="Sale $"
                          className={`w-full h-8 pl-6 pr-2 rounded-lg bg-slate-950 border font-mono text-xs font-bold outline-none transition-all ${
                            isFeatured
                              ? 'border-rose-500/80 text-rose-300 focus:border-rose-400 focus:ring-1 focus:ring-rose-500'
                              : 'border-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                          }`}
                        />
                      </div>
                    </td>

                    {/* Calculated Discount Tag */}
                    <td className="py-3 px-3">
                      {isFeatured && savingsPct ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black">
                          <Percent className="w-2.5 h-2.5" />
                          <span>-{savingsPct}% OFF</span>
                        </span>
                      ) : isFeatured ? (
                        <span className="text-[10px] text-amber-400 font-bold">Featured (No Disc.)</span>
                      ) : (
                        <span className="text-[10px] text-slate-500">-</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-right">
                      {isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                          <Flame className="w-3.5 h-3.5 fill-rose-500" />
                          <span>In Sale</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium">Standard</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
