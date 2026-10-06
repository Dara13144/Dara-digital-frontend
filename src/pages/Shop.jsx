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
  const [categories, setCategories] = useState([]);
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
    'game-keys': '/categories/game-keys.png',
    'gift-cards': '/categories/gift-cards.png',
    'software-tools': '/categories/software-tools.png',
    'subscriptions': '/categories/subscriptions.png',
    'social-upgrades': '/categories/social-upgrades.png'
  };

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
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-emerald-500 text-sm text-slate-100 outline-none"
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

      {/* Category Pills Carousel with Rich 3D Transparent Icons */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => handleCategorySelect('')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all card-hover-effect ${
            selectedCategory === ''
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-glow-green font-black'
              : 'glass-card text-slate-200 hover:text-white hover:border-emerald-500/40 bg-[#160206]/90 border-rose-950/70'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
            selectedCategory === '' ? 'bg-slate-950/20 text-slate-950' : 'bg-emerald-500/15 text-emerald-400'
          }`}>
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span>{t('common.all')}</span>
        </button>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          const displayName = lang === 'km' && cat.name_km ? cat.name_km : cat.name;
          const Icon = getCategoryIcon(cat.icon);
          const iconUrl = categoryImageMap[cat.slug];
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all card-hover-effect group ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-glow-green'
                  : 'glass-card text-slate-200 hover:text-white hover:border-emerald-500/40 bg-[#160206]/90 border-rose-950/70'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center p-0.5 ${
                isSelected
                  ? 'bg-slate-950/20'
                  : 'bg-slate-900/90 border border-slate-800/80 group-hover:scale-110 transition-transform'
              }`}>
                {iconUrl ? (
                  <img
                    src={iconUrl}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
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
