import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Zap,
  ShoppingBag,
  Sparkles,
  Flame,
  Package
} from 'lucide-react';
import { endpoints } from '../services/api.js';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/common/Badge.jsx';
import { GameTopUpWidget } from '../components/topup/GameTopUpWidget.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTelegram } from '../hooks/useTelegram.js';

const categoryImageMap = {
  bloxfruits: '/categories/bloxfruits.png',
  fruits: '/categories/fruits.png',
  gamepass: '/categories/gamepass.png',
  topup: '/icons/robux_gold.png'
};

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial filter from query param: ?tab=topup or ?category=...
  const initialCategory = searchParams.get('category') || (searchParams.get('tab') === 'topup' ? 'topup' : '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'newest';

  const [search, setSearch] = useState(initialSearch);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [stockType, setStockType] = useState('');

  const { lang, t } = useLanguage();
  const { haptic } = useTelegram();

  // Load categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await endpoints.getCategories();
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Load products based on category / search / sort
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = {
          search: search || undefined,
          sortBy: selectedSort,
          stockType: stockType || undefined,
          limit: 50
        };

        if (selectedCategory === 'hot') {
          params.featured = true;
        } else if (selectedCategory && selectedCategory !== 'topup') {
          params.categorySlug = selectedCategory;
        }

        const res = await endpoints.getProducts(params);
        if (res.success) {
          const isSpecialTab = selectedCategory === 'topup' || selectedCategory === 'gamepass';
          const list = isSpecialTab
            ? res.data.items
            : res.data.items.filter(
                (p) => p.category?.slug !== 'topup' &&
                       p.category?.slug !== 'gamepass' &&
                       p.category_id !== '10000000-0000-0000-0000-000000000006' &&
                       p.category_id !== '10000000-0000-0000-0000-000000000003' &&
                       !p.name?.toLowerCase().includes('fast top-up') &&
                       !p.name?.toLowerCase().includes('gamepass') &&
                       !p.name?.toLowerCase().includes('robux')
              );
          setProducts(list);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [search, selectedSort, stockType, selectedCategory]);

  const handleCategoryClick = (slug) => {
    haptic('selection');
    setSelectedCategory(slug);
    if (slug === 'topup') {
      setSearchParams({ tab: 'topup' });
    } else if (slug === 'hot') {
      setSearchParams({ filter: 'hot' });
    } else if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  const topUpProducts = products.filter(
    (p) =>
      p.category_id === '10000000-0000-0000-0000-000000000006' ||
      p.name?.toLowerCase().includes('top-up') ||
      p.name?.toLowerCase().includes('robux') ||
      p.name?.toLowerCase().includes('topup')
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Category Pills & Feature Tabs matching user's uploaded icons */}
      <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 no-scrollbar items-center">
        {/* 1. Hot Flame Icon Button */}
        <button
          type="button"
          onClick={() => handleCategoryClick(selectedCategory === 'hot' ? '' : 'hot')}
          title="Hot Deals & Trending"
          className={`flex items-center justify-center w-11 h-10 rounded-2xl shrink-0 transition-all duration-200 active:scale-95 ${
            selectedCategory === 'hot'
              ? 'bg-[#2a0815] border-2 border-pink-500 shadow-[0_0_16px_rgba(236,72,153,0.6)]'
              : 'bg-[#181120]/90 border border-pink-500/40 hover:border-pink-500 text-pink-400'
          }`}
        >
          <img src="/icons/hot_flame.png" alt="Hot Deals" className="w-5 h-5 object-contain" />
        </button>

        {/* 2. Robux Top-Up Button with Gold Coin */}
        <button
          type="button"
          onClick={() => handleCategoryClick('topup')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all duration-200 active:scale-95 ${
            selectedCategory === 'topup'
              ? 'bg-[#181120] border-2 border-pink-500 text-white shadow-[0_0_14px_rgba(236,72,153,0.55),0_2px_8px_rgba(244,63,94,0.4)]'
              : 'bg-[#131118]/90 border border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          <img src="/icons/robux_gold.png" alt="Robux" className="w-5 h-5 object-contain shrink-0" />
          <span>{lang === 'km' ? 'បញ្ចូលលុយ Game' : 'Robux Top-Up'}</span>
        </button>

        {/* 3. All Products Button */}
        <button
          type="button"
          onClick={() => handleCategoryClick('')}
          className={`flex items-center justify-center px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all duration-200 active:scale-95 ${
            selectedCategory === ''
              ? 'bg-[#181120] border-2 border-pink-500 text-white shadow-[0_0_14px_rgba(236,72,153,0.55),0_2px_8px_rgba(244,63,94,0.4)]'
              : 'bg-[#131118]/90 border border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          <span>{t('common.all') || 'ទាំងអស់'}</span>
        </button>

        {/* 4. Other Categories (Bloxfruits, Fruits, Gamepass...) */}
        {categories
          .filter((cat) => cat.slug !== 'topup' && cat.slug !== 'game-keys')
          .map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const displayName = lang === 'km' && cat.name_km ? cat.name_km : cat.name;
            const iconUrl = categoryImageMap[cat.slug] || cat.image_url;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-[#181120] border-2 border-pink-500 text-white shadow-[0_0_14px_rgba(236,72,153,0.55),0_2px_8px_rgba(244,63,94,0.4)]'
                    : 'bg-[#131118]/90 border border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                {iconUrl && (
                  <div className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center shrink-0">
                    <img src={iconUrl} alt={displayName} className="w-full h-full object-contain" />
                  </div>
                )}
                <span>{displayName}</span>
              </button>
            );
          })}
      </div>

      {/* When on 'topup' filter: Render Top-Up System Widget */}
      {selectedCategory === 'topup' && (
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
              onClick={() => handleCategoryClick('')}
              className="text-xs text-pink-400 hover:text-pink-300 font-semibold transition-colors"
            >
              Browse all store items →
            </button>
          </div>
        </div>
      )}

      {/* Hot Deals Banner when 'hot' filter is active */}
      {selectedCategory === 'hot' && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2a0815] via-[#1a0a14] to-slate-900 border border-pink-500/40 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/50 flex items-center justify-center p-1.5">
              <img src="/icons/hot_flame.png" alt="Hot" className="w-full h-full object-contain animate-bounce" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white">🔥 Hot & Trending Deals</h3>
              <p className="text-[11px] text-pink-300/80">Most popular products with verified ratings</p>
            </div>
          </div>
          <button
            onClick={() => handleCategoryClick('')}
            className="text-xs font-bold text-pink-400 hover:text-pink-300 px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20"
          >
            Show All
          </button>
        </div>
      )}

      {/* Search & Sort Controls (available on all views) */}
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

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400">
          <p className="text-sm font-semibold">No digital products match your filter.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
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
