import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { StockBadge } from './StockBadge.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTelegram } from '../../hooks/useTelegram.js';

export function ProductCard({ product }) {
  const { lang } = useLanguage();
  const { haptic } = useTelegram();

  const price = Number(product.price || 0);
  const displayName = lang === 'km' && product.name_km ? product.name_km : product.name;

  return (
    <Link
      to={`/product/${product.slug}`}
      onClick={() => haptic('selection')}
      className="group flex flex-col justify-between rounded-3xl p-3 sm:p-4 bg-[#1e0208]/95 sm:bg-[#25030a]/95 border border-rose-900/40 hover:border-rose-500/60 transition-all duration-300 relative overflow-hidden shadow-2xl card-hover-effect"
    >
      {/* Animated Glowing HOT Badge */}
      {product.featured && (
        <div className="absolute top-3 left-3 z-10 flex items-center pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-black text-[10px] tracking-wider border border-amber-300/80 flex items-center gap-1 shadow-lg animate-hot-badge">
            <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950 animate-zap-wiggle" />
            HOT
          </span>
        </div>
      )}

      {/* 1. Image container (Full Image Display) */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#0a0204] mb-3 border border-rose-950/70 flex items-center justify-center p-1">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600'}
          alt={displayName}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-xl"
        />
      </div>

      {/* 2. Content Stack */}
      <div className="flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Product Title */}
          <h3 className="font-black text-sm sm:text-base text-slate-100 group-hover:text-emerald-300 transition-colors uppercase tracking-wide line-clamp-2 leading-snug">
            {displayName}
          </h3>
        </div>

        {/* 3. Price & Stock Details */}
        <div className="pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-400">$</span>
              <span className="text-xl sm:text-2xl font-black text-slate-100">
                {price.toFixed(2)}
              </span>
            </div>

            <StockBadge quantity={product.stock_quantity || 0} stockType={product.stock_type} />
          </div>
        </div>
      </div>
    </Link>
  );
}
