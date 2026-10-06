import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Header } from '../components/common/Header.jsx';
import { BottomNav } from '../components/common/BottomNav.jsx';
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

      {/* Desktop Footer (Hidden on small mobile screens to save space for Telegram Mini App) */}
      <footer className="hidden sm:block border-t border-slate-800/80 bg-slate-900/40 text-slate-400 text-xs py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">Dara Digital Store</span>
            <span>•</span>
            <span>Instant Telegram Mini App</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/support" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{t('profile.support')}</span>
            </Link>
            <div className="flex items-center gap-1 text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Genuine Digital Products</span>
            </div>
          </div>

          <div className="text-slate-400">
            Powered by ABA PayWay & Supabase
          </div>
        </div>
      </footer>

      {/* Telegram Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
