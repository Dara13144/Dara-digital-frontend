import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  CreditCard,
  Users,
  Tag,
  FolderTree,
  Settings,
  ScrollText,
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
  Flame,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

import { GoogleAdminLogin } from '../components/auth/GoogleAdminLogin.jsx';
import { UserAvatar } from '../components/common/UserAvatar.jsx';

export function AdminLayout() {
  const { user, isAdmin, loading, loginAsMock } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: t('admin.products'), icon: Package },
    { to: '/admin/topup', label: 'GamePass & Top-Up Hub', icon: Sparkles, badge: 'HOT' },
    { to: '/admin/flash-sale', label: 'Flash Sale & Deals', icon: Flame },
    { to: '/admin/stock', label: t('admin.stock'), icon: Boxes },
    { to: '/admin/orders', label: t('admin.orders'), icon: ShoppingCart },
    { to: '/admin/payments', label: t('admin.payments'), icon: CreditCard },
    { to: '/admin/users', label: t('admin.users'), icon: Users },
    { to: '/admin/coupons', label: t('admin.coupons'), icon: Tag },
    { to: '/admin/categories', label: t('admin.categories'), icon: FolderTree },
    { to: '/admin/settings', label: t('admin.settings'), icon: Settings },
    { to: '/admin/logs', label: t('admin.logs'), icon: ScrollText }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Loading admin workspace...
      </div>
    );
  }

  // Authorization gate
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-center relative overflow-hidden">
        {/* Background glow decorative effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/10">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-100">Admin Portal Sign In</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Authenticate with your verified Google account or authorized admin profile to enter.
            </p>
          </div>

          {/* Google Sign-in for Admin */}
          <div className="pt-2">
            <GoogleAdminLogin fullWidth={true} onSuccess={() => navigate('/admin')} />
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 absolute">
              Or Instant Dev Login
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => loginAsMock('ADMIN')}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-glow-gold hover:from-amber-400 hover:to-yellow-400 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Log in as @darazzdev</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-transparent text-slate-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 w-64 glass-panel border-r border-slate-800 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/maiser_logo.png" alt="𝑀𝑎𝑖𝑠𝑒𝑟 𝑆𝑡𝑜𝑟𝑒" className="h-8 w-8 rounded-lg object-cover ring-1 ring-pink-500/40" />
            <span className="brand-text-animated font-bold text-sm sm:text-base tracking-wide select-none">𝑀𝑎𝑖𝑠𝑒𝑟 𝑆𝑡𝑜𝑟𝑒</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
            <UserAvatar user={user} size="sm" showBadge={true} />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs text-slate-200 truncate">@{user?.username || user?.telegram_id}</p>
              <p className="text-[10px] text-amber-400 font-semibold uppercase">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-6 glass-panel border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 lg:hidden hover:bg-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-black text-slate-100">
              Maiser Store Management System
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/topup?tab=gamepass"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/15 via-pink-500/15 to-purple-500/15 border border-amber-500/30 hover:border-pink-500/60 text-amber-300 hover:text-white text-xs font-black transition-all group"
              title="Open live GamePass storefront in new tab"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">GamePass [HOT]</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-100 font-black">
                HOT
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Online
            </span>
            <Link to="/profile" title="Admin Profile" className="hover:scale-105 transition-transform">
              <UserAvatar user={user} size="sm" showBadge={true} />
            </Link>
          </div>
        </header>

        {/* Dynamic Admin View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
