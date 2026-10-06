import React, { useState } from 'react';
import { User, ShieldCheck } from 'lucide-react';

export function UserAvatar({
  user,
  size = 'md',
  showBadge = false,
  className = '',
  ring = true
}) {
  const [imageError, setImageError] = useState(false);

  // Size mapping
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl'
  };

  const badgeSizeClasses = {
    xs: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    sm: 'w-3 h-3 -bottom-0.5 -right-0.5',
    md: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
    lg: 'w-4 h-4 bottom-0 right-0',
    xl: 'w-5 h-5 bottom-0 right-0',
    '2xl': 'w-6 h-6 bottom-0.5 right-0.5'
  };

  const name = user?.first_name || user?.username || 'User';
  const initial = (name.trim()[0] || 'U').toUpperCase();
  const avatarUrl = user?.avatar_url || user?.photo_url;
  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r)) || user?.username === 'darazzdev';

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      <div
        className={`rounded-2xl overflow-hidden flex items-center justify-center font-black select-none transition-transform ${
          sizeClasses[size] || sizeClasses.md
        } ${
          ring
            ? isAdmin
              ? 'border-2 border-amber-500/60 shadow-glow-gold'
              : 'border-2 border-emerald-500/50 shadow-glow-green'
            : 'border border-slate-700'
        }`}
      >
        {avatarUrl && !imageError ? (
          <img
            src={avatarUrl}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950 flex items-center justify-center text-slate-100">
            {initial}
          </div>
        )}
      </div>

      {/* Online / Admin / Telegram Badge */}
      {showBadge && (
        <div
          className={`absolute rounded-full border border-slate-950 flex items-center justify-center ${
            badgeSizeClasses[size] || badgeSizeClasses.md
          } ${
            isAdmin
              ? 'bg-amber-400 text-slate-950'
              : 'bg-emerald-500'
          }`}
          title={isAdmin ? 'Super Admin' : 'Verified User'}
        >
          {isAdmin ? (
            <ShieldCheck className="w-2.5 h-2.5" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          )}
        </div>
      )}
    </div>
  );
}
