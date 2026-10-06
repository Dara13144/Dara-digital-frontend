import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  Gamepad2,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  User,
  AlertCircle,
  HelpCircle,
  Flame,
  BadgeCheck,
  Info
} from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTelegram } from '../../hooks/useTelegram.js';
import { endpoints } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

const DEFAULT_PACKAGES = [
  {
    id: '20000000-0000-0000-0000-000000000010',
    name: '500 Robux Fast Top-Up',
    name_km: 'កញ្ចប់ 500 Robux ភ្លាមៗ',
    amount: '500 R$',
    price: 4.20,
    originalPrice: 4.99,
    badge: 'Popular',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    discount: '-16%',
    icon: Flame,
    popular: true
  },
  {
    id: '20000000-0000-0000-0000-000000000011',
    name: '1,000 Robux Instant Top-Up',
    name_km: 'កញ្ចប់ 1,000 Robux ពិសេស',
    amount: '1,000 R$',
    price: 8.50,
    originalPrice: 9.99,
    badge: 'Best Value',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    discount: '-15%',
    icon: Sparkles,
    popular: false
  },
  {
    id: '20000000-0000-0000-0000-000000000012',
    name: '2,000 Robux Pro Pack',
    name_km: 'កញ្ចប់ 2,000 Robux Pro',
    amount: '2,000 R$',
    price: 16.90,
    originalPrice: 19.99,
    badge: 'Hot Deal',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    discount: '-15%',
    icon: Zap,
    popular: false
  },
  {
    id: '20000000-0000-0000-0000-000000000013',
    name: 'Blox Fruits Beli & Fragments Top-Up',
    name_km: 'Beli 5M + 15k Fragments (Blox Fruits)',
    amount: '5M Beli + 15k Frag',
    price: 3.50,
    originalPrice: 5.00,
    badge: 'Raid Pack',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    discount: '-30%',
    icon: Gamepad2,
    popular: false
  }
];

