import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Zap,
  ShoppingBag,
  Sparkles,
  Package
} from 'lucide-react';
import { endpoints } from '../services/api.js';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/common/Badge.jsx';
import { GameTopUpWidget } from '../components/topup/GameTopUpWidget.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTelegram } from '../hooks/useTelegram.js';

export function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default mode: 'topup' or 'catalog'
  const initialTab = searchParams.get('tab') === 'catalog' ? 'catalog' : 'topup';
  const [activeTab, setActiveTab] = useState(initialTab);

  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'newest';

  const [search, setSearch] = useState(initialSearch);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [stockType, setStockType] = useState('');

  const { lang, t } = useLanguage();
  const { haptic } = useTelegram();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await endpoints.getProducts({
          search: search || undefined,
          sortBy: selectedSort,
          stockType: stockType || undefined,
          limit: 50
        });
        if (res.success) setProducts(res.data.items);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [search, selectedSort, stockType]);

  const topUpProducts = products.filter(
    (p) =>
      p.category_id === '10000000-0000-0000-0000-000000000006' ||
      p.name?.toLowerCase().includes('top-up') ||
      p.name?.toLowerCase().includes('robux') ||
      p.name?.toLowerCase().includes('topup')
  );

  const displayProducts = activeTab === 'topup' && !search ? topUpProducts : products;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Top View Mode Switcher */}
      <div className="flex items-center justify-between gap-3 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm max-w-md mx-auto sm:mx-0">
        <button
          type="button"
          onClick={() => {
            haptic('selection');
            setActiveTab('topup');
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 active:scale-95 ${
            activeTab === 'topup'
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>⚡ Game Top-Up</span>
        </button>

        <button
          type="button"
          onClick={() => {
            haptic('selection');
            setActiveTab('catalog');
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 active:scale-95 ${
            activeTab === 'catalog'
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>📦 All Products</span>
        </button>
      </div>

      {/* When on 'topup' tab: Render dedicated Top-Up System */}
      {activeTab === 'topup' && (
        <div className="space-y-6">
          <GameTopUpWidget />

          {/* Section Divider & Featured Top-Up Products Header */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                All Available Top-Up Packs
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('catalog')}
              className="text-xs text-pink-400 hover:text-pink-300 font-semibold transition-colors"
            >
              Browse all store items →
            </button>
          </div>
        </div>
      )}

      {/* Search & Sort Controls (Always available on catalog, or below topup) */}
      {activeTab === 'catalog' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search')}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-pink-500 text-sm text-slate-100 outline-none"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => {
                  haptic('selection');
                  setSelectedSort(e.target.value);
                }}
                className="h-11 px-3.5 pr-8 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-200 outline-none appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={stockType}
                onChange={(e) => {
                  haptic('selection');
                  setStockType(e.target.value);
                }}
                className="h-11 px-3.5 pr-8 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-200 outline-none appearance-none cursor-pointer"
              >
                <option value="">All Delivery Types</option>
                <option value="code">Key / Code</option>
                <option value="link">Gift Link</option>
                <option value="account">Account</option>
                <option value="manual">Manual Top-Up</option>
              </select>
              <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : displayProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
          {displayProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400">
          <p className="text-sm font-semibold">No digital products match your filter.</p>
          <button
            onClick={() => {
              setSearch('');
              setStockType('');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
