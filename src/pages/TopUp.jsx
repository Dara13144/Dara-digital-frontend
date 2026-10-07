import React, { useState } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { GameTopUpWidget } from '../components/topup/GameTopUpWidget.jsx';
import { TopUpHubEditorModal } from '../components/topup/TopUpHubEditorModal.jsx';
import { ShieldCheck, Zap, Sparkles, CheckCircle2, Gamepad2, Settings, Plus, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function TopUp() {
  const { lang } = useLanguage();
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const tabParam = searchParams.get('tab');
  const isGamepassRoute = location.pathname.includes('gamepass') || tabParam === 'gamepass';
  const initialTab = isGamepassRoute ? 'gamepass' : (tabParam === 'robux' ? 'robux' : 'all');

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1e1028] via-[#160c1d] to-[#0f0914] border border-pink-500/30 p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-pink-500/15 to-purple-500/15 border border-amber-500/30 text-amber-300 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>OFFICIAL STORE GAMEPASS & ROBUX TOP-UP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            <span className="brand-text-animated">Roblox & Blox Fruits</span> GamePass Top-Up Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {lang === 'km'
              ? 'បញ្ចូលលុយ GamePass (2x Mastery, 2x Money, Dark Blade, Fast Boats) និង Robux ភ្លាមៗ ធានា ១០០% សុវត្ថិភាព គ្មានពាក្យសម្ងាត់ និងទូទាត់រហ័សតាម ABA KHQR។'
              : 'Official GamePasses (2x Mastery, 2x Money, Dark Blade, Fast Boats) and direct automated Robux delivered to your account safely with zero password needed.'}
          </p>
        </div>

        {/* Quick Highlights Badge */}
        <div className="flex sm:flex-col gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Blox Fruits GamePass</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Username Check</span>
          </div>
        </div>
      </div>

      {/* Admin Quick System Editor Bar (Only visible to Store Admins) */}
      {isAdmin && (
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-slate-900 to-purple-950/40 border border-pink-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">Roblox & Blox Fruits Hub Editor</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Admin Only
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Manage packages, prices, badges, and upload custom images live without cluttering customer views.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsEditorOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-black text-xs shadow-glow-pink flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Open System Editor</span>
            </button>

            <Link
              to="/admin/topup"
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Admin Hub</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Interactive Top-Up Widget */}
      <GameTopUpWidget key={refreshKey} initialTab={initialTab} />

      {/* Admin Hub Editor Modal */}
      {isAdmin && (
        <TopUpHubEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onRefreshRequired={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {/* How It Works & Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">1. Verify Roblox Profile</h3>
          <p className="text-xs text-slate-400">
            Enter your Roblox Username or Player ID. Our system checks and displays your avatar and account details in real-time.
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
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">3. Telegram Bot & 1h - 24h Delivery</h3>
          <p className="text-xs text-slate-400">
            {lang === 'km'
              ? 'ការទូទាត់ត្រូវបានបញ្ជូនទៅ Telegram Bot & Channel ភ្លាមៗ។ កញ្ចប់ GamePass ត្រូវបានផ្ទេរក្នុងចន្លោះ ១ ម៉ោង ទៅ ២៤ ម៉ោង។'
              : 'Orders report instantly to Telegram Bot & Channel. GamePass orders are delivered within 1 to 24 hours directly.'}
          </p>
        </div>
      </div>
    </div>
  );
}
