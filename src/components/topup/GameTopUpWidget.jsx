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
  Plus,
  Settings,
  Clock,
  Camera,
  Upload
} from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTelegram } from '../../hooks/useTelegram.js';
import { endpoints } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { RobloxUserChecker } from '../roblox/RobloxUserChecker.jsx';
import { QuickImageUploadModal } from './QuickImageUploadModal.jsx';

const DEFAULT_PACKAGES = [
  // --- GamePass Packages (Blox Fruits & Roblox) ---
  {
    id: '20000000-0000-0000-0000-000000000051',
    name: '2x Mastery GamePass (Blox Fruits)',
    name_km: 'GamePass 2x Mastery (Blox Fruits)',
    amount: '2x Mastery',
    price: 4.99,
    originalPrice: 6.50,
    badge: 'Best Seller',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    discount: '-23%',
    icon: Sparkles,
    image_url: null,
    popular: true,
    isGamepass: true,
    isBlox: true
  },
  {
    id: '20000000-0000-0000-0000-000000000052',
    name: '2x Money GamePass (Blox Fruits)',
    name_km: 'GamePass 2x Money (Blox Fruits)',
    amount: '2x Money',
    price: 4.99,
    originalPrice: 6.50,
    badge: 'Hot Deal',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    discount: '-23%',
    icon: Flame,
    image_url: null,
    popular: true,
    isGamepass: true,
    isBlox: true
  },
  {
    id: '20000000-0000-0000-0000-000000000053',
    name: 'Dark Blade (Yoru) GamePass',
    name_km: 'GamePass Dark Blade / Yoru',
    amount: 'Dark Blade',
    price: 12.99,
    originalPrice: 16.00,
    badge: 'Mythical',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    discount: '-19%',
    icon: Zap,
    image_url: null,
    popular: true,
    isGamepass: true,
    isBlox: true
  },
  {
    id: '20000000-0000-0000-0000-000000000054',
    name: 'Fast Boats (Luxury Boats) GamePass',
    name_km: 'GamePass Fast Boats',
    amount: 'Fast Boats',
    price: 3.99,
    originalPrice: 5.00,
    badge: 'Popular',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    discount: '-20%',
    icon: Gamepad2,
    image_url: null,
    popular: false,
    isGamepass: true,
    isBlox: true
  },
  {
    id: '20000000-0000-0000-0000-000000000055',
    name: '2x Boss Drops GamePass',
    name_km: 'GamePass 2x Boss Drops',
    amount: '2x Drops',
    price: 3.99,
    originalPrice: 5.00,
    badge: 'Starter',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    discount: '-20%',
    icon: Sparkles,
    image_url: 'https://ghstmiubmmfogscpohek.supabase.co/storage/v1/object/public/images/topup/topup_1791369869520_d3c48517.jpg',
    popular: false,
    isGamepass: true,
    isBlox: true
  },
  {
    id: '20000000-0000-0000-0000-000000000056',
    name: '+1 Fruit Storage (+1 Capacity)',
    name_km: 'GamePass +1 Fruit Storage',
    amount: '+1 Storage',
    price: 2.99,
    originalPrice: 5.50,
    badge: 'Best Value',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    discount: '-18%',
    icon: Sparkles,
    image_url: 'https://ghstmiubmmfogscpohek.supabase.co/storage/v1/object/public/images/topup/topup_1791367441974_5a3c629a.jpg',
    popular: true,
    isGamepass: true,
    isBlox: true
  },
  {
    id: '20000000-0000-0000-0000-000000000057',
    name: 'Fruit Notifier GamePass',
    name_km: 'GamePass Fruit Notifier',
    amount: 'Notifier',
    price: 13.99,
    originalPrice: 32.00,
    badge: 'VIP / Ultra',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    discount: '-13%',
    icon: Flame,
    image_url: 'https://ghstmiubmmfogscpohek.supabase.co/storage/v1/object/public/images/topup/topup_1791371516852_c441396a.jpg',
    popular: true,
    isGamepass: true,
    isBlox: true
  },

  // --- Robux Packages ---
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
  },

  // --- Blox Fruits Beli & Fragments Raid Package ---
  {
    id: '20000000-0000-0000-0000-000000000013',
    name: 'Blox Fruits 5M Beli + 15k Fragments',
    name_km: 'កញ្ចប់ 5M Beli + 15k Fragments (Blox Fruits)',
    amount: '5M Beli + 15k Frag',
    price: 3.50,
    originalPrice: 5.00,
    badge: 'Popular',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    discount: '-30%',
    icon: Gamepad2,
    popular: true,
    isBlox: true
  }
];

