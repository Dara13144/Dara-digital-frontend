import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Zap,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Star,
  Minus,
  Plus,
  Info,
  CheckCircle2
} from 'lucide-react';
import { endpoints } from '../services/api.js';
import { StockBadge } from '../components/product/StockBadge.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTelegram } from '../hooks/useTelegram.js';

export function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { buyNow } = useCart();
  const { lang, t } = useLanguage();
  const { haptic, showBackButton, hideBackButton } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    showBackButton(() => navigate(-1));
    return () => hideBackButton();
  }, [showBackButton, hideBackButton, navigate]);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await endpoints.getProductBySlug(slug);
        if (res.success && res.data) {
          setProduct(res.data);
        }
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        {t('common.loading')}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-400">Product not found.</p>
        <Link to="/shop" className="text-xs text-emerald-400 font-bold hover:underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const price = Number(product.price || 0);

  const isOutOfStock = (product.stock_quantity || 0) <= 0;
  const displayName = lang === 'km' && product.name_km ? product.name_km : product.name;
  const description = lang === 'km' && product.description_km ? product.description_km : product.description;

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    buyNow(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top back button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-slate-400">
          <Link to="/shop" className="hover:text-emerald-400">Shop</Link> / {displayName}
        </span>
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        {/* Product Image (Full Visible Image - No Cropping) */}
        <div className="rounded-3xl overflow-hidden bg-[#0c0407] border border-slate-800/90 w-full flex items-center justify-center relative shadow-2xl p-1.5 sm:p-2 min-h-[200px] max-h-[500px]">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600'}
            alt={displayName}
            className="w-full h-auto max-h-[480px] object-contain rounded-2xl"
          />
        </div>

        {/* 1. Product Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-wide leading-tight pt-1">
          {displayName}
        </h1>

        {/* 2. Price */}
        <div className="flex items-baseline gap-1.5 pt-1">
          <span className="text-3xl sm:text-4xl font-black text-emerald-400">$</span>
          <span className="text-3xl sm:text-4xl font-black text-white">
            {price.toFixed(2)}
          </span>
        </div>

        {/* 5. Quantity Selector & In Stock */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0f172a]/60 border border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Quantity</span>
            <StockBadge quantity={product.stock_quantity || 0} stockType={product.stock_type} />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 disabled:opacity-40 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-black text-sm text-slate-100 w-6 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stock_quantity || 1, q + 1))}
              disabled={quantity >= (product.stock_quantity || 1) || isOutOfStock}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 disabled:opacity-40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6. Big Full-Width Bright Green Action Button: ទិញឥឡូវ (Buy Now) */}
        <div className="pt-2">
          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`w-full py-4 sm:py-4.5 px-6 rounded-2xl flex items-center justify-center gap-2 font-black text-lg sm:text-xl transition-all shadow-glow-green active:scale-[0.98] ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 border border-emerald-300/40 shadow-xl'
            }`}
          >
            <span>{lang === 'km' ? 'ទិញឥឡូវ' : `Buy Now — $${(price * quantity).toFixed(2)}`}</span>
          </button>
        </div>
      </div>

      {/* Description & Instructions Tabs */}
      <div className="space-y-4 pt-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400" />
            <span>Product Description</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
