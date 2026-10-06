import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function StockBadge({ quantity, stockType }) {
  const { t } = useLanguage();

  if (quantity > 3) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" />
        <span>{t('common.inStock')} ({quantity})</span>
      </span>
    );
  }

  if (quantity > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/70 border border-amber-600/50 px-2.5 py-0.5 rounded-full">
        <AlertCircle className="w-3 h-3 text-amber-400" />
        <span>{quantity} {t('common.left')}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 border border-rose-500/40 px-2.5 py-0.5 rounded-full">
      <XCircle className="w-3 h-3" />
      <span>{t('common.outOfStock')}</span>
    </span>
  );
}
