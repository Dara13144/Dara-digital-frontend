import React, { useState } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { useTelegram } from '../../hooks/useTelegram.js';

export function TelegramChatSupport() {
  const { haptic } = useTelegram();
  const [showTooltip, setShowTooltip] = useState(false);
  const supportUsername = 'rybunrak';
  const supportUrl = `https://t.me/${supportUsername}`;

  const handleClick = () => {
    haptic('medium');
    window.open(supportUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <aside
      aria-label="Telegram Customer Support"
      className="fixed z-40 bottom-20 right-4 sm:bottom-6 sm:right-6 flex flex-col items-end gap-2 pointer-events-auto select-none"
    >
      {/* Tooltip / Speech bubble */}
      <div
        className={`transition-all duration-300 transform origin-bottom-right ${
          showTooltip
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="relative bg-slate-900/95 border border-sky-500/40 text-slate-100 text-xs px-3.5 py-2 rounded-2xl shadow-xl shadow-sky-500/10 backdrop-blur-md flex items-center gap-2 max-w-[220px]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <div className="min-w-0">
            <p className="font-extrabold text-[11px] text-sky-400">Support Online 24/7</p>
            <p className="text-[10px] text-slate-300 truncate">Chat with @{supportUsername}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="p-0.5 text-slate-400 hover:text-white rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative group p-3 sm:p-3.5 rounded-full bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white shadow-[0_4px_25px_rgba(14,165,233,0.5)] hover:shadow-[0_6px_30px_rgba(14,165,233,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-white/20"
        title="Chat on Telegram (@rybunrak)"
        aria-label="Chat with Telegram Support @rybunrak"
      >
        {/* Pulsing ring */}
        <span className="absolute -inset-1 rounded-full bg-sky-400/30 animate-pulse pointer-events-none" />

        {/* Telegram paper plane icon */}
        <Send className="w-5 h-5 sm:w-6 sm:h-6 fill-white -translate-x-0.5 translate-y-0.5 group-hover:scale-110 transition-transform" />

        {/* Online Indicator Badge */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
        </span>
      </button>
    </aside>
  );
}
