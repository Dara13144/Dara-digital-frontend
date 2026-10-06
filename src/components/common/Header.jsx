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
  const { user, isAdmin, refreshProfile, openAuthModal } = useAuth();
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
                src="/maiser_logo.png"
                alt="𝑀𝑎𝑖𝑠𝑒𝑟 𝑆𝑡𝑜𝑟𝑒"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover transition-transform group-hover:scale-105 drop-shadow-md ring-1 ring-pink-500/40"
              />
              <span className="brand-text-animated font-bold text-base sm:text-lg tracking-wide select-none">
                𝑀𝑎𝑖𝑠𝑒𝑟 𝑆𝑡𝑜𝑟𝑒
              </span>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {user ? (
              <>
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

                {/* Orders Icon */}
                <Link
                  to="/orders"
                  title="My Orders"
                  className="p-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-400 transition-all active:scale-95"
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
              </>
            ) : (
              /* Google Sign In / Register Button */
              <button
                type="button"
                onClick={openAuthModal}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 border border-slate-200"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign In / Register</span>
              </button>
            )}

            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              title="Toggle Language (EN / KM)"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium text-slate-300 transition-all"
            >
              <Languages className="w-3.5 h-3.5 text-pink-400" />
              <span className="uppercase font-bold">{lang}</span>
            </button>
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
