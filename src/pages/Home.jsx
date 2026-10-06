import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Zap,
  Sparkles,
  Gamepad2,
  Gift,
  Code2,
  Send,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Flame
} from 'lucide-react';
import { endpoints } from '../services/api.js';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/common/Badge.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTelegram } from '../hooks/useTelegram.js';

export function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [discountProducts, setDiscountProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { lang, t } = useLanguage();
  const { haptic } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catsRes, featRes, discRes] = await Promise.all([
          endpoints.getCategories(),
          endpoints.getProducts({ featured: true, limit: 6 }),
          endpoints.getProducts({ sortBy: 'popular', limit: 6 })
        ]);

        if (catsRes.success) setCategories(catsRes.data);
        if (featRes.success) setFeaturedProducts(featRes.data.items);
        if (discRes.success) setDiscountProducts(discRes.data.items);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      haptic('light');
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Icon mapping helper
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Gamepad2': return Gamepad2;
      case 'Gift': return Gift;
      case 'Code2': return Code2;
      case 'Sparkles': return Sparkles;
      case 'Send': return Send;
      default: return Zap;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Dynamic Animated Hero Video Banner */}
      <Link
        to="/shop"
        onClick={() => haptic('medium')}
        className="block relative rounded-3xl overflow-hidden border border-rose-500/40 hover:border-rose-500/70 shadow-2xl bg-slate-950 group active:scale-[0.99] transition-all"
      >
        <div className="relative overflow-hidden aspect-[16/9] sm:aspect-[21/9] max-h-[380px] w-full bg-slate-950">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/dara_hero.png"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          >
            <source src="/lucia_sword_duel.mp4" type="video/mp4" />
            <img
              src="/dara_hero.png"
              alt="Lucia Sword Duel"
              className="w-full h-full object-cover object-center"
            />
          </video>

          {/* Ambient Gradient Lighting */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      </Link>


      {/* Flash Sale / Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500/20 via-orange-500/20 to-amber-500/20 border border-rose-500/40 flex items-center justify-center shadow-lg">
              <Flame className="w-5 h-5 text-rose-500 fill-rose-500 animate-flame" />
            </div>
            <span className="bg-gradient-to-r from-rose-400 via-orange-300 to-amber-300 bg-clip-text text-transparent font-black">
              {t('home.flashSale')}
            </span>
          </h2>
          <Link
            to="/shop"
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>{t('home.viewAll')}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Most Popular Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400 animate-zap" />
            </div>
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-400 bg-clip-text text-transparent font-black">
              {t('home.popular')}
            </span>
          </h2>
          <Link
            to="/shop"
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>{t('home.viewAll')}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : discountProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
