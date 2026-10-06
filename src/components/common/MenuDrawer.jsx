import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  Home,
  Grid,
  Wallet,
  Package,
  User,
  ShieldCheck,
  Headphones,
  Languages,
  Sun,
  Moon,
  Plus,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Zap,
  Tag,
  Boxes,
  Users,
  CreditCard,
  SlidersHorizontal,
  FileText,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTelegram } from '../../hooks/useTelegram.js';
import { UserAvatar } from './UserAvatar.jsx';

export function MenuDrawer({ isOpen, onClose, onOpenTopUp }) {
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const { haptic, openTelegramApp } = useTelegram();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const balance = Number(user?.balance || 0);

  const mainNavLinks = [
    { to: '/', label: lang === 'km' ? 'ទំព័រដើម' : 'Home', icon: Home, color: 'text-cyan-400' },
    { to: '/shop', label: lang === 'km' ? 'ផលិតផលទាំងអស់' : 'All Products & Games', icon: Grid, color: 'text-sky-400' },
    { to: '/wallet', label: lang === 'km' ? 'កាបូបលុយ (Wallet)' : 'Wallet & Balance', icon: Wallet, color: 'text-teal-400' },
    { to: '/orders', label: lang === 'km' ? 'ការបញ្ជាទិញ & កូដឌីជីថល' : 'My Orders & Digital Keys', icon: Package, color: 'text-blue-400' },
    { to: '/profile', label: lang === 'km' ? 'គណនីរបស់ខ្ញុំ' : 'My Profile & Settings', icon: User, color: 'text-purple-400' },
    { to: '/support', label: lang === 'km' ? 'ជំនួយ & សេវាបម្រើ' : 'Customer Support', icon: Headphones, color: 'text-pink-400' }
  ];

  const adminNavLinks = [
    { to: '/admin', label: 'Admin Overview', icon: ShieldCheck },
    { to: '/admin/products', label: 'Products & Catalog', icon: Tag },
    { to: '/admin/stock', label: 'Digital Stock & Keys', icon: Boxes },
    { to: '/admin/orders', label: 'Orders & Deliveries', icon: Package },
    { to: '/admin/payments', label: 'Payments & Audits', icon: CreditCard },
    { to: '/admin/users', label: 'Users & Wallets', icon: Users },
    { to: '/admin/categories', label: 'Categories', icon: Grid },
    { to: '/admin/coupons', label: 'Coupons & Promos', icon: Zap },
    { to: '/admin/settings', label: 'Store Settings', icon: SlidersHorizontal },
    { to: '/admin/logs', label: 'Activity Logs', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in-50 duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out Drawer Menu */}
      <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-slate-900/98 border-r border-slate-800 text-slate-100 flex flex-col z-10 shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
            <img src="/maiser_logo.png" alt="Maiser Store" className="h-9 w-9 rounded-xl object-cover shadow-sm" />
            <span className="font-black text-base text-white tracking-wide">Maiser Store</span>
          </Link>

          <button
            onClick={() => {
              haptic('light');
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Card in Drawer */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="md" showBadge={isAdmin} ring={true} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-100 truncate">
                  {user?.first_name} {user?.last_name || ''}
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black">
                    👑 Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                @{user?.username || 'telegram_user'}
              </p>
            </div>
          </div>

          {/* Quick Balance & Top Up Box */}
          <div className="mt-3 p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Balance</span>
                <span className="text-xs font-black text-emerald-400 font-mono">
                  ${balance.toFixed(2)} USD
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                haptic('medium');
                onClose();
                if (onOpenTopUp) onOpenTopUp();
              }}
              className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] shadow-sm transition-all flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>{lang === 'km' ? 'បញ្ចូលលុយ' : 'Top Up'}</span>
            </button>
          </div>
        </div>

        {/* Main Nav Links */}
        <div className="p-3 flex-1 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {lang === 'km' ? 'ម៉ឺនុយចម្បង' : 'Main Menu'}
          </div>

          {mainNavLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => {
                  haptic('selection');
                  onClose();
                }}
                className={`flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-xl bg-slate-800/80 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black shadow-glow-green">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Link>
            );
          })}

          {/* Admin Management Section (Visible to Admin only) */}
          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-slate-800 space-y-1">
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Portal</span>
              </div>

              {adminNavLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      haptic('selection');
                      onClose();
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-amber-400" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Preferences & Bot Link */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
          {/* Telegram Bot Card */}
          <a
            href="https://t.me/DaraDigital_bot"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => haptic('medium')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 border border-sky-500/30 hover:border-sky-400 text-slate-200 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Send className="w-4 h-4 fill-sky-400/20" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black text-slate-100 group-hover:text-sky-300 transition-colors">
                  @DaraDigital_bot
                </p>
                <p className="text-[9px] text-sky-400 font-medium">Official Telegram Bot</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <div className="grid grid-cols-2 gap-2">
            {/* Language Switch */}
            <button
              onClick={() => {
                haptic('selection');
                toggleLanguage();
              }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'km' ? 'ភាសាខ្មែរ (KM)' : 'English (EN)'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                haptic('selection');
                toggleTheme();
              }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors capitalize"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-sky-400" />
              )}
              <span>{theme}</span>
            </button>
          </div>

          <div className="text-center text-[10px] text-slate-400">
            Maiser Store • Telegram Mini App v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
