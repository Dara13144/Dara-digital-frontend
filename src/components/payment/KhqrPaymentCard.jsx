import React, { useState, useEffect, useRef } from 'react';
import { renderSVG } from 'uqr';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { endpoints } from '../../services/api.js';
import { useTelegram } from '../../hooks/useTelegram.js';

export function KhqrPaymentCard({
  paymentId,
  orderId,
  qrString,
  checkoutUrl,
  amount,
  currency = 'USD',
  merchantName = 'Dara Digital Store',
  expiresAt,
  onPaid,
  onCancel
}) {
  const [status, setStatus] = useState('pending'); // pending, scanned, paid, expired, failed
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const { haptic } = useTelegram();
  const pollTimerRef = useRef(null);

  // Generate QR SVG via uqr with error correction H (for center medallion overlay)
  const qrSvg = React.useMemo(() => {
    if (!qrString) return '';
    try {
      return renderSVG(qrString, { ecc: 'H' });
    } catch (err) {
      console.warn('QR render error:', err);
      return '';
    }
  }, [qrString]);

  // Countdown timer
  useEffect(() => {
    if (status === 'paid' || status === 'expired' || status === 'failed') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Auto-check Payment Status Polling
  useEffect(() => {
    if (!paymentId) return;
    const TERMINAL = new Set(['paid', 'expired', 'failed']);

    async function checkStatus() {
      if (TERMINAL.has(status)) return;
      try {
        const res = await endpoints.checkPaymentStatus(paymentId);
        if (res.success && res.data) {
          const nextStatus = res.data.status?.toLowerCase();

          if (nextStatus === 'paid' || nextStatus === 'completed') {
            setStatus('paid');
            haptic('success');
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            if (onPaid) {
              setTimeout(() => {
                onPaid(res.data.order || res.data);
              }, 1500);
            }
          } else if (nextStatus === 'scanned') {
            setStatus('scanned');
            haptic('selection');
          } else if (nextStatus === 'expired' || nextStatus === 'failed') {
            setStatus(nextStatus);
            haptic('error');
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          }
        }
      } catch (err) {
        console.warn('Payment status poll notice:', err.message);
      }
    }

    // Initial check
    checkStatus();

    // Poll every 2.5 seconds
    pollTimerRef.current = setInterval(checkStatus, 2500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [paymentId, status]);

  const copyQrText = () => {
    if (qrString) {
      navigator.clipboard.writeText(qrString);
      setCopied(true);
      haptic('selection');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const isDone = status === 'paid';
  const isScanned = status === 'scanned';
  const isExpired = status === 'expired' || status === 'failed';
  const showQr = !isDone && !isScanned && !isExpired;

  return (
    <div className="mx-auto w-full max-w-sm select-none">
      {/* KHQR Card Container */}
      <div className="overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200/80 relative">
        {/* 1. Official Red Header with Wordmark */}
        <div className="flex items-center justify-between bg-gradient-to-r from-red-600 via-rose-600 to-red-600 px-5 py-3.5 text-white">
          <div className="flex items-center gap-2">
            <span className="font-black tracking-wider text-base">KHQR</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20 uppercase tracking-tight">
              Bakong
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-black/20 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* 2. Merchant info & Tear Line */}
        <div className="relative border-b border-dashed border-gray-300 px-6 py-4 bg-slate-50/50">
          {/* Folded corner CSS border triangle */}
          <div className="absolute -top-px right-0 h-0 w-0 border-t-[20px] border-l-[20px] border-t-red-600 border-l-transparent" />

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <img src="/logo-icon.png" alt="" className="w-4 h-4 object-contain" />
                <h3 className="text-xs font-bold text-slate-700">{merchantName}</h3>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  ${Number(amount || 0).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-500">{currency}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Auto-Detect
              </span>
            </div>
          </div>
        </div>

        {/* 3. Main Center Panel: QR Code / State Panels */}
        <div className="relative flex items-center justify-center p-6 bg-white min-h-[280px]">
          {isDone ? (
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-3 animate-in zoom-in-75 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Payment Received!</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instant delivery is being unlocked...
                </p>
              </div>
            </div>
          ) : isScanned ? (
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-3 animate-in fade-in-50 duration-200">
              <div className="w-16 h-16 rounded-full bg-sky-500/15 border-2 border-sky-500 text-sky-600 flex items-center justify-center animate-pulse">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">QR Code Scanned</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm the payment in your banking app now.
                </p>
              </div>
            </div>
          ) : isExpired ? (
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-3 animate-in fade-in-50 duration-200">
              <div className="w-16 h-16 rounded-full bg-rose-500/15 border-2 border-rose-500 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Payment Expired</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  This QR code is no longer valid.
                </p>
              </div>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate New QR</span>
                </button>
              )}
            </div>
          ) : (
            /* Live QR with Center Medallion */
            <div className="relative aspect-square w-full max-w-[220px]">
              <div
                className="w-full h-full [&_svg]:h-full [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />

              {/* Center Medallion (Official Bakong/ABA Riel Symbol) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white p-1 shadow-md border border-slate-200 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-red-600 flex items-center justify-center text-white font-black text-sm">
                  ៛
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Action Buttons */}
        {showQr && (
          <div className="p-4 pt-0 space-y-2 bg-white">

            <button
              type="button"
              onClick={copyQrText}
              className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">QR Payload Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Raw KHQR Text</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="mt-3 text-center space-y-1">
        <p className="text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Scan with ABA Bank, Bakong, ACLEDA & Any Cambodian Bank</span>
        </p>
        <p className="text-[11px] text-slate-500">
          Payment is automatically verified in real-time. Do not close this window.
        </p>
      </div>
    </div>
  );
}
