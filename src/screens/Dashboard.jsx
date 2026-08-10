import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Search, RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8005';

function StatusBadge({ isStolen }) {
  if (isStolen === null || isStolen === undefined) return (
    <span className="badge bg-surface-700/50 text-surface-400 border border-surface-700">Unknown</span>
  );
  return isStolen ? (
    <span className="badge-danger flex items-center gap-1">
      <AlertTriangle size={10} /> Stolen
    </span>
  ) : (
    <span className="badge-success flex items-center gap-1">
      <CheckCircle size={10} /> Clear
    </span>
  );
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchHistory = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/history`)
      .then(res => res.json())
      .then(data => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(); }, []);

  const filtered = history.filter(r =>
    r.plate_number?.toLowerCase().includes(search.toLowerCase()) ||
    r.state?.toLowerCase().includes(search.toLowerCase())
  );

  const totalScans   = history.length;
  const stolenCount  = history.filter(r => r.stolen_status?.is_stolen || r.is_stolen).length;
  const uniqueStates = new Set(history.map(r => r.state_code).filter(Boolean)).size;

  const stats = [
    { label: 'Total Scans',    value: totalScans,   color: 'brand',  bg: 'bg-brand-500/10',        text: 'text-brand-400',        border: 'border-brand-500/20' },
    { label: 'Stolen Alerts',  value: stolenCount,  color: 'red',    bg: 'bg-accent-red/10',        text: 'text-accent-red',       border: 'border-accent-red/20' },
    { label: 'States Seen',    value: uniqueStates, color: 'cyan',   bg: 'bg-accent-cyan/10',       text: 'text-accent-cyan',      border: 'border-accent-cyan/20' },
    { label: 'Clear Records',  value: totalScans - stolenCount, color: 'green', bg: 'bg-accent-green/10', text: 'text-accent-green', border: 'border-accent-green/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="section-label">Analytics</div>
          <h1 className="font-heading font-bold text-4xl text-white">Dashboard</h1>
          <p className="text-surface-400 mt-1">Real-time scan history and statistics.</p>
        </div>
        <button
          onClick={fetchHistory}
          className="btn-ghost flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`glass rounded-2xl p-6 border ${s.border}`}>
            <div className={`text-3xl font-heading font-bold ${s.text} mb-1`}>{s.value}</div>
            <div className="text-surface-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="px-6 py-4 border-b border-surface-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-heading font-semibold text-white">Scan History</h2>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search plate or state..."
              className="input-dark pl-9 text-sm py-2 w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-surface-500">
            <RefreshCw size={20} className="animate-spin mx-auto mb-3" />
            Loading history...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-surface-600">
            <p className="text-lg mb-1">No records found</p>
            <p className="text-sm text-surface-700">
              {history.length === 0
                ? 'Upload your first image on the Scan page to see results here.'
                : 'No results match your search.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-800">
                  <th className="text-left px-6 py-3 text-surface-500 font-medium text-xs uppercase tracking-wider">Plate</th>
                  <th className="text-left px-6 py-3 text-surface-500 font-medium text-xs uppercase tracking-wider">State</th>
                  <th className="text-left px-6 py-3 text-surface-500 font-medium text-xs uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-3 text-surface-500 font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-surface-500 font-medium text-xs uppercase tracking-wider">Scanned</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i} className="border-b border-surface-900 hover:bg-surface-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-white">{r.plate_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-surface-300">{r.state || '—'}</span>
                      {r.state_code && <span className="text-surface-600 text-xs ml-1.5 font-mono">({r.state_code})</span>}
                    </td>
                    <td className="px-6 py-4 text-surface-400">{r.vehicle_category || '—'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge isStolen={r.stolen_status?.is_stolen ?? r.is_stolen} />
                    </td>
                    <td className="px-6 py-4 text-surface-500 font-mono text-xs">{formatDate(r.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
