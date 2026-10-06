import React, { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  QrCode,
  Plus,
  Sparkles,
  RefreshCw,
  Zap
} from 'lucide-react';
import { endpoints } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTelegram } from '../hooks/useTelegram.js';
import { TopUpModal } from '../components/payment/TopUpModal.jsx';

export function Wallet() {
  const { user, loading: authLoading, refreshProfile, openAuthModal } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [initialTopUpAmt, setInitialTopUpAmt] = useState(null);

  const { lang, t } = useLanguage();
  const { haptic } = useTelegram();

  const loadWalletData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [wRes, txRes] = await Promise.all([
        endpoints.getWallet(),
        endpoints.getWalletTransactions({ limit: 50 })
      ]);
      if (wRes?.success) setWallet(wRes.data);
      if (txRes?.success) setTransactions(txRes.data.items || []);
    } catch (err) {
      if (err?.message !== 'Request aborted' && err?.name !== 'CanceledError') {
        console.warn('Error fetching wallet:', err.message || err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      loadWalletData();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleOpenTopUp = (amount = null) => {
    haptic('medium');
    setInitialTopUpAmt(amount);
    setTopUpOpen(true);
  };

  const handleTopUpSuccess = async () => {
    await refreshProfile();
    await loadWalletData(true);
  };

  const balance = Number(wallet?.balance ?? user?.wallet_balance ?? user?.balance ?? 0);

  if (!user && !authLoading) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 px-4">
        <div className="w-16 h-16 rounded-3xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center mx-auto shadow-lg">
          <WalletIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-100">Sign In to Access Wallet</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Sign in or register with Google to access your store balance, top up via ABA PayWay KHQR, and view transaction history.
        </p>
        <button
          onClick={openAuthModal}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white text-slate-900 font-extrabold text-sm hover:bg-slate-100 transition-all shadow-lg active:scale-95 border border-slate-200"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Wallet Balance Hero Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-tr from-emerald-950/90 via-slate-900 to-teal-950/90 border border-emerald-500/40 text-center space-y-4 relative overflow-hidden shadow-2xl">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-glow-cyan p-1.5">
            <img src="/wallet-3d.png" alt="Wallet" className="w-full h-full object-contain" />
          </div>

          <button
            onClick={() => {
              haptic('light');
              loadWalletData(true);
            }}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh balance"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        <div>
          <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
            {t('wallet.currentBalance')}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 mt-1 font-mono">
            ${balance.toFixed(2)} <span className="text-sm font-bold text-slate-400">USD</span>
          </h1>
        </div>

        {/* Main Action Buttons */}
        <div className="pt-2">
          <button
            onClick={() => handleOpenTopUp(null)}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-glow-green flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>{lang === 'km' ? 'បញ្ចូលទឹកប្រាក់ (Add Balance)' : 'Add Wallet Balance'}</span>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </button>
        </div>

        {/* Quick Amount Presets */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {[1, 5, 10, 20].map((amt) => (
            <button
              key={amt}
              onClick={() => handleOpenTopUp(amt)}
              className="py-2 px-1 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-black transition-all flex items-center justify-center gap-1 active:scale-95"
            >
              <Zap className="w-3 h-3" />
              <span>+${amt}</span>
            </button>
          ))}
        </div>

        {/* Auto-check info banner */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-3 text-left">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-red-500/40 shadow-glow-red flex-shrink-0 bg-white flex items-center justify-center p-0.5">
            <img src="/aba_khqr.png" alt="ABA KHQR" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-black text-sm text-slate-200">
              ABA KHQR
            </span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-100 flex items-center gap-2">
            <span>{t('wallet.transactions')}</span>
          </h2>
          <span className="text-xs text-slate-400">
            {transactions.length} {lang === 'km' ? 'ប្រតិបត្តិការ' : 'records'}
          </span>
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl p-8 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-400" />
            <p>{t('common.loading')}</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const isCredit = Number(tx.amount) > 0;

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl glass-card border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCredit
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        {tx.description || tx.type}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-sm font-black font-mono ${
                        isCredit ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {isCredit ? '+' : ''}
                      ${Number(tx.amount).toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Bal: ${Number(tx.balance_after).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-8 text-center text-xs text-slate-400 space-y-3">
            <p>{t('wallet.noTransactions')}</p>
            <button
              onClick={() => handleOpenTopUp(null)}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'km' ? 'បញ្ចូលទឹកប្រាក់ដំបូងរបស់អ្នក' : 'Make your first top-up'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Reusable TopUp Modal */}
      <TopUpModal
        isOpen={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        initialAmount={initialTopUpAmt}
        onSuccess={handleTopUpSuccess}
      />
    </div>
  );
}
