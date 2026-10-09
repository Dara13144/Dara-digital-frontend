import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, ShieldCheck } from 'lucide-react';
import { endpoints } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export function AdminSettings() {
  const [settings, setSettings] = useState({
    store_name: { en: '𝑀𝑎𝑖𝑠𝑒𝑟 𝑆𝑡𝑜𝑟𝑒', km: '𝑀𝑎𝑖𝑠𝑒𝑟 𝑆𝑡𝑜𝑟𝑒' },
    store_currency: 'USD',
    support_telegram: '@MaiserStore_bot',
    maintenance_mode: false,
    low_stock_threshold: 3,
    min_order_amount: 1.00,
    max_order_amount: 2000.00
  });

  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await endpoints.admin.getSettings();
        if (res.success && res.data) {
          setSettings((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await endpoints.admin.updateSettings(settings);
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="text-slate-400 text-xs">Loading settings...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-emerald-400" />
          <span>Store Settings & Configuration</span>
        </h2>
        <p className="text-xs text-slate-400">
          Configure store brand names, support handles, and order limits.
        </p>
      </div>

      <form onSubmit={handleSave} className="p-5 rounded-2xl glass-card border border-slate-800 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Store Name (EN)</label>
            <input
              type="text"
              value={settings.store_name?.en || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  store_name: { ...settings.store_name, en: e.target.value }
                })
              }
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Store Name (Khmer)</label>
            <input
              type="text"
              value={settings.store_name?.km || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  store_name: { ...settings.store_name, km: e.target.value }
                })
              }
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Telegram Support Handle</label>
            <input
              type="text"
              value={settings.support_telegram || ''}
              onChange={(e) => setSettings({ ...settings, support_telegram: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Low Stock Warning Threshold</label>
            <input
              type="number"
              value={settings.low_stock_threshold || 3}
              onChange={(e) => setSettings({ ...settings, low_stock_threshold: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Min Order Amount ($ USD)</label>
            <input
              type="number"
              step="0.01"
              value={settings.min_order_amount || 1.00}
              onChange={(e) => setSettings({ ...settings, min_order_amount: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Max Order Amount ($ USD)</label>
            <input
              type="number"
              step="0.01"
              value={settings.max_order_amount || 2000.00}
              onChange={(e) => setSettings({ ...settings, max_order_amount: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(settings.maintenance_mode)}
              onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
            />
            <span className="font-bold text-slate-200">Enable Maintenance Mode (Pause checkout)</span>
          </label>
        </div>

        {/* Google Admin OAuth Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-200">Google Admin Authentication</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Administrators can log into the management system with Google OAuth. Authorized admin emails: <span className="font-mono text-cyan-400">bunrak778@gmail.com</span>, <span className="font-mono text-cyan-400">finozzz377@gmail.com</span>, <span className="font-mono text-cyan-400">mdara9695@gmail.com</span>.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-glow-green text-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
