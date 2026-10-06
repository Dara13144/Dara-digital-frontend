import React from 'react';
import { MessageCircle, ShieldCheck, Zap, HelpCircle, Send, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export function Support() {
  const { lang, t } = useLanguage();

  const faqs = [
    {
      q: 'How fast is digital product delivery?',
      a: 'All automated code, account, and link items are delivered instantly within 1 second of ABA PayWay payment confirmation.'
    },
    {
      q: 'How do I activate my Steam Key or Gift Card?',
      a: 'Open your Steam client or App Store app, navigate to Redeem Code, and paste the delivered secret code displayed on your completed order screen.'
    },
    {
      q: 'What should I do if a code is reported invalid?',
      a: 'Contact our Telegram support admin @DaraDigitalSupport with your Order ID (#ORD-...). We provide replacement or refund guarantees for verified issues.'
    }
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Support Hero */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-green">
          <MessageCircle className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-100">
            {t('profile.support')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            24/7 Telegram Customer Service & Instant Product Support
          </p>
        </div>

        <a
          href="https://t.me/DaraDigital_bot"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shadow-lg transition-all active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>Chat on Telegram (@DaraDigital_bot)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* FAQs */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1.5 text-xs"
            >
              <p className="font-bold text-slate-200">{faq.q}</p>
              <p className="text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