export function GameTopUpWidget({ onDirectCheckout, initialTab = 'all' }) {
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

  const [filterTab, setFilterTab] = useState(initialTab || 'all');
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [selectedPkg, setSelectedPkg] = useState(() => {
    if (initialTab === 'gamepass') {
      return DEFAULT_PACKAGES.find((p) => p.isGamepass) || DEFAULT_PACKAGES[0];
    }
    return DEFAULT_PACKAGES[0];
  });
  const [verified, setVerified] = useState(() => !!robloxUser);

  // Sync initialTab when props change (e.g. navigation URL changes)
  useEffect(() => {
    if (initialTab && ['all', 'gamepass', 'robux', 'bloxfruits'].includes(initialTab)) {
      setFilterTab(initialTab);
      if (initialTab === 'gamepass') {
        const firstGp = packages.find((p) => p.isGamepass);
        if (firstGp) setSelectedPkg(firstGp);
      } else if (initialTab === 'robux') {
        const firstRobux = packages.find((p) => !p.isBlox && !p.isGamepass);
        if (firstRobux) setSelectedPkg(firstRobux);
      }
    }
  }, [initialTab]);

  const { addToCart } = useCart();
  const { user, isAdmin } = useAuth();
  const { lang } = useLanguage();
  const { haptic } = useTelegram();
  const toast = useToast();
  const navigate = useNavigate();

  // Load actual backend topup products from Supabase/API
  const loadTopUpProducts = async () => {
    try {
      const [topupRes, gamepassRes] = await Promise.all([
        endpoints.getProducts({ categorySlug: 'topup', sortBy: 'price_asc', limit: 50 }).catch(() => null),
        endpoints.getProducts({ categorySlug: 'gamepass', sortBy: 'price_asc', limit: 50 }).catch(() => null)
      ]);

      const fetchedItems = [
        ...(topupRes?.success && Array.isArray(topupRes.data?.items) ? topupRes.data.items : []),
        ...(gamepassRes?.success && Array.isArray(gamepassRes.data?.items) ? gamepassRes.data.items : [])
      ];

      if (fetchedItems.length > 0) {
        const mapped = fetchedItems.map((prod, index) => {
          const isGamepass =
            prod.name.toLowerCase().includes('gamepass') ||
            prod.category?.slug === 'gamepass' ||
            prod.description?.toLowerCase().includes('gamepass');

          const isBlox =
            prod.name.toLowerCase().includes('blox') ||
            prod.name.toLowerCase().includes('beli') ||
            isGamepass;

          const isRobux =
            (prod.name.toLowerCase().includes('robux') || prod.name.includes('R$')) &&
            !isGamepass;

          const numMatch = prod.name.match(/[\d,]+/)?.[0];
          const amountDisplay = isRobux
            ? (numMatch ? `${numMatch} R$` : 'Robux')
            : (prod.name.match(/\((.*?)\)/)?.[1] || prod.name);

          const badge = prod.badge || (
            isGamepass ? 'GamePass' :
            index === 0 ? 'Starter' :
            index === 4 ? 'Best Value' :
            'Popular'
          );

          let badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
          if (badge === 'Starter' || badge === 'Best Value' || badge === 'Super Value') {
            badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
          } else if (badge === 'Special') {
            badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
          } else if (badge === 'Hot Deal') {
            badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
          } else if (isGamepass) {
            badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
          }

          const rawImage = prod.images?.[0] || prod.image_url || null;
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
            icon: isGamepass ? Sparkles : isBlox ? Gamepad2 : Zap,
            image_url: rawImage,
            images: prod.images && prod.images.length > 0 ? prod.images : (rawImage ? [rawImage] : []),
            popular: badge === 'Popular' || badge === 'Best Value' || isGamepass,
            isBlox,
            isGamepass,
            productData: prod
          };
        });

        // Merge with DEFAULT_PACKAGES so predefined gamepasses remain present
        const mergedMap = new Map();
        DEFAULT_PACKAGES.forEach((p) => mergedMap.set(p.id, p));
        mapped.forEach((p) => {
          const existing = mergedMap.get(p.id);
          if (existing) {
            mergedMap.set(p.id, {
              ...existing,
              ...p,
              image_url: (p.image_url && p.image_url !== '/categories/gamepass.png' && p.image_url !== '/categories/topup.png')
                ? p.image_url
                : (existing.image_url || p.image_url),
              images: (p.images && p.images.length > 0 && p.images[0] !== '/categories/gamepass.png')
                ? p.images
                : (existing.images || p.images)
            });
          } else {
            mergedMap.set(p.id, p);
          }
        });
        const mergedList = Array.from(mergedMap.values());

        setPackages(mergedList);
        setSelectedPkg((prev) => {
          if (!prev) return mergedList[0];
          const fresh = mergedList.find((p) => p.id === prev.id);
          return fresh || mergedList[0];
        });
      }
    } catch (err) {
      // Fall back to defaults
    }
  };

  const [uploadModalPkg, setUploadModalPkg] = useState(null);

  const handleImageUpdated = (updatedPkg) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === updatedPkg.id ? { ...p, ...updatedPkg } : p))
    );
    if (selectedPkg?.id === updatedPkg.id) {
      setSelectedPkg((prev) => ({ ...prev, ...updatedPkg }));
    }
    loadTopUpProducts();
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

    const activePkg = packages.find((p) => p.id === selectedPkg?.id) || selectedPkg;
    const freshPrice = Number(activePkg?.price ?? selectedPkg?.price ?? 0);

    const deliveryTag = activePkg.isGamepass ? ' | Delivery: 1h-24h' : '';
    const note = robloxUser
      ? `Roblox Player: ${robloxUser.displayName} (@${robloxUser.username}) | ID: ${robloxUser.id} | Package: ${activePkg.name}${deliveryTag}`
      : `Roblox Player / ID: ${trimmedId} | Package: ${activePkg.name}${deliveryTag}`;

    const pkgImg =
      activePkg.image_url ||
      activePkg.images?.[0] ||
      activePkg.productData?.images?.[0] ||
      (activePkg.isGamepass ? '/categories/gamepass.png' : (robloxUser?.avatarUrl || '/categories/topup.png'));

    const itemToAdd = {
      id: activePkg.id,
      name: activePkg.name,
      price: freshPrice,
      image_url: pkgImg,
      stock_type: 'manual',
      categorySlug: activePkg.isGamepass ? 'gamepass' : 'topup',
      customerNotes: note
    };

    // Set quantity 1 with fresh live price
    addToCart(itemToAdd, 1, true);
    toast.success(`Selected: ${activePkg.name} ($${freshPrice.toFixed(2)}) for "${robloxUser ? robloxUser.displayName : trimmedId}"`);

    // Save to localStorage for checkout page autofill
    localStorage.setItem('daramini_topup_note', note);

    navigate('/checkout');
  };

  // Filter packages by tab
  const displayedPackages = packages.filter((pkg) => {
    if (filterTab === 'gamepass') return pkg.isGamepass;
    if (filterTab === 'robux') return !pkg.isBlox && !pkg.isGamepass;
    if (filterTab === 'bloxfruits') return pkg.isBlox && !pkg.isGamepass;
    return true;
  });

  const gamepassCount = packages.filter((p) => p.isGamepass).length;
  const robuxCount = packages.filter((p) => !p.isBlox && !p.isGamepass).length;
  const bloxCount = packages.filter((p) => p.isBlox && !p.isGamepass).length;

  return (
    <div className="relative w-full rounded-3xl bg-[#140e1b] border border-pink-500/30 p-5 sm:p-7 text-slate-100 shadow-[0_0_35px_rgba(236,72,153,0.18)] overflow-hidden">
      {/* Background Top Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-36 bg-gradient-to-bl from-pink-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-36 bg-gradient-to-tr from-amber-500/10 via-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1f0b18] border border-amber-500/50 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 p-2">
            <Sparkles className="w-full h-full text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                Roblox & Blox Fruits GamePass Top-Up
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ⚡ 100% Safe Instant Delivery
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'km'
                ? 'បញ្ចូល GamePass និង Robux ភ្លាមៗ ធានា ១០០% សុវត្ថិភាព គ្មានពាក្យសម្ងាត់'
                : 'Fast automated delivery with official guarantee & 24/7 support via @rybunrak'}
            </p>
          </div>
        </div>

      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        {/* Left Side: Step 1 (Player ID Check) + Step 2 (Packages Grid) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Enter Player ID & Live Roblox Check */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-[11px] font-black flex items-center justify-center">1</span>
                <span>Enter Roblox Username or Player ID</span>
                <span className="text-pink-400">*</span>
              </label>
              {robloxUser && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold animate-in fade-in duration-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Profile</span>
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
              <span>Live check with official Roblox servers. Your avatar is displayed automatically. Zero password required!</span>
            </p>
          </div>

          {/* STEP 2: Choose Top-Up Package */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-[11px] font-black flex items-center justify-center">2</span>
                <span>Select Package</span>
              </label>

              {/* Sub-category Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    haptic('selection');
                    setFilterTab('all');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    filterTab === 'all' ? 'bg-pink-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({packages.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    haptic('selection');
                    setFilterTab('gamepass');
                    const first = packages.find((p) => p.isGamepass);
                    if (first) setSelectedPkg(first);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    filterTab === 'gamepass'
                      ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-sm'
                      : 'text-amber-400/90 hover:text-amber-300'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>GamePass ({gamepassCount})</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-200">HOT</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    haptic('selection');
                    setFilterTab('robux');
                    const first = packages.find((p) => !p.isBlox && !p.isGamepass);
                    if (first) setSelectedPkg(first);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    filterTab === 'robux' ? 'bg-pink-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Robux ({robuxCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    haptic('selection');
                    setFilterTab('bloxfruits');
                    const first = packages.find((p) => p.isBlox && !p.isGamepass);
                    if (first) setSelectedPkg(first);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    filterTab === 'bloxfruits' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Gamepad2 className="w-3 h-3" />
                  <span>Blox Fruits ({bloxCount})</span>
                </button>
              </div>
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
                    {/* Discount or badge */}
                    {pkg.badge && (
                      <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[9px] font-black border flex items-center gap-1 ${pkg.badgeColor}`}>
                        {pkg.popular && <Flame className="w-2.5 h-2.5 text-amber-400" />}
                        {pkg.badge}
                      </span>
                    )}

                    <div className="space-y-1 mt-1">
                      {/* Image Preview / Icon Box */}
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-950/90 border border-pink-500/30 flex items-center justify-center p-1 group-hover:scale-105 transition-all mb-2 relative overflow-hidden shadow-[0_0_12px_rgba(236,72,153,0.15)]">
                        {pkg.image_url && pkg.image_url !== '/categories/gamepass.png' && pkg.image_url !== '/categories/topup.png' ? (
                          <img
                            src={pkg.image_url}
                            alt={pkg.name}
                            className="w-full h-full object-contain rounded-lg drop-shadow group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : pkg.isGamepass ? (
                          <Sparkles className="w-5 h-5 text-amber-400" />
                        ) : pkg.amount?.includes('R$') || pkg.name?.toLowerCase().includes('robux') ? (
                          <img src="/icons/robux_gold.png" alt="Robux" className="w-full h-full object-contain drop-shadow" />
                        ) : (
                          <IconComponent className="w-4 h-4 text-pink-400" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-300 line-clamp-1">{pkg.name}</p>
                      <p className="text-sm sm:text-base font-black text-white">{pkg.amount}</p>
                      {pkg.isGamepass && (
                        <p className="text-[10px] font-bold text-amber-300 flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5 text-amber-400" />
                          <span>1h - 24h Delivery</span>
                        </p>
                      )}
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
                <div className="flex items-center gap-2 max-w-[65%] justify-end">
                  {selectedPkg?.image_url && selectedPkg.image_url !== '/categories/gamepass.png' && selectedPkg.image_url !== '/categories/topup.png' && (
                    <img
                      src={selectedPkg.image_url}
                      alt={selectedPkg.name}
                      className="w-5 h-5 rounded-md object-contain bg-slate-950 border border-slate-800 shrink-0"
                    />
                  )}
                  <span className="font-bold text-white text-right truncate">{selectedPkg?.name || 'Select package'}</span>
                </div>
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
                {selectedPkg?.isGamepass ? (
                  <span className="font-bold text-amber-300 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>1 Hour - 24 Hours</span>
                  </span>
                ) : (
                  <span className="font-bold text-emerald-400">⚡ Instant (1-5 min)</span>
                )}
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
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-pink-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
              <span>
                {selectedPkg?.isGamepass ? 'Top Up GamePass' : 'Top Up Now'} (${(selectedPkg?.price || 0).toFixed(2)})
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Image Upload Modal */}
      <QuickImageUploadModal
        isOpen={Boolean(uploadModalPkg)}
        onClose={() => setUploadModalPkg(null)}
        targetPackage={uploadModalPkg}
        onImageUpdated={handleImageUpdated}
      />
    </div>
  );
}
