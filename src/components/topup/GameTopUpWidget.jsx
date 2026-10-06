import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  Gamepad2,
  Sparkles,
  ArrowRight,
  User,
  AlertCircle,
  HelpCircle,
  Flame,
  BadgeCheck,
  Info,
  Edit2,
  Plus,
  Settings
} from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTelegram } from '../../hooks/useTelegram.js';
import { endpoints } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { TopUpPackageModal } from './TopUpPackageModal.jsx';
import { RobloxUserChecker } from '../roblox/RobloxUserChecker.jsx';

const DEFAULT_PACKAGES = [
  {
    id: '20000000-0000-0000-0000-000000000100',
    name: '100 Robux Fast Top-Up',
    name_km: 'កញ្ចប់ 100 Robux ភ្លាមៗ',
    amount: '100 R$',
    price: 0.10,
    originalPrice: null,
    badge: 'Starter',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    discount: null,
    icon: Flame,
    popular: false
  },
  {
    id: '20000000-0000-0000-0000-000000000200',
    name: '200 Robux Fast Top-Up',
    name_km: 'កញ្ចប់ 200 Robux ភ្លាមៗ',
    amount: '200 R$',
    price: 1.99,
    originalPrice: null,
    badge: 'Popular',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    discount: null,
    icon: Flame,
    popular: true
  },
  {
    id: '20000000-0000-0000-0000-000000000300',
    name: '300 Robux Fast Top-Up',
    name_km: 'កញ្ចប់ 300 Robux ភ្លាមៗ',
    amount: '300 R$',
    price: 2.99,
    originalPrice: null,
    badge: 'Popular',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    discount: null,
    icon: Sparkles,
    popular: false
  },
  {
    id: '20000000-0000-0000-0000-000000000400',
    name: '400 Robux Fast Top-Up',
    name_km: 'កញ្ចប់ 400 Robux ភ្លាមៗ',
    amount: '400 R$',
    price: 3.99,
    originalPrice: null,
    badge: 'Special',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    discount: null,
    icon: Zap,
    popular: false
  },
  {
    id: '20000000-0000-0000-0000-000000000500',
    name: '500 Robux Fast Top-Up',
    name_km: 'កញ្ចប់ 500 Robux ភ្លាមៗ',
    amount: '500 R$',
    price: 4.99,
    originalPrice: null,
    badge: 'Best Value',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    discount: null,
    icon: Flame,
    popular: true
  },
  {
    id: '20000000-0000-0000-0000-000000000600',
    name: '600 Robux Fast Top-Up',
    name_km: 'កញ្ចប់ 600 Robux ភ្លាមៗ',
    amount: '600 R$',
    price: 5.99,
    originalPrice: null,
    badge: 'Popular',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    discount: null,
    icon: Sparkles,
    popular: false
  },
  {
    id: '20000000-0000-0000-0000-000000000700',
    name: '700 Robux Fast Top-Up',
    name_km: 'កញ្ចប់ 700 Robux ភ្លាមៗ',
    amount: '700 R$',
    price: 6.99,
    originalPrice: null,
    badge: 'Special',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    discount: null,
    icon: Zap,
    popular: false
  },
  {
    id: '20000000-0000-0000-0000-000000000800',
    name: '800 Robux Fast Top-Up',
    name_km: 'កញ្ចប់ 800 Robux ភ្លាមៗ',
    amount: '800 R$',
    price: 7.99,
    originalPrice: null,
    badge: 'Hot Deal',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    discount: null,
    icon: Zap,
    popular: false
  },
  {
    id: '20000000-0000-0000-0000-000000000900',
    name: '900 Robux Fast Top-Up',
    name_km: 'កញ្ចប់ 900 Robux ភ្លាមៗ',
    amount: '900 R$',
    price: 8.99,
    originalPrice: null,
    badge: 'Special',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    discount: null,
    icon: Sparkles,
    popular: false
  },
  {
    id: '20000000-0000-0000-0000-000000001000',
    name: '1,000 Robux Fast Top-Up',
    name_km: 'កញ្ចប់ 1,000 Robux ភ្លាមៗ',
    amount: '1,000 R$',
    price: 9.99,
    originalPrice: null,
    badge: 'Super Value',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    discount: null,
    icon: Flame,
    popular: true
  }
];

