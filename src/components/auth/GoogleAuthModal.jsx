import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function GoogleAuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, redirectToGoogle, loading } = useAuth();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (!isAuthModalOpen) return;

    // Initialize Google Identity Services if available
    if (window.google?.accounts?.id && GOOGLE_CLIENT_ID) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (response?.credential) {
              setIsProcessing(true);
              const res = await loginWithGoogle({ credential: response.credential });
              setIsProcessing(false);
              if (res?.success) closeAuthModal();
            }
          }
        });

        // Trigger One-Tap prompt if supported
        window.google.accounts.id.prompt();
      } catch (err) {
        console.warn('Google Identity Services note:', err.message);
      }
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsProcessing(true);

    // 1. Try Google Identity Services OAuth 2.0 Token Client (Popup flow)
    if (window.google?.accounts?.oauth2 && GOOGLE_CLIENT_ID) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              setIsProcessing(false);
              if (tokenResponse.error === 'popup_closed_by_user') {
                return;
              }
              // If popup was blocked or failed, seamlessly redirect
              console.warn('Google popup error, falling back to direct redirect:', tokenResponse.error);
              redirectToGoogle(window.location.pathname);
              return;
            }

            if (tokenResponse?.access_token) {
              try {
                // Fetch verified profile from Google's userinfo endpoint
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const profile = await userInfoRes.json();

                const res = await loginWithGoogle({
                  accessToken: tokenResponse.access_token,
                  email: profile.email,
                  name: profile.name,
                  picture: profile.picture,
                  sub: profile.sub
                });

                setIsProcessing(false);
                if (res?.success) {
                  closeAuthModal();
                }
                return;
              } catch (fetchErr) {
                console.error('Failed to get profile from Google userinfo:', fetchErr);
              }
            }
            setIsProcessing(false);
          }
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('OAuth2 Token client initialization failed, redirecting:', err.message);
        redirectToGoogle(window.location.pathname);
        return;
      }
    }

    // 2. Direct browser redirect to Google OAuth endpoint (GET /api/auth/google)
    redirectToGoogle(window.location.pathname);
  };

  const handleDirectRedirect = () => {
    redirectToGoogle(window.location.pathname);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in-50 duration-200">
      {/* Dark backdrop */}
      <div
        onClick={closeAuthModal}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-[#140e1b] border border-pink-500/30 p-6 sm:p-7 text-slate-100 shadow-[0_0_40px_rgba(236,72,153,0.25)] z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-28 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

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

          <h2 className="text-xl font-black">
            <span className="brand-text-animated tracking-wide">𝑀𝑎𝑖𝑠𝑒𝑟 𝑆𝑡𝑜𝑟𝑒</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Login or Register with your Google account to access your digital keys, wallet, and fast checkout.
          </p>
        </div>

        {/* Action Button matching user screenshot Image 2 */}
        <div className="pt-2 pb-1">
          <button
            type="button"
            disabled={isProcessing || loading}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center p-1.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 disabled:opacity-50 group"
          >
            {/* White Circle Disc with Google 'G' Logo */}
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#1a73e8]" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            </div>
            <span className="flex-1 text-center font-medium pr-10">Continue with Google</span>
          </button>

          {/* Hidden reference for GIS if needed */}
          <div ref={googleBtnRef} className="hidden" />

          {/* Direct Browser Redirect Option */}
          <div className="mt-3 pt-2 border-t border-slate-800/60 text-center">
            <button
              type="button"
              onClick={handleDirectRedirect}
              className="text-xs text-slate-400 hover:text-pink-400 underline underline-offset-2 transition-colors"
            >
              Popup blocked? Continue in Google page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
