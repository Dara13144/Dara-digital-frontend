import React, { useState, useEffect } from 'react';
import {
  Wallet,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Loader2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { endpoints } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useTelegram } from '../../hooks/useTelegram.js';
import { KhqrPaymentCard } from './KhqrPaymentCard.jsx';

const PRESET_AMOUNTS = [1, 2, 5, 10, 20, 50, 100];

export function TopUpModal({ isOpen, onClose, initialAmount = null, onSuccess }) {
  const { user, refreshProfile } = useAuth();
  const { lang, t } = useLanguage();
  const toast = useToast();
  const { haptic } = useTelegram();

  const [selectedAmount, setSelectedAmount] = useState(initialAmount ? Number(initialAmount) : 5);
  const [customAmount, setCustomAmount] = useState(initialAmount ? String(initialAmount) : '');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (initialAmount) {
        const num = Number(initialAmount);
        if (PRESET_AMOUNTS.includes(num)) {
          setSelectedAmount(num);
          setIsCustom(false);
        } else {
          setCustomAmount(String(num));
          setIsCustom(true);
        }
      }
      setPaymentData(null);
      setError(null);
      setSuccessData(null);
    }
  }, [isOpen, initialAmount]);

  if (!isOpen) return null;

  const currentAmount = isCustom ? Number(customAmount) : selectedAmount;

  const handleSelectPreset = (amount) => {
    haptic('selection');
    setIsCustom(false);
    setSelectedAmount(amount);
    setCustomAmount('');
    setError(null);
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomAmount(val);
    setIsCustom(true);
    setError(null);
  };

  const handleGeneratePayment = async () => {
    haptic('medium');
    const amt = isCustom ? Number(customAmount) : selectedAmount;

    if (isNaN(amt) || amt < 0.01) {
      setError(lang === 'km' ? 'សូមបញ្ចូលទឹកប្រាក់អប្បបរមា $0.01' : 'Minimum top-up amount is $0.01');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await endpoints.initiateWalletTopup(amt, 'cutluy_khqr');
      if (res.success && res.data) {
        setPaymentData(res.data);
      } else {
        setError(res.message || 'Failed to generate QR code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error initiating top-up.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (data) => {
    haptic('success');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setSuccessData(data);
    await refreshProfile();
    toast.success(lang === 'km' ? `បានបញ្ចូលទឹកប្រាក់ +$${Number(currentAmount).toFixed(2)} ដោយជោគជ័យ!` : `Successfully added +$${Number(currentAmount).toFixed(2)} to your wallet!`);
    
    if (onSuccess) {
      onSuccess(data?.newBalance || (Number(user?.balance || 0) + currentAmount));
    }
  };

  const handleClose = () => {
    haptic('light');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-slate-700/80 bg-slate-900/95 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-glow-green flex-shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100 flex items-center gap-1.5">
              <span>{lang === 'km' ? 'បញ្ចូលទឹកប្រាក់ (Top Up)' : 'Add Wallet Balance'}</span>
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-400 font-bold text-red-400">
              ABA KHQR
            </p>
          </div>
        </div>

        {/* State 1: Success State */}
        {successData ? (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-green">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-100">
                {lang === 'km' ? 'បញ្ចូលទឹកប្រាក់ជោគជ័យ!' : 'Top-Up Successful!'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'km' ? 'សមតុល្យបច្ចុប្បន្នរបស់អ្នក' : 'Your new wallet balance'}:
              </p>
              <div className="text-3xl font-black text-emerald-400 mt-2 font-mono">
                ${Number(successData.newBalance || user?.balance || 0).toFixed(2)} USD
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-glow-green transition-all"
            >
              {lang === 'km' ? 'រួចរាល់' : 'Done & Continue'}
            </button>
          </div>
        ) : paymentData ? (
          /* State 2: Active QR Payment View */
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <KhqrPaymentCard
              paymentId={paymentData.paymentId}
              qrString={paymentData.qrString}
              checkoutUrl={paymentData.checkoutUrl}
              amount={paymentData.amount}
              currency={paymentData.currency}
              merchantName="Maiser Store Wallet Top-Up"
              expiresAt={paymentData.expiresAt}
              onPaid={handlePaymentSuccess}
              onCancel={() => setPaymentData(null)}
            />
          </div>
        ) : (
          /* State 3: Choose Amount */
          <div className="space-y-5">
            {/* Current Balance Display */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {lang === 'km' ? 'សមតុល្យបច្ចុប្បន្ន' : 'Current Balance'}:
              </span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                ${Number(user?.balance || 0).toFixed(2)} USD
              </span>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                {lang === 'km' ? 'ជ្រើសរើសទឹកប្រាក់' : 'Select Amount'}:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((amt) => {
                  const active = !isCustom && selectedAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectPreset(amt)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all border ${
                        active
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-glow-green scale-102'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700'
                      }`}
                    >
                      ${amt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                {lang === 'km' ? 'ឬ បញ្ចូលចំនួនជាក់លាក់ (USD)' : 'Or Enter Custom Amount (USD)'}:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                  $
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={handleCustomChange}
                  className={`w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border text-slate-100 font-mono text-sm focus:outline-none transition-all ${
                    isCustom
                      ? 'border-emerald-500 ring-1 ring-emerald-500'
                      : 'border-slate-800 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Generate QR Button */}
            <button
              onClick={handleGeneratePayment}
              disabled={loading || currentAmount < 0.01}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-glow-green flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'km' ? 'កំពុងបង្កើត QR...' : 'Generating ABA KHQR...'}</span>
                </>
              ) : (
                <>
                  <span>
                    {lang === 'km'
                      ? `ទូទាត់ $${Number(currentAmount || 0).toFixed(2)} ជាមួយ ABA KHQR`
                      : `Top Up $${Number(currentAmount || 0).toFixed(2)} with ABA KHQR`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'km' ? 'ស្កេនបានគ្រប់កម្មវិធីធនាគារក្នុងប្រទេសកម្ពុជា' : 'Supported by ABA, Bakong, ACLEDA, Wing & all banks'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
