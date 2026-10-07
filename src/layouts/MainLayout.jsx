import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Header } from '../components/common/Header.jsx';
import { BottomNav } from '../components/common/BottomNav.jsx';
import { GoogleAuthModal } from '../components/auth/GoogleAuthModal.jsx';
import { TelegramChatSupport } from '../components/common/TelegramChatSupport.jsx';
import { Shield, Zap, Heart, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export function MainLayout() {
  const { lang, t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 safe-bottom-padding">
        <Outlet />
      </main>

      {/* Desktop Footer */}
      <footer className="hidden sm:block border-t border-slate-800/80 bg-slate-900/40 text-slate-400 text-xs py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="brand-text-animated font-bold text-sm tracking-wide">𝑀𝑎𝑖𝑠𝑒𝑟 𝑆𝑡𝑜𝑟𝑒</span>
            <span>•</span>
            <span>Official Digital Products Store</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/support" className="hover:text-pink-400 transition-colors flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{t('profile.support')}</span>
            </Link>
            <div className="flex items-center gap-1 text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Genuine Digital Products</span>
            </div>
          </div>

          <div className="text-slate-400">
            Dev by{' '}
            <a
              href="https://t.me/darazzdev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 font-bold transition-colors hover:underline"
            >
              @darazzdev
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <BottomNav />

      {/* Global Google Authentication & Registration Modal */}
      <GoogleAuthModal />

      {/* Floating 24/7 Telegram Chat Support Button */}
      <TelegramChatSupport />
    </div>
  );
}