export function GameTopUpWidget({ onDirectCheckout }) {
  const [playerId, setPlayerId] = useState('');
  const [selectedPkg, setSelectedPkg] = useState(DEFAULT_PACKAGES[0]);
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [serverRegion, setServerRegion] = useState('Global');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const { addToCart } = useCart();
  const { lang } = useLanguage();
  const { haptic } = useTelegram();
  const toast = useToast();
  const navigate = useNavigate();

  // Try to load actual backend topup products if available
  useEffect(() => {
    async function loadTopUpProducts() {
      try {
        const res = await endpoints.getProducts({ categorySlug: 'topup', limit: 10 });
        if (res.success && res.data?.items?.length > 0) {
          const mapped = res.data.items.map((prod, index) => ({
            id: prod.id,
            name: prod.name,
            name_km: prod.name_km || prod.name,
            amount: prod.name.match(/\((.*?)\)/)?.[1] || prod.name,
            price: Number(prod.discount_price || prod.price),
            originalPrice: prod.discount_price ? Number(prod.price) : null,
            badge: index === 0 ? 'Popular' : index === 1 ? 'Best Value' : 'Special',
            badgeColor: index === 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-pink-500/20 text-pink-300 border-pink-500/30',
            discount: prod.discount_price ? `-${Math.round((1 - prod.discount_price / prod.price) * 100)}%` : null,
            icon: Zap,
            productData: prod
          }));
          setPackages(mapped);
          setSelectedPkg(mapped[0]);
        }
      } catch (err) {
        // Fall back to default
      }
    }
    loadTopUpProducts();
  }, []);

  const handlePlayerIdChange = (e) => {
    const val = e.target.value;
    setPlayerId(val);
    setVerified(val.trim().length >= 3);
  };

  const handleTopUpNow = () => {
    haptic('medium');
    const trimmedId = playerId.trim();
    if (!trimmedId) {
      toast.error(lang === 'km' ? 'សូមបញ្ចូល Player ID ឬ Roblox Username!' : 'Please enter your Player ID or Roblox Username!');
      return;
    }

    const itemToAdd = {
      id: selectedPkg.id,
      name: selectedPkg.name,
      price: selectedPkg.price,
      image_url: '/categories/topup.png',
      stock_type: 'manual',
      customerNotes: `Roblox Username / Player ID: ${trimmedId} (Server: ${serverRegion})`
    };

    addToCart(itemToAdd, 1);
    toast.success(`Selected: ${selectedPkg.amount} for "${trimmedId}"`);
    
    // Save to localStorage for checkout page autofill
    localStorage.setItem('daramini_topup_note', `Roblox Player ID / Username: ${trimmedId} (Region: ${serverRegion})`);
    
    navigate('/checkout');
  };

  const handleAddToCart = () => {
    haptic('light');
    const trimmedId = playerId.trim();
    if (!trimmedId) {
      toast.error(lang === 'km' ? 'សូមបញ្ចូល Player ID ឬ Roblox Username!' : 'Please enter your Player ID or Roblox Username!');
      return;
    }

    const itemToAdd = {
      id: selectedPkg.id,
      name: selectedPkg.name,
      price: selectedPkg.price,
      image_url: '/categories/topup.png',
      stock_type: 'manual',
      customerNotes: `Roblox Username / Player ID: ${trimmedId} (Server: ${serverRegion})`
    };

    addToCart(itemToAdd, 1);
    toast.success(lang === 'km' ? 'បានបន្ថែមទៅកន្រ្តក!' : `Added ${selectedPkg.amount} to Cart!`);
  };

  return (
    <div className="relative w-full rounded-3xl bg-[#140e1b] border border-pink-500/30 p-5 sm:p-7 text-slate-100 shadow-[0_0_35px_rgba(236,72,153,0.18)] overflow-hidden">
      {/* Background Top Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-36 bg-gradient-to-bl from-pink-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-36 bg-gradient-to-tr from-amber-500/10 via-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30 shrink-0">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                Roblox & Game Instant Top-Up
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Safe
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'km' 
                ? 'បញ្ចូលលុយ Robux និងហ្គេមភ្លាមៗ ធានា 100% គ្មានបញ្ហាគណនី' 
                : 'Fast automated delivery with official guarantee & 24/7 support'}
            </p>
          </div>
        </div>

        {/* Server Tag */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-slate-400 font-medium">Server:</span>
          <select
            value={serverRegion}
            onChange={(e) => setServerRegion(e.target.value)}
            className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-bold text-slate-200 outline-none cursor-pointer"
          >
            <option value="Global">Global / Worldwide</option>
            <option value="Southeast Asia">Southeast Asia (SEA)</option>
            <option value="North America">North America (US)</option>
          </select>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        {/* Left Side: Step 1 (Player ID) + Step 2 (Packages Grid) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Enter Player ID */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-[11px] font-black flex items-center justify-center">1</span>
                <span>Enter Player ID / Roblox Username</span>
                <span className="text-pink-400">*</span>
              </label>
              {verified && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold animate-in fade-in duration-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready for Top-Up</span>
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={playerId}
                onChange={handlePlayerIdChange}
                placeholder="e.g. GamerPro_123 or Roblox User ID"
                className="w-full h-12 pl-11 pr-24 rounded-2xl bg-slate-950/80 border border-slate-700/80 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-sm font-semibold text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              {playerId.trim() && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-pink-500/20 border border-pink-500/40 text-[10px] font-black text-pink-300">
                  TARGET ID
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pl-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Ensure your username is spelled correctly. No account password required!</span>
            </p>
          </div>

          {/* STEP 2: Choose Top-Up Package */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-[11px] font-black flex items-center justify-center">2</span>
                <span>Select Top-Up Package</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Instant Fulfillment</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {packages.map((pkg) => {
                const isSelected = selectedPkg.id === pkg.id;
                const IconComponent = pkg.icon || Zap;
                const priceInKhr = Math.round(pkg.price * 4100).toLocaleString();

                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => {
                      haptic('selection');
                      setSelectedPkg(pkg);
                    }}
                    className={`relative p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 active:scale-98 flex flex-col justify-between group overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#22162b] to-[#170e1f] border-2 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.35)] scale-[1.02]'
                        : 'bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Discount or badge */}
                    {pkg.badge && (
                      <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[9px] font-black border ${pkg.badgeColor}`}>
                        {pkg.badge}
                      </span>
                    )}

                    <div className="space-y-1">
                      <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform mb-2">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-slate-300 line-clamp-1">{pkg.name}</p>
                      <p className="text-sm sm:text-base font-black text-white">{pkg.amount}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-baseline justify-between">
                      <div>
                        <div className="text-sm font-black text-pink-400">
                          ${pkg.price.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {priceInKhr} ៛
                        </div>
                      </div>
                      {pkg.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through">
                          ${pkg.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Step 3 (Summary & Action) */}
        <div className="lg:col-span-4 flex flex-col justify-between p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-[11px] font-black flex items-center justify-center">3</span>
              <span>Order Summary</span>
            </h3>

            {/* Selected package overview */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Package:</span>
                <span className="font-bold text-white text-right">{selectedPkg.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Delivery Target:</span>
                <span className="font-mono font-bold text-pink-400">
                  {playerId.trim() || '(Enter above)'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Delivery Speed:</span>
                <span className="font-bold text-emerald-400">⚡ Instant (1-3 min)</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">Total Price:</span>
                <div className="text-right">
                  <span className="text-lg font-black text-white">
                    ${selectedPkg.price.toFixed(2)}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ≈ {Math.round(selectedPkg.price * 4100).toLocaleString()} ៛
                  </div>
                </div>
              </div>
            </div>

            {/* Safe badges */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero Password</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>ABA & Wallet</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleTopUpNow}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-pink-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 group"
            >
              <Zap className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
              <span>Top Up Now (${selectedPkg.price.toFixed(2)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-bold text-xs active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
