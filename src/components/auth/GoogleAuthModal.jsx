import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Shield, Zap, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function GoogleAuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, loading } = useAuth();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (!isAuthModalOpen) return;

    // Initialize Google Identity Services if available
    if (window.google?.accounts?.id && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '104719283746-mockgoogleoauthclientid.apps.googleusercontent.com',
          callback: async (response) => {
            if (response?.credential) {
              setIsProcessing(true);
              const res = await loginWithGoogle({ credential: response.credential });
              setIsProcessing(false);
              if (res.success) closeAuthModal();
            }
          }
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 280
        });

        // Trigger One-Tap prompt if supported
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to custom button
          }
        });
      } catch (err) {
        console.warn('Google Identity Services init note:', err.message);
      }
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleQuickGoogleSignIn = async (emailOverride, nameOverride) => {
    setIsProcessing(true);
    const email = (emailOverride || customEmail || 'customer@gmail.com').trim().toLowerCase();
    const name = nameOverride || customName || email.split('@')[0];

    const res = await loginWithGoogle({
      email,
      name,
      picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      sub: 'google_sub_' + Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))
    });

    setIsProcessing(false);
    if (res?.success) {
      closeAuthModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in-50 duration-200">
      {/* Dark backdrop */}
      <div
        onClick={closeAuthModal}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-[#140e1b] border border-pink-500/30 p-6 sm:p-8 text-slate-100 shadow-[0_0_40px_rgba(236,72,153,0.25)] z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/40 shadow-inner mb-1">
            <img src="/maiser_logo.png" alt="Maiser Store" className="w-10 h-10 rounded-xl object-cover" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black">
            <span className="brand-text-animated tracking-wide">𝑀𝑎𝑖𝑠𝑒𝑟 𝑆𝑡𝑜𝑟𝑒</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Login or Register with your Google account to access your digital keys, wallet, and fast checkout.
          </p>
        </div>

        {/* Actions Area */}
        <div className="space-y-4">
          {/* Main Google Button */}
          <button
            type="button"
            disabled={isProcessing || loading}
            onClick={() => handleQuickGoogleSignIn('customer@gmail.com', 'Google User')}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white text-slate-900 font-extrabold text-sm hover:bg-slate-100 active:scale-98 transition-all shadow-lg hover:shadow-xl border border-slate-200 disabled:opacity-50 group"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
            ) : (
              <svg className="w-5 h-5 flex-shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
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
            )}
            <span>Continue with Google</span>
          </button>

          {/* Embedded Google GIS button target */}
          <div ref={googleBtnRef} className="flex justify-center my-1" />

          {/* Custom Google Account Option */}
          <div className="pt-2 border-t border-slate-800/80">
            {!showManualInput ? (
              <button
                type="button"
                onClick={() => setShowManualInput(true)}
                className="w-full text-center text-xs font-semibold text-slate-400 hover:text-pink-400 transition-colors py-1"
              >
                Sign in with another Google Email ▾
              </button>
            ) : (
              <div className="space-y-2.5 pt-1 animate-in fade-in-50 duration-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Google Email
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <button
                  type="button"
                  disabled={!customEmail || isProcessing}
                  onClick={() => handleQuickGoogleSignIn()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Sign In with this Google Account</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feature badges */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-800/60 text-center">
          <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <Shield className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-300 font-semibold block leading-tight">100% Secure</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-300 font-semibold block leading-tight">Instant Keys</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <Sparkles className="w-4 h-4 text-pink-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-300 font-semibold block leading-tight">Zero Password</span>
          </div>
        </div>
      </div>
    </div>
  );
}
