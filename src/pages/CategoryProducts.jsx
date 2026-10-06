import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Gamepad2,
  Gift,
  Code2,
  Sparkles,
  Send,
  Zap
} from 'lucide-react';
import { endpoints } from '../services/api.js';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/common/Badge.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export function CategoryProducts() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { lang, t } = useLanguage();

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
    async function loadData() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          endpoints.getCategory(slug),
          endpoints.getProducts({ categorySlug: slug, limit: 50 })
        ]);
        if (catRes.success) setCategory(catRes.data);
        if (prodRes.success) setProducts(prodRes.data.items);
      } catch (err) {
        console.error('Error loading category:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  const displayName = category
    ? lang === 'km' && category.name_km
      ? category.name_km
      : category.name
    : slug;

  const Icon = getCategoryIcon(category?.icon);

  return (
    <div className="space-y-5">
      {/* Back button & Title with Icon */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100">{displayName}</h1>
            {category?.description && (
              <p className="text-xs text-slate-400">{category.description}</p>
            )}
          </div>
        </div>
      </div>

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
          <p className="text-sm font-semibold">No digital products currently in this category.</p>
        </div>
      )}
    </div>
  );
}
