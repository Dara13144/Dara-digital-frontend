import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Search,
  User,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { endpoints } from '../../services/api.js';

/**
 * Reusable Roblox Username Checker component with live avatar lookup & verification.
 * @param {string} value - Current input value
 * @param {function} onChange - Input change handler (string)
 * @param {function} onVerified - Callback called when a valid Roblox user is verified ({ id, username, displayName, avatarUrl, profileUrl })
 * @param {boolean} required - Whether input is required
 * @param {string} className - Optional container styling
 */
export function RobloxUserChecker({
  value = '',
  onChange,
  onVerified,
  className = '',
  autoCheck = true
}) {
  const [query, setQuery] = useState(value || '');
  const [checking, setChecking] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const lastCheckedQueryRef = useRef('');

  // Sync external value
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value]);

  // Load previously verified user from localStorage if query matches
  useEffect(() => {
    if (!verifiedUser && query.trim()) {
      try {
        const saved = localStorage.getItem('daramini_roblox_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            (parsed.username?.toLowerCase() === query.trim().toLowerCase() ||
              String(parsed.id) === query.trim())
          ) {
            setVerifiedUser(parsed);
            if (onVerified) onVerified(parsed);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const performCheck = useCallback(
    async (textToCheck) => {
      const trimmed = (textToCheck || '').trim();
      if (!trimmed || trimmed.length < 2) {
        setVerifiedUser(null);
        setErrorMsg('');
        setChecking(false);
        return;
      }

      if (lastCheckedQueryRef.current.toLowerCase() === trimmed.toLowerCase() && verifiedUser) {
        return; // Already checked
      }

      setChecking(true);
      setErrorMsg('');

      try {
        const res = await endpoints.checkRobloxUser(trimmed);
        lastCheckedQueryRef.current = trimmed;

        if (res.success && res.found && res.data) {
          const user = res.data;
          setVerifiedUser(user);
          setErrorMsg('');
          try {
            localStorage.setItem('daramini_roblox_user', JSON.stringify(user));
            localStorage.setItem('daramini_topup_note', `Roblox: ${user.displayName} (@${user.username}) - ID: ${user.id}`);
          } catch (e) {}

          if (onVerified) {
            onVerified(user);
          }
        } else {
          setVerifiedUser(null);
          setErrorMsg(res.message || `Roblox account "${trimmed}" not found. Please check spelling.`);
          if (onVerified) onVerified(null);
        }
      } catch (err) {
        setVerifiedUser(null);
        setErrorMsg(err.message || 'Could not verify with Roblox servers.');
        if (onVerified) onVerified(null);
      } finally {
        setChecking(false);
      }
    },
    [onVerified, verifiedUser]
  );

  // Debounced auto-check
  useEffect(() => {
    if (!autoCheck) return;
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setVerifiedUser(null);
      setErrorMsg('');
      return;
    }

    // If matches currently verified user, don't recheck
    if (
      verifiedUser &&
      (verifiedUser.username.toLowerCase() === trimmed.toLowerCase() ||
        String(verifiedUser.id) === trimmed)
    ) {
      return;
    }

    const timer = setTimeout(() => {
      performCheck(trimmed);
    }, 600);

    return () => clearTimeout(timer);
  }, [query, autoCheck, performCheck, verifiedUser]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onChange) onChange(val);

    // If input changed away from verified user
    if (
      verifiedUser &&
      val.trim().toLowerCase() !== verifiedUser.username.toLowerCase() &&
      val.trim() !== String(verifiedUser.id)
    ) {
      setVerifiedUser(null);
    }
  };

  const handleManualCheck = (e) => {
    e?.preventDefault();
    performCheck(query);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Input row */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              performCheck(query);
            }
          }}
          placeholder="Enter Roblox Username or Player ID (e.g. Roblox)"
          className={`w-full h-12 pl-11 pr-28 rounded-2xl bg-slate-950/80 border text-sm font-semibold text-slate-100 placeholder-slate-500 outline-none transition-all ${
            verifiedUser
              ? 'border-emerald-500/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20'
              : errorMsg
              ? 'border-rose-500/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-700/80 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20'
          }`}
        />

        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          {checking ? (
            <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
          ) : verifiedUser ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <User className="w-4 h-4 text-slate-400" />
          )}
        </div>

        {/* Right side check button */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            type="button"
            onClick={handleManualCheck}
            disabled={checking || !query.trim()}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50 ${
              verifiedUser
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-pink-500 text-white hover:bg-pink-400 shadow-sm'
            }`}
          >
            {checking ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Checking...</span>
              </>
            ) : verifiedUser ? (
              <>
                <RefreshCw className="w-3 h-3" />
                <span>Verified</span>
              </>
            ) : (
              <>
                <Search className="w-3 h-3" />
                <span>Check</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMsg && !checking && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">{errorMsg}</p>
            <p className="text-[11px] text-rose-400/80">
              Make sure you enter your exact Roblox username (not display name) or your numeric User ID.
            </p>
          </div>
        </div>
      )}

      {/* Verified User Card Preview */}
      {verifiedUser && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-emerald-950/20 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            {/* Avatar thumbnail */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-900 border-2 border-emerald-400 shadow-md flex-shrink-0">
              <img
                src={verifiedUser.avatarUrl}
                alt={verifiedUser.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/icons/robux_gold.png';
                }}
              />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            {/* User details */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-sm text-white truncate">
                  {verifiedUser.displayName}
                </span>
                {verifiedUser.hasVerifiedBadge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/40">
                    Badge ✓
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                  VERIFIED PLAYER
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span>@{verifiedUser.username}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 font-mono text-[11px]">ID: {verifiedUser.id}</span>
              </p>
            </div>
          </div>

          {/* Profile link */}
          <a
            href={verifiedUser.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shrink-0"
            title="View Roblox Profile"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
