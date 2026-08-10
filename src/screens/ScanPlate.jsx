import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Scan, AlertTriangle, CheckCircle, Loader, ChevronRight, ImagePlus, Zap, Eye, Shield } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8005';

function ConfidenceBar({ label, value, color, icon }) {
  const pct = Math.round(value * 100);
  const colorMap = {
    brand:  { fill: '#6c52ff', glow: 'rgba(108,82,255,0.4)' },
    cyan:   { fill: '#22d3ee', glow: 'rgba(34,211,238,0.4)' },
    violet: { fill: '#a78bfa', glow: 'rgba(167,139,250,0.4)' },
  };
  const c = colorMap[color];
  return (
    <div>
      <div className="flex justify-between text-xs mb-2 items-center">
        <span className="text-surface-400 flex items-center gap-1.5">
          {icon && <span style={{ color: c.fill }}>{icon}</span>}
          {label}
        </span>
        <span className="font-mono font-bold" style={{ color: c.fill }}>{pct}%</span>
      </div>
      <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${c.fill}, ${c.fill}90)`,
            boxShadow: `0 0 8px ${c.glow}`,
          }}
        />
      </div>
    </div>
  );
}

const pipelineSteps = [
  { label: 'YOLOv8 detecting plate...', icon: <Eye size={14} />, color: '#6c52ff' },
  { label: 'EasyOCR reading text...',   icon: <Scan size={14} />, color: '#22d3ee' },
  { label: 'Checking registry...',      icon: <Shield size={14} />, color: '#4ade80' },
];

export default function ScanPlate() {
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);
  const fileInputRef = useRef();

  const handleFile = useCallback((f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const onRemove = () => { setFile(null); setPreview(null); setResult(null); setError(null); };

  const onSubmit = async () => {
    if (!file) return;
    setLoading(true); setError(null);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API_BASE}/api/scan`, { method: 'POST', body: formData, headers: { 'Bypass-Tunnel-Reminder': 'true' } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isStolen = result?.stolen_status?.is_stolen;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(108,82,255,0.12), transparent)', filter: 'blur(40px)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-14">
          <div className="section-label">Live Analysis</div>
          <h1 className="font-heading font-bold text-5xl text-white mb-4">
            Scan a <span className="gradient-text">Plate</span>
          </h1>
          <p className="text-surface-400 text-lg max-w-xl leading-relaxed">
            Upload any photo of an Indian vehicle. The AI pipeline will detect the plate,
            read the text, and cross-check against the stolen vehicle registry.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* ── LEFT: Upload ── */}
          <div className="space-y-5">
            {/* Drop Zone */}
            {!preview ? (
              <div
                className="relative rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                style={{
                  border: `2px dashed ${dragging ? '#6c52ff' : 'rgba(108,82,255,0.25)'}`,
                  background: dragging ? 'rgba(108,82,255,0.08)' : 'rgba(10,10,30,0.4)',
                  minHeight: 340,
                  transform: dragging ? 'scale(1.01)' : 'scale(1)',
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                {/* Corner decorators */}
                {['top-3 left-3 border-t border-l', 'top-3 right-3 border-t border-r',
                  'bottom-3 left-3 border-b border-l', 'bottom-3 right-3 border-b border-r'].map((cls, i) => (
                  <div key={i} className={`absolute w-6 h-6 ${cls}`} style={{ borderColor: 'rgba(108,82,255,0.5)' }} />
                ))}

                <div className="flex flex-col items-center justify-center h-full py-20 text-center px-8">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 text-brand-400"
                    style={{
                      background: 'rgba(108,82,255,0.1)',
                      border: '1px solid rgba(108,82,255,0.3)',
                      boxShadow: '0 0 30px rgba(108,82,255,0.15)',
                      animation: 'float 4s ease-in-out infinite',
                    }}
                  >
                    <ImagePlus size={32} />
                  </div>
                  <p className="text-white font-semibold text-lg mb-2">Drop your image here</p>
                  <p className="text-surface-500 text-sm mb-6">or click to browse files</p>
                  <div className="flex gap-2">
                    {['JPG', 'PNG', 'WEBP'].map(f => (
                      <span key={f} className="badge-brand text-xs">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(108,82,255,0.25)', background: '#0a0a1a' }}
              >
                <img src={preview} alt="Preview" className="w-full object-contain max-h-80" />
                <button
                  onClick={onRemove}
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-white transition-colors"
                  style={{ background: 'rgba(5,5,15,0.85)', border: '1px solid rgba(108,82,255,0.2)' }}
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-surface-950 to-transparent p-4">
                  <p className="text-surface-500 text-xs truncate font-mono">{file?.name}</p>
                </div>
                {/* Scan overlay animation while image is loaded */}
                <div className="scan-overlay" />
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => handleFile(e.target.files[0])} />

            {/* Analyze Button */}
            <button
              id="analyze-btn"
              onClick={onSubmit}
              disabled={!file || loading}
              className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
                file && !loading ? 'btn-brand' : ''
              }`}
              style={(!file || loading) ? {
                background: 'rgba(24,24,56,0.5)',
                color: 'rgba(112,112,160,0.5)',
                border: '1px solid rgba(108,82,255,0.1)',
                cursor: 'not-allowed',
              } : {}}
            >
              {loading ? (
                <><Loader size={18} className="animate-spin" /> Running Pipeline...</>
              ) : (
                <><Zap size={18} /> Analyze Plate <ChevronRight size={16} /></>
              )}
            </button>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}
              >
                <AlertTriangle size={18} className="flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Info chips */}
            {!file && (
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { icon: '🎯', label: '96% accuracy', color: '#6c52ff' },
                  { icon: '⚡', label: '~250ms', color: '#22d3ee' },
                  { icon: '🔒', label: 'Secure', color: '#4ade80' },
                ].map(chip => (
                  <div
                    key={chip.label}
                    className="flex items-center gap-2 p-3 rounded-xl text-xs font-medium text-surface-400"
                    style={{ background: 'rgba(10,10,30,0.5)', border: `1px solid ${chip.color}20` }}
                  >
                    <span>{chip.icon}</span>
                    {chip.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Results ── */}
          <div className="space-y-5">
            {/* Empty state */}
            {!result && !loading && (
              <div
                className="rounded-2xl p-12 flex flex-col items-center justify-center text-center"
                style={{ minHeight: 440, background: 'rgba(10,10,30,0.4)', border: '1px solid rgba(108,82,255,0.1)' }}
              >
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-surface-600 mb-6"
                  style={{ background: 'rgba(24,24,56,0.5)', border: '1px solid rgba(40,40,80,0.5)' }}
                >
                  <Scan size={32} />
                </div>
                <p className="text-surface-400 font-semibold text-lg mb-2">Results appear here</p>
                <p className="text-surface-700 text-sm">Upload an image and click Analyze</p>
              </div>
            )}

            {/* Annotated Image */}
            {result?.annotated_image_url && (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(108,82,255,0.2)' }}>
                <div
                  className="px-4 py-2.5 flex items-center gap-2 text-xs font-mono text-surface-500"
                  style={{ background: 'rgba(10,10,30,0.8)', borderBottom: '1px solid rgba(108,82,255,0.1)' }}
                >
                  <Eye size={12} className="text-brand-400" />
                  YOLOv8 annotated output
                </div>
                <img src={result.annotated_image_url} alt="Annotated result"
                  className="w-full object-contain max-h-64"
                  onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div
                className="rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-8"
                style={{ minHeight: 440, background: 'rgba(10,10,30,0.6)', border: '1px solid rgba(108,82,255,0.2)' }}
              >
                <div className="relative">
                  {/* Outer rings */}
                  <div className="w-24 h-24 rounded-full border border-brand-500/20 absolute inset-0" style={{ animation: 'rotateSlow 3s linear infinite' }} />
                  <div className="w-24 h-24 rounded-full border border-transparent border-t-brand-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Scan size={24} className="text-brand-400" />
                  </div>
                </div>
                <div className="space-y-4 w-full max-w-xs">
                  {pipelineSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm"
                      style={{ color: step.color, opacity: 0.85 }}>
                      <Loader size={14} className="animate-spin flex-shrink-0" style={{ animationDelay: `${i * 0.3}s` }} />
                      <span className="flex items-center gap-2">{step.icon} {step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="space-y-4" style={{ animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1)' }}>

                {/* Stolen Alert */}
                <div
                  className="p-5 rounded-2xl flex items-center gap-4"
                  style={{
                    background: isStolen ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)',
                    border: `1px solid ${isStolen ? 'rgba(248,113,113,0.35)' : 'rgba(74,222,128,0.3)'}`,
                    boxShadow: `0 0 30px ${isStolen ? 'rgba(248,113,113,0.05)' : 'rgba(74,222,128,0.05)'}`,
                  }}
                >
                  {isStolen
                    ? <AlertTriangle size={22} className="text-accent-red flex-shrink-0" />
                    : <CheckCircle size={22} className="text-accent-green flex-shrink-0" />}
                  <div>
                    <p className={`font-semibold font-heading ${isStolen ? 'text-accent-red' : 'text-accent-green'}`}>
                      {isStolen ? '⚠ STOLEN VEHICLE ALERT' : '✓ Clear Record'}
                    </p>
                    <p className="text-surface-400 text-xs mt-0.5">
                      {isStolen
                        ? result.stolen_status?.notes || 'Reported as stolen in registry'
                        : 'No stolen reports found for this vehicle.'}
                    </p>
                  </div>
                </div>

                {/* Plate Number */}
                <div
                  className="plate-display text-center"
                  style={{ border: '1px solid rgba(108,82,255,0.4)' }}
                >
                  <p className="text-surface-500 text-xs uppercase tracking-[0.2em] mb-3">Detected Plate</p>
                  <p className="font-mono font-bold text-4xl text-white tracking-[0.15em]">
                    {result.plate_number}
                  </p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'State', value: result.state || 'Unknown', sub: result.state_code, color: '#6c52ff' },
                    { label: 'Vehicle Type', value: result.vehicle_category || 'Unknown', sub: null, color: '#22d3ee' },
                    { label: 'Registry', value: result.stolen_status?.database || 'SQLite', sub: null, color: '#a78bfa' },
                    { label: 'Processing', value: `${result.processing_time_ms} ms`, sub: null, color: '#4ade80' },
                  ].map(item => (
                    <div
                      key={item.label}
                      className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]"
                      style={{ background: 'rgba(10,10,30,0.6)', border: `1px solid ${item.color}15` }}
                    >
                      <p className="text-surface-500 text-xs uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="text-white font-semibold">{item.value}</p>
                      {item.sub && <p className="text-surface-600 text-xs font-mono mt-0.5">{item.sub}</p>}
                    </div>
                  ))}
                </div>

                {/* Confidence Scores */}
                <div
                  className="rounded-2xl p-6 space-y-5"
                  style={{ background: 'rgba(10,10,30,0.6)', border: '1px solid rgba(108,82,255,0.15)' }}
                >
                  <p className="text-surface-400 text-xs uppercase tracking-[0.15em] font-semibold">Pipeline Confidence</p>
                  <ConfidenceBar label="YOLOv8 Detection"    value={result.confidence?.detection || 0}      color="brand"  icon={<Eye size={12} />} />
                  <ConfidenceBar label="EasyOCR Reading"     value={result.confidence?.ocr || 0}            color="cyan"   icon={<Scan size={12} />} />
                  <ConfidenceBar label="CNN Classification"  value={result.confidence?.classification || 0} color="violet" icon={<Zap size={12} />} />
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
