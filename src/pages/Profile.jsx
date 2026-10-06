import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Wallet,
  Languages,
  Moon,
  Sun,
  ShieldCheck,
  Headphones,
  ExternalLink,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Camera,
  Plus,
  Bot,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTelegram } from '../hooks/useTelegram.js';
import { endpoints } from '../services/api.js';
import { UserAvatar } from '../components/common/UserAvatar.jsx';
import { TopUpModal } from '../components/payment/TopUpModal.jsx';

export function Profile() {
  const { user, isAdmin, setUser, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const { haptic } = useTelegram();
  const toast = useToast();
  const [syncingAvatar, setSyncingAvatar] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);

  const handleSyncTelegramAvatar = async () => {
    haptic('medium');
    setSyncingAvatar(true);
    try {
      const res = await endpoints.syncAvatar();
      if (res.success && res.data?.avatar_url) {
        setUser((prev) => ({ ...prev, avatar_url: res.data.avatar_url }));
        toast.success('Telegram profile photo updated!');
      } else {
        await refreshProfile();
        toast.success('Profile synced with Telegram');
      }
    } catch (err) {
      toast.info('Telegram photo is up to date.');
    } finally {
      setSyncingAvatar(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <UserAvatar user={user} size="xl" showBadge={isAdmin} ring={true} />
            <button
              onClick={handleSyncTelegramAvatar}
              disabled={syncingAvatar}
              title="Sync Photo from Telegram"
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-900 border border-emerald-500/50 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingAvatar ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-100 truncate">
                {user?.first_name} {user?.last_name || ''}
              </h2>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm">
                  👑 Super Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              @{user?.username || 'telegram_user'}
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              ID: {user?.telegram_id || 'N/A'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Link
                to="/wallet"
                className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 hover:text-emerald-400 transition-colors"
              >
                <Wallet className="w-3 h-3 text-emerald-400" />
                {t('profile.balance')}
              </Link>
              <button
                onClick={() => {
                  haptic('medium');
                  setTopUpOpen(true);
                }}
                className="px-2 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-black transition-colors flex items-center gap-0.5"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>Top Up</span>
              </button>
            </div>
            <p className="text-lg font-black text-emerald-400 mt-1 font-mono">
              ${Number(user?.balance || 0).toFixed(2)}
            </p>
          </div>

          <Link
            to="/orders"
            className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-400" />
              {t('profile.ordersCount')}
            </span>
            <p className="text-lg font-black text-teal-400 mt-1 font-mono">
              {user?.order_count || 0}
            </p>
          </Link>
        </div>
      </div>

      {/* Prominent Admin Portal Banner (Only shown if user has Admin role) */}
      {isAdmin && (
        <Link
          to="/admin"
          className="block p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-slate-900 border border-amber-500/40 hover:border-amber-400 transition-all shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-100 group-hover:text-amber-300 transition-colors">
                  Store Admin Dashboard
                </h4>
                <p className="text-xs text-slate-400">
                  Manage stock, bulk upload keys, orders & revenue analytics
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      )}

      {/* Settings Options */}
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
          Preferences & Support
        </h3>

        <div className="glass-card rounded-2xl border border-slate-800 divide-y divide-slate-800/80">
          {/* Language */}
          <button
            onClick={() => {
              haptic('selection');
              toggleLanguage();
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Languages className="w-4 h-4 text-emerald-400" />
              <span>{t('profile.language')}</span>
            </div>
            <span className="font-bold text-emerald-400 uppercase">
              {lang === 'km' ? 'ភាសាខ្មែរ (KM)' : 'English (EN)'}
            </span>
          </button>

          {/* Theme */}
          <button
            onClick={() => {
              haptic('selection');
              toggleTheme();
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-sky-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <span>{t('profile.theme')}</span>
            </div>
            <span className="text-slate-400 capitalize">{theme}</span>
          </button>

          {/* Customer Support */}
          <Link
            to="/support"
            className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Headphones className="w-4 h-4 text-teal-400" />
              <span>{t('profile.support')}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        onSuccess={refreshProfile}
      />
    </div>
  );
}