export function GameTopUpWidget({ onDirectCheckout }) {
  const [playerId, setPlayerId] = useState(() => {
    try {
      const saved = localStorage.getItem('daramini_roblox_user');
      if (saved) {
        const u = JSON.parse(saved);
        return u.username || '';
      }
    } catch (e) {}
    return '';
  });
  const [robloxUser, setRobloxUser] = useState(() => {
    try {
      const saved = localStorage.getItem('daramini_roblox_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [selectedPkg, setSelectedPkg] = useState(DEFAULT_PACKAGES[0]);
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'robux', 'bloxfruits'
  const [verified, setVerified] = useState(() => !!robloxUser);

  // Admin Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [packageToEdit, setPackageToEdit] = useState(null);

  const { addToCart } = useCart();
  const { user, isAdmin } = useAuth();
  const { lang } = useLanguage();
  const { haptic } = useTelegram();
  const toast = useToast();
  const navigate = useNavigate();

  // Load actual backend topup products from Supabase
  const loadTopUpProducts = async () => {
    try {
      const res = await endpoints.getProducts({ categorySlug: 'topup', sortBy: 'price_asc', limit: 50 });
      if (res.success && res.data?.items?.length > 0) {
        const mapped = res.data.items.map((prod, index) => {
          const isBlox = prod.name.toLowerCase().includes('blox') || prod.name.toLowerCase().includes('beli');
          const numMatch = prod.name.match(/[\d,]+/)?.[0];
          const isRobux = prod.name.toLowerCase().includes('robux') || prod.name.includes('R$');
          const amountDisplay = isRobux
            ? (numMatch ? `${numMatch} R$` : 'Robux')
            : (prod.name.match(/\((.*?)\)/)?.[1] || prod.name);

          // Use badge from database or fallback preset
          const badge = prod.badge || (
            index === 0 ? 'Starter' :
            index === 4 ? 'Best Value' :
            index === 7 ? 'Hot Deal' :
            index === 9 ? 'Super Value' :
            (index === 3 || index === 6 || index === 8) ? 'Special' : 'Popular'
          );

          let badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
          if (badge === 'Starter' || badge === 'Best Value' || badge === 'Super Value') {
            badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
          } else if (badge === 'Special') {
            badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
          } else if (badge === 'Hot Deal') {
            badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
          } else if (badge === 'Popular') {
            badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
          }

          return {
            id: prod.id,
            name: prod.name,
            name_km: prod.name_km || prod.name,
            amount: amountDisplay,
            price: Number(prod.discount_price || prod.price),
            originalPrice: prod.discount_price ? Number(prod.price) : null,
            badge,
            badgeColor,
            discount: prod.discount_price ? `-${Math.round((1 - prod.discount_price / prod.price) * 100)}%` : null,
            icon: isBlox ? Gamepad2 : (badge === 'Starter' || badge === 'Best Value' || badge === 'Super Value' ? Flame : Zap),
            popular: badge === 'Popular' || badge === 'Best Value' || badge === 'Super Value',
            isBlox,
            productData: prod
          };
        });
        setPackages(mapped);
        setSelectedPkg((prev) => {
          if (!prev) return mapped[0];
          const fresh = mapped.find((p) => p.id === prev.id);
          return fresh || mapped[0];
        });
      }
    } catch (err) {
      // Fall back to defaults
    }
  };

  useEffect(() => {
    loadTopUpProducts();
  }, []);

  const handleTopUpNow = () => {
    haptic('medium');
    const trimmedId = playerId.trim();
    if (!trimmedId) {
      toast.error(lang === 'km' ? 'សូមបញ្ចូល Player ID ឬ Roblox Username!' : 'Please enter your Player ID or Roblox Username!');
      return;
    }

    const note = robloxUser
      ? `Roblox: ${robloxUser.displayName} (@${robloxUser.username}) | ID: ${robloxUser.id}`
      : `Roblox Username / Player ID: ${trimmedId}`;

    // Always use the latest live package price from database
    const activePkg = packages.find((p) => p.id === selectedPkg?.id) || selectedPkg;
    const freshPrice = Number(activePkg?.price ?? selectedPkg?.price ?? 0);

    const itemToAdd = {
      id: activePkg.id,
      name: activePkg.name,
      price: freshPrice,
      image_url: robloxUser?.avatarUrl || '/categories/topup.png',
      stock_type: 'manual',
      customerNotes: note
    };

    // Set quantity 1 with fresh live price
    addToCart(itemToAdd, 1, true);
    toast.success(`Selected: ${activePkg.amount} ($${freshPrice.toFixed(2)}) for "${robloxUser ? robloxUser.displayName : trimmedId}"`);
    
    // Save to localStorage for checkout page autofill
    localStorage.setItem('daramini_topup_note', note);
    
    navigate('/checkout');
  };

  // Filter packages by tab
  const displayedPackages = packages.filter((pkg) => {
    if (filterTab === 'robux') return !pkg.isBlox;
    if (filterTab === 'bloxfruits') return pkg.isBlox;
    return true;
  });

  return (
    <div className="relative w-full rounded-3xl bg-[#140e1b] border border-pink-500/30 p-5 sm:p-7 text-slate-100 shadow-[0_0_35px_rgba(236,72,153,0.18)] overflow-hidden">
      {/* Background Top Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-36 bg-gradient-to-bl from-pink-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-36 bg-gradient-to-tr from-amber-500/10 via-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1f0b18] border border-pink-500/50 flex items-center justify-center shadow-lg shadow-pink-500/30 shrink-0 p-1.5">
            <img src="/icons/robux_gold.png" alt="Robux" className="w-full h-full object-contain animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                Roblox Fast Top-Up
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Safe
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'km' 
                ? 'បញ្ចូលលុយ Robux ភ្លាមៗ ធានា 100% គ្មានបញ្ហាគណនី' 
                : 'Fast automated delivery with official guarantee & 24/7 support'}
            </p>
          </div>
        </div>

        {/* Package Editor Header Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setPackageToEdit(null);
              setIsModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Add or Edit Top-Up Packages in Supabase"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Package</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        {/* Left Side: Step 1 (Player ID) + Step 2 (Packages Grid) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Enter Player ID & Live Roblox Check */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-[11px] font-black flex items-center justify-center">1</span>
                <span>Enter Player ID / Roblox Username</span>
                <span className="text-pink-400">*</span>
              </label>
              {robloxUser && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold animate-in fade-in duration-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Player Profile</span>
                </span>
              )}
            </div>

            <RobloxUserChecker
              value={playerId}
              onChange={(val) => {
                setPlayerId(val);
                setVerified(val.trim().length >= 2);
              }}
              onVerified={(user) => {
                setRobloxUser(user);
                if (user) {
                  setPlayerId(user.username);
                  setVerified(true);
                }
              }}
            />

            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pl-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Instant verification with official Roblox servers. No password required!</span>
            </p>
          </div>

          {/* STEP 2: Choose Top-Up Package */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-[11px] font-black flex items-center justify-center">2</span>
                <span>Select Top-Up Package</span>
              </label>

              {/* Sub-category Filter Tabs */}
              {packages.some((p) => p.isBlox) && (
                <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterTab('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      filterTab === 'all' ? 'bg-pink-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({packages.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('robux')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      filterTab === 'robux' ? 'bg-pink-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Robux
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('bloxfruits')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      filterTab === 'bloxfruits' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Blox Fruits
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {displayedPackages.map((pkg) => {
                const isSelected = selectedPkg?.id === pkg.id;
                const IconComponent = pkg.icon || Zap;
                const priceInKhr = Math.round(pkg.price * 4100).toLocaleString();

                return (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      haptic('selection');
                      setSelectedPkg(pkg);
                    }}
                    className={`relative p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 active:scale-98 flex flex-col justify-between group overflow-hidden cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#22162b] to-[#170e1f] border-2 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.35)] scale-[1.02]'
                        : 'bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Package quick edit button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPackageToEdit(pkg);
                        setIsModalOpen(true);
                      }}
                      className="absolute top-2.5 left-2.5 z-20 w-6 h-6 rounded-lg bg-slate-800/90 hover:bg-pink-500 text-slate-300 hover:text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-all border border-slate-700 shadow-sm"
                      title="Edit this package in Supabase"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    {/* Discount or badge */}
                    {pkg.badge && (
                      <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[9px] font-black border flex items-center gap-1 ${pkg.badgeColor}`}>
                        {pkg.popular && <img src="/icons/hot_flame.png" alt="HOT" className="w-2.5 h-2.5 object-contain" />}
                        {pkg.badge}
                      </span>
                    )}

                    <div className="space-y-1 mt-1">
                      <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center p-1 group-hover:scale-110 transition-transform mb-2">
                        {pkg.amount?.includes('R$') || pkg.name?.toLowerCase().includes('robux') ? (
                          <img src="/icons/robux_gold.png" alt="Robux" className="w-full h-full object-contain drop-shadow" />
                        ) : (
                          <IconComponent className="w-4 h-4 text-pink-400" />
                        )}
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
                  </div>
                );
              })}

              {/* Add Package Card (To Supabase) */}
              <button
                type="button"
                onClick={() => {
                  setPackageToEdit(null);
                  setIsModalOpen(true);
                }}
                className="p-3.5 sm:p-4 rounded-2xl border-2 border-dashed border-slate-800 hover:border-pink-500/60 bg-slate-900/30 hover:bg-slate-900/60 text-slate-400 hover:text-pink-400 flex flex-col items-center justify-center gap-2 transition-all min-h-[140px] group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-pink-500/20 flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5 text-slate-400 group-hover:text-pink-400" />
                </div>
                <span className="text-xs font-bold">Add Package</span>
                <span className="text-[10px] text-slate-500">To Supabase</span>
              </button>
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
                <span className="font-bold text-white text-right">{selectedPkg?.name || 'Select package'}</span>
              </div>
              <div className="flex justify-between items-start text-xs gap-2">
                <span className="text-slate-400 shrink-0">Delivery Target:</span>
                {robloxUser ? (
                  <div className="flex items-center gap-1.5 text-right">
                    <img
                      src={robloxUser.avatarUrl}
                      alt={robloxUser.username}
                      className="w-5 h-5 rounded-full border border-emerald-400 object-cover shrink-0"
                    />
                    <div>
                      <p className="font-bold text-white text-[11px] leading-tight">
                        {robloxUser.displayName}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-mono">
                        @{robloxUser.username}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="font-mono font-bold text-pink-400 text-right truncate">
                    {playerId.trim() || '(Enter above)'}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Delivery Speed:</span>
                <span className="font-bold text-emerald-400">⚡ Instant (1-3 min)</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">Total Price:</span>
                <div className="text-right">
                  <span className="text-lg font-black text-white">
                    ${(selectedPkg?.price || 0).toFixed(2)}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ≈ {Math.round((selectedPkg?.price || 0) * 4100).toLocaleString()} ៛
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

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTopUpNow}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-pink-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 group"
            >
              <Zap className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
              <span>Top Up Now (${(selectedPkg?.price || 0).toFixed(2)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Package Add / Edit Modal */}
      <TopUpPackageModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPackageToEdit(null);
        }}
        packageToEdit={packageToEdit}
        onSaved={loadTopUpProducts}
      />
    </div>
  );
}
