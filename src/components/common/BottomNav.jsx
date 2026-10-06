import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTelegram } from '../../hooks/useTelegram.js';

export function BottomNav() {
  const { t } = useLanguage();
  const { haptic } = useTelegram();

  const navItems = [
    {
      to: '/',
      label: t('nav.home'),
      imgSrc: '/nav_icons/home_icon.png',
      color: 'from-blue-500 to-cyan-400',
      activeBorder: 'border-blue-400/60 shadow-[0_0_16px_rgba(59,130,246,0.45)]',
      activeText: 'text-blue-400'
    },
    {
      to: '/shop',
      label: t('nav.shop'),
      imgSrc: '/nav_icons/shop_icon.jpg',
      color: 'from-violet-500 to-fuchsia-500',
      activeBorder: 'border-violet-400/60 shadow-[0_0_16px_rgba(139,92,246,0.45)]',
      activeText: 'text-violet-400'
    },
    {
      to: '/wallet',
      label: t('nav.wallet'),
      imgSrc: '/wallet-icon.png',
      color: 'from-cyan-500 to-teal-400',
      activeBorder: 'border-cyan-400/60 shadow-[0_0_16px_rgba(6,182,212,0.45)]',
      activeText: 'text-cyan-400'
    },
    {
      to: '/orders',
      label: t('nav.orders'),
      imgSrc: '/nav_icons/orders_icon.jpg',
      color: 'from-amber-500 to-orange-400',
      activeBorder: 'border-amber-400/60 shadow-[0_0_16px_rgba(245,158,11,0.45)]',
      activeText: 'text-amber-400'
    },
    {
      to: '/profile',
      label: t('nav.profile'),
      imgSrc: '/nav_icons/profile_icon.jpg',
      color: 'from-rose-500 to-pink-400',
      activeBorder: 'border-rose-400/60 shadow-[0_0_16px_rgba(244,63,94,0.45)]',
      activeText: 'text-rose-400'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-800/90 pb-[env(safe-area-inset-bottom,0px)] sm:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around h-16 px-1 relative">
        {navItems.map((item) => {
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => haptic('selection')}
              className={({ isActive }) =>
                `group flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-medium transition-all duration-300 relative active:scale-90 ${
                  isActive
                    ? `${item.activeText} font-bold`
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Top Glowing Indicator Line */}
                  {isActive && (
                    <div
                      className={`absolute top-0 w-8 h-1 rounded-full bg-gradient-to-r ${item.color} shadow-lg animate-nav-indicator`}
                    />
                  )}

                  {/* 3D Icon Container with Floating Pod & Glowing Halo */}
                  <div
                    className={`relative flex items-center justify-center w-10 h-8 rounded-xl transition-all duration-300 ${
                      isActive
                        ? `-translate-y-1 scale-110 bg-slate-900/90 border ${item.activeBorder}`
                        : 'group-hover:-translate-y-0.5 group-hover:scale-105'
                    }`}
                  >
                    {/* Pulsing Aura Halo for Active Tab */}
                    {isActive && (
                      <div
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} opacity-25 blur-md animate-pulse-ring pointer-events-none`}
                      />
                    )}

                    {/* Icon or 3D Image Icon */}
                    {item.isIcon ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                        <Wallet
                          className={`w-3.5 h-3.5 transition-all duration-300 ${
                            isActive
                              ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] scale-110'
                              : 'text-slate-400 group-hover:text-emerald-400'
                          }`}
                        />
                      </div>
                    ) : (
                      <img
                        src={item.imgSrc}
                        alt={item.label}
                        className={`w-6 h-6 rounded-full object-cover transition-all duration-300 ${
                          isActive
                            ? 'animate-nav-active drop-shadow-md scale-105'
                            : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'
                        }`}
                      />
                    )}

                    {/* Notification Badge with Pulse */}
                    {item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] tracking-tight transition-all duration-200 mt-0.5 ${
                      isActive
                        ? 'font-black scale-105'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
