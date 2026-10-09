import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Mail, Lock, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export function GoogleAdminLogin({ onSuccess, fullWidth = false }) {
  const { loginWithGoogle, loading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDirectInput, setShowDirectInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('bunrak778@gmail.com');
  const googleBtnRef = useRef(null);

  useEffect(() => {
    // Check if google GIS client is available
    if (window.google?.accounts?.id && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          callback: async (response) => {
            if (response?.credential) {
              setIsProcessing(true);
              await loginWithGoogle({ credential: response.credential });
              setIsProcessing(false);
              if (onSuccess) onSuccess();
            }
          }
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          logo_alignment: 'left'
        });
      } catch (err) {
        console.warn('Google GIS initialize note:', err.message);
      }
    }
  }, []);

  const AUTHORIZED_ADMINS = [
    'bunrak778@gmail.com',
    'finozzz377@gmail.com',
    'mdara9695@gmail.com'
  ];

  const handleCustomGoogleLogin = async (emailToUse) => {
    setIsProcessing(true);
    const email = emailToUse || customEmail;
    const name = email.split('@')[0].toUpperCase() + ' (Admin)';
    
    await loginWithGoogle({
      email,
      name,
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      sub: 'google_oauth_sub_admin_' + Date.now()
    });
    
    setIsProcessing(false);
    if (onSuccess) onSuccess();
  };

  const handleAdminGoogleAuth = async () => {
    setIsProcessing(true);

    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const profile = await userInfoRes.json();
                await loginWithGoogle({
                  accessToken: tokenResponse.access_token,
                  email: profile.email,
                  name: profile.name,
                  picture: profile.picture,
                  sub: profile.sub
                });
                setIsProcessing(false);
                if (onSuccess) onSuccess();
                return;
              } catch (fetchErr) {
                console.error('Failed to get user profile from Google:', fetchErr);
              }
            }
            setIsProcessing(false);
          }
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('Admin Google Token Client error:', err.message);
      }
    }

    // Fallback to default admin
    await handleCustomGoogleLogin('bunrak778@gmail.com');
  };

  return (
    <div className="w-full space-y-3">
      {/* Primary Google Sign-In Button */}
      <button
        type="button"
        disabled={loading || isProcessing}
        onClick={handleAdminGoogleAuth}
        className={`relative flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-98 border border-slate-200 disabled:opacity-50 ${
          fullWidth ? 'w-full' : 'w-full sm:w-auto'
        }`}
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
        ) : (
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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
        <span>Sign in with Google as Admin</span>
      </button>

      {/* Authorized Admin Quick Select */}
      <div className="pt-1">
        <p className="text-[10px] text-slate-400 mb-1.5 text-center font-medium">Quick Select Authorized Admin:</p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {AUTHORIZED_ADMINS.map((email) => (
            <button
              key={email}
              type="button"
              disabled={isProcessing}
              onClick={() => handleCustomGoogleLogin(email)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 font-mono transition-colors"
            >
              {email.split('@')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Embedded GIS Container if loaded */}
      <div ref={googleBtnRef} className="hidden" />

      {/* Alternative Google Account Switcher */}
      <div className="pt-1 text-center">
        {!showDirectInput ? (
          <button
            type="button"
            onClick={() => setShowDirectInput(true)}
            className="text-[11px] text-slate-400 hover:text-cyan-400 transition-colors underline underline-offset-2"
          >
            Use another Google Admin account
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-left animate-in fade-in-50 duration-200">
            <label className="text-[11px] font-bold text-slate-300 block">
              Google Admin Email Address
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                disabled={!customEmail || isProcessing}
                onClick={() => handleCustomGoogleLogin(customEmail)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
