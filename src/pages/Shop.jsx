import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Gamepad2,
  Gift,
  Code2,
  Sparkles,
  Send,
  Zap,
  Layers
} from 'lucide-react';
import { endpoints } from '../services/api.js';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/common/Badge.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTelegram } from '../hooks/useTelegram.js';

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    { id: '10000000-0000-0000-0000-000000000001', name: 'Bloxfruits', slug: 'bloxfruits', image_url: '/categories/bloxfruits.png' },
    { id: '10000000-0000-0000-0000-000000000002', name: 'Fruits', slug: 'fruits', image_url: '/categories/fruits.png' },
    { id: '10000000-0000-0000-0000-000000000003', name: 'Gamepass', slug: 'gamepass', image_url: '/categories/gamepass.png' }
  ]);
  const [loading, setLoading] = useState(true);

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialSort = searchParams.get('sort') || 'newest';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [stockType, setStockType] = useState('');

  const { lang, t } = useLanguage();
  const { haptic } = useTelegram();

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Gamepad2': return Gamepad2;
      case 'Gift': return Gift;
      case 'Code2': return Code2;
      case 'Sparkles': return Sparkles;
      case 'Send': return Send;
      case 'Zap': return Zap;
      default: return Zap;
    }
  };

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await endpoints.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await endpoints.getProducts({
          search: search || undefined,
          categorySlug: selectedCategory || undefined,
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
  }, [search, selectedCategory, selectedSort, stockType]);

  const categoryImageMap = {
    'bloxfruits': '/categories/bloxfruits.png',
    'fruits': '/categories/fruits.png',
    'gamepass': '/categories/gamepass.png'
  };

  const categoryOrder = { 'bloxfruits': 1, 'fruits': 2, 'gamepass': 3 };
  const visibleCategories = categories
    .filter((c) => ['bloxfruits', 'fruits', 'gamepass'].includes(c.slug))
    .sort((a, b) => (categoryOrder[a.slug] || 99) - (categoryOrder[b.slug] || 99));

  const handleCategorySelect = (slug) => {
    haptic('selection');
    setSelectedCategory((prev) => (prev === slug ? '' : slug));
  };

  return (
    <div className="space-y-5">
      {/* Top Search & Filter Bar */}
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
              <option value="manual">Manual</option>
            </select>
            <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Pills Carousel matching user's design */}
      <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 no-scrollbar items-center">
        {/* All Button */}
        <button
          onClick={() => handleCategorySelect('')}
          className={`flex items-center justify-center px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
            selectedCategory === ''
              ? 'bg-[#181120] border-2 border-pink-500 text-white shadow-[0_0_14px_rgba(236,72,153,0.55),0_2px_8px_rgba(244,63,94,0.4)]'
              : 'bg-[#131118]/90 border border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          <span>{t('common.all') || 'All'}</span>
        </button>

        {visibleCategories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          const displayName = lang === 'km' && cat.name_km ? cat.name_km : cat.name;
          const iconUrl = categoryImageMap[cat.slug] || cat.image_url;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 group ${
                isSelected
                  ? 'bg-[#181120] border-2 border-pink-500 text-white shadow-[0_0_14px_rgba(236,72,153,0.55),0_2px_8px_rgba(244,63,94,0.4)]'
                  : 'bg-[#131118]/90 border border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              {iconUrl && (
                <div className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={iconUrl}
                    alt={displayName}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <span>{displayName}</span>
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
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
