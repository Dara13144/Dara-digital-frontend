import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Package,
  Sun,
  Moon,
  Languages,
  Wallet,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTelegram } from '../../hooks/useTelegram.js';
import { UserAvatar } from './UserAvatar.jsx';
import { TopUpModal } from '../payment/TopUpModal.jsx';
import { MenuDrawer } from './MenuDrawer.jsx';

export function Header() {
  const { user, isAdmin, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const { haptic } = useTelegram();
  const [menuOpen, setMenuOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);

  const balance = Number(user?.wallet_balance ?? user?.balance ?? 0);

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Menu Button & Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Menu Hamburger Button */}
            <button
              onClick={() => {
                haptic('medium');
                setMenuOpen(true);
              }}
              title="Open Navigation Menu"
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center justify-center flex-shrink-0 active:scale-95 group shadow-sm"
            >
              <Menu className="w-5 h-5 text-slate-300 group-hover:text-emerald-400 transition-colors" />
            </button>

            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-2 group py-0.5">
              <img
                src="/logo-light.png"
                alt="Dara Digital"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-md"
              />
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Wallet Balance Chip */}
            <div className="flex items-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-1 pl-2 text-xs shadow-sm">
              <Link
                to="/wallet"
                className="flex items-center gap-1.5 font-mono font-bold text-emerald-400 hover:text-emerald-300 pr-1.5"
                title="View Wallet"
              >
                <img src="/wallet-icon.png" alt="Wallet" className="w-4 h-4 object-contain" />
                <span>${balance.toFixed(2)}</span>
              </Link>
              <button
                onClick={() => {
                  haptic('medium');
                  setTopUpOpen(true);
                }}
                className="p-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-sm active:scale-95 transition-all"
                title="Add Balance"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
              </button>
            </div>

            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              title="Toggle Language (EN / KM)"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium text-slate-300 transition-all"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              <span className="uppercase font-bold">{lang}</span>
            </button>

            {/* Theme Switch */}
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className="hidden sm:flex p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 transition-all"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Orders Icon */}
            <Link
              to="/orders"
              title="My Orders"
              className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-all active:scale-95"
            >
              <Package className="w-5 h-5" />
            </Link>

            {/* User Profile Avatar */}
            <Link
              to="/profile"
              title="My Profile"
              className="transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <UserAvatar user={user} size="sm" showBadge={isAdmin} />
            </Link>
          </div>
        </div>
      </header>

      {/* Slide-out Menu Drawer */}
      <MenuDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenTopUp={() => setTopUpOpen(true)}
      />

      {/* Reusable TopUp Modal */}
      <TopUpModal
        isOpen={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        onSuccess={refreshProfile}
      />
    </>
  );
}
