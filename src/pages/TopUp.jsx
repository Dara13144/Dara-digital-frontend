import React from 'react';
import { GameTopUpWidget } from '../components/topup/GameTopUpWidget.jsx';
import { ShieldCheck, Zap, Headphones, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export function TopUp() {
  const { lang } = useLanguage();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1e1028] via-[#160c1d] to-[#0f0914] border border-pink-500/30 p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-400 text-xs font-black">
            <Zap className="w-3.5 h-3.5 fill-pink-400" />
            <span>OFFICIAL STORE INSTANT TOP-UP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            <span className="brand-text-animated">Roblox & Blox Fruits</span> Top-Up Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {lang === 'km'
              ? 'បញ្ចូលលុយ Robux, Beli និង Fragments ភ្លាមៗ ធានា ១០០% សុវត្ថិភាព គ្មានពាក្យសម្ងាត់ និងទូទាត់រហ័សតាម ABA KHQR។'
              : 'Direct automated Robux, Beli, and game packages delivered instantly to your account with zero password needed.'}
          </p>
        </div>
      </div>

      {/* Main Interactive Top-Up Widget */}
      <GameTopUpWidget />

      {/* How It Works & Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">1. Verify Roblox Profile</h3>
          <p className="text-xs text-slate-400">
            Enter your Roblox Username or Player ID. Our system checks and displays your avatar in real-time.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">2. Pay with ABA KHQR</h3>
          <p className="text-xs text-slate-400">
            Scan and pay with any Cambodian bank app (ABA, Wing, ACLEDA, Bakong) or store wallet balance instantly.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">3. Instant Receipt & Keys</h3>
          <p className="text-xs text-slate-400">
            Get your instant digital delivery receipt, key details, and Telegram notification within 1-3 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
