import React, { useState, useEffect } from 'react';
import { ScrollText, Search } from 'lucide-react';
import { endpoints } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const res = await endpoints.admin.getLogs({ limit: 100 });
        if (res.success && res.data) {
          setLogs(res.data.items || []);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-emerald-400" />
          <span>Audit & Compliance Logs</span>
        </h2>
        <p className="text-xs text-slate-400">
          Immutable audit record of all admin activities, stock modifications, and settings updates.
        </p>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Type</th>
                <th className="py-3 px-4">Target ID</th>
                <th className="py-3 px-4">Metadata</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400 font-sans">
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {log.target_type || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 break-all max-w-[120px]">
                      {log.target_id || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 break-all max-w-xs text-[10px]">
                      {JSON.stringify(log.metadata)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-500 font-sans">
                    No admin audit logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
