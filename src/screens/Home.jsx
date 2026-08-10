import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scan, Shield, Zap, Database, ChevronRight, Circle, Eye, Cpu, Activity } from 'lucide-react';

/* ── Animated Counter ── */
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Particle Background ── */
function ParticleField() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 4 + 2}px`,
    delay: `${Math.random() * 8}s`,
    duration: `${Math.random() * 6 + 6}s`,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-brand-400"
          style={{
            left: p.left,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `particle ${p.duration} linear ${p.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── 3D Floating Plate ── */
function FloatingPlate() {
  return (
    <div className="relative flex items-center justify-center" style={{ perspective: '1000px' }}>
      {/* Outer ring */}
      <div
        className="absolute w-80 h-80 rounded-full border border-brand-500/20"
        style={{ animation: 'rotateSlow 20s linear infinite' }}
      />
      <div
        className="absolute w-64 h-64 rounded-full border border-accent-cyan/10"
        style={{ animation: 'rotateSlow 14s linear infinite reverse' }}
      />

      {/* Hero image */}
      <div
        className="relative w-72 h-72 rounded-2xl overflow-hidden"
        style={{ animation: 'tilt3d 8s ease-in-out infinite' }}
      >
        <img
          src="/hero_scan.png"
          alt="AI plate scanning"
          className="w-full h-full object-cover"
          style={{ borderRadius: '1rem' }}
        />
        {/* Scan overlay */}
        <div className="scan-overlay" />
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-950/60" />

        {/* Corner decorators */}
        {[
          'top-2 left-2 border-t border-l',
          'top-2 right-2 border-t border-r',
          'bottom-2 left-2 border-b border-l',
          'bottom-2 right-2 border-b border-r',
        ].map((cls, i) => (
          <div key={i} className={`absolute w-5 h-5 ${cls} border-accent-cyan`} />
        ))}
      </div>

      {/* Floating result chips */}
      <div
        className="absolute -right-4 top-8 glass rounded-xl px-3 py-2 text-xs font-mono border border-accent-green/30 text-accent-green"
        style={{ animation: 'float 4s ease-in-out 0.5s infinite' }}
      >
        ✓ MH 12 AB 1234
      </div>
      <div
        className="absolute -left-4 bottom-16 glass rounded-xl px-3 py-2 text-xs border border-accent-cyan/30 text-accent-cyan"
        style={{ animation: 'float 5s ease-in-out 1s infinite' }}
      >
        🔍 96.4% confidence
      </div>
      <div
        className="absolute right-0 bottom-4 glass rounded-xl px-3 py-2 text-xs border border-brand-500/30 text-brand-300"
        style={{ animation: 'float 6s ease-in-out 0.2s infinite' }}
      >
        ⚡ 247ms
      </div>
    </div>
  );
}

/* ── Data ── */
const stats = [
  { label: 'ML Models',        value: 3,     suffix: '',    icon: '🤖', accent: '#6c52ff' },
  { label: 'Dataset Images',   value: 15000, suffix: '+',   icon: '🖼️', accent: '#22d3ee' },
  { label: 'States Supported', value: 30,    suffix: '',    icon: '🗺️', accent: '#a78bfa' },
  { label: 'Avg. Process',     value: 250,   suffix: 'ms',  icon: '⚡', accent: '#4ade80' },
];

const steps = [
  {
    num: '01', title: 'Upload Image', icon: '📤',
    desc: 'Drag & drop or select any photo of an Indian vehicle with a visible license plate.',
    color: 'brand', grad: 'from-brand-500/20 to-brand-600/5',
    border: 'border-brand-500/30', text: 'text-brand-300',
  },
  {
    num: '02', title: 'AI Pipeline Runs', icon: '🧠',
    desc: 'YOLOv8 detects the plate, EasyOCR reads the text, CNN classifies the vehicle type.',
    color: 'cyan', grad: 'from-accent-cyan/20 to-accent-cyan/5',
    border: 'border-accent-cyan/30', text: 'text-accent-cyan',
  },
  {
    num: '03', title: 'Instant Results', icon: '✅',
    desc: 'Instantly see plate number, state, vehicle category, and stolen status report.',
    color: 'violet', grad: 'from-accent-violet/20 to-accent-violet/5',
    border: 'border-accent-violet/30', text: 'text-accent-violet',
  },
];

const features = [
  {
    icon: <Scan size={22} />, title: 'Real-Time Detection',
    desc: 'YOLOv8 trained on 15,000+ Indian plate images for fast, accurate bounding boxes.',
    accent: 'brand', glow: 'rgba(108,82,255,0.15)',
    bg: 'rgba(108,82,255,0.08)', border: 'rgba(108,82,255,0.25)', text: '#a394ff',
  },
  {
    icon: <Eye size={22} />, title: 'OCR Text Extraction',
    desc: 'EasyOCR reads alphanumeric characters from the cropped plate region with high precision.',
    accent: 'cyan', glow: 'rgba(34,211,238,0.12)',
    bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.25)', text: '#22d3ee',
  },
  {
    icon: <Shield size={22} />, title: 'Stolen Vehicle Check',
    desc: 'Every plate cross-referenced against the registry database in real-time.',
    accent: 'green', glow: 'rgba(74,222,128,0.12)',
    bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)', text: '#4ade80',
  },
  {
    icon: <Database size={22} />, title: 'Scan History',
    desc: 'All results persisted in a local SQLite database. Browse and filter your full history.',
    accent: 'violet', glow: 'rgba(167,139,250,0.12)',
    bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)', text: '#a78bfa',
  },
];

const techStack = [
  { label: 'YOLOv8', color: '#6c52ff', bg: 'rgba(108,82,255,0.1)', border: 'rgba(108,82,255,0.3)' },
  { label: 'EasyOCR', color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.3)' },
  { label: 'CNN Classifier', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
  { label: 'FastAPI', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)' },
  { label: 'React + Vite', color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.3)' },
  { label: 'PyTorch', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
];

/* ── Home ── */
export default function Home() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center px-4 py-20 overflow-hidden">
        {/* Animated grid */}
        <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />

        {/* Orb lights */}
        <div className="orb w-[700px] h-[700px] bg-brand-600/10 -top-40 left-1/2 -translate-x-1/2" />
        <div className="orb w-[400px] h-[400px] bg-accent-cyan/6 top-1/3 -right-20" />
        <div className="orb w-[300px] h-[300px] bg-accent-violet/8 bottom-20 -left-10" />

        <ParticleField />

        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — Text */}
            <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Live badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-sm font-semibold mb-8 shadow-[0_0_30px_rgba(108,82,255,0.15)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
                </span>
                Neural Networks &amp; Deep Learning Project
              </div>

              <h1 className="font-heading font-bold text-5xl sm:text-6xl xl:text-7xl leading-[1.05] mb-6">
                <span className="text-white">Intelligent</span>
                <br />
                <span className="gradient-text">Number Plate</span>
                <br />
                <span className="text-white">Recognition</span>
              </h1>

              <p className="text-surface-400 text-lg sm:text-xl leading-relaxed max-w-lg mb-8">
                A three-stage deep learning pipeline combining{' '}
                <span className="text-brand-300 font-semibold">YOLOv8</span>,{' '}
                <span className="text-accent-cyan font-semibold">EasyOCR</span>, and{' '}
                <span className="text-accent-violet font-semibold">CNN</span>{' '}
                to detect, read, and classify Indian vehicle license plates in real time.
              </p>

              {/* Tech chips */}
              <div className="flex flex-wrap gap-2 mb-10">
                {techStack.map(t => (
                  <span
                    key={t.label}
                    className="tech-chip"
                    style={{ color: t.color, background: t.bg, borderColor: t.border }}
                  >
                    {t.label}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/scan" className="btn-brand text-base px-8 py-4">
                  <Scan size={18} />
                  Scan a Plate
                  <ArrowRight size={16} />
                </Link>
                <Link to="/pipeline" className="btn-ghost text-base px-8 py-4">
                  View Architecture
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right — 3D Plate */}
            <div
              className={`flex items-center justify-center transition-all duration-700 delay-300 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <FloatingPlate />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative py-16 px-4 border-y border-surface-800/60 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/50 via-surface-900/30 to-brand-950/50" />
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="stat-card group"
                style={{ '--card-accent': s.accent }}
              >
                <div className="text-3xl mb-2">{s.icon}</div>
                <div
                  className="font-heading font-bold text-4xl mb-1"
                  style={{ color: s.accent }}
                >
                  <AnimatedCounter target={s.value} suffix={s.suffix} duration={1800 + i * 200} />
                </div>
                <div className="text-surface-500 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 px-4 relative overflow-hidden">
        <div className="orb w-[500px] h-[500px] bg-accent-cyan/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="section-label mx-auto w-fit">How It Works</div>
            <h2 className="font-heading font-bold text-4xl sm:text-5xl text-white mb-4">
              Three steps to a result
            </h2>
            <p className="text-surface-400 text-lg max-w-xl mx-auto">
              From raw image to structured intelligence in under a second.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector */}
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-brand-500/60 via-accent-cyan/60 to-accent-violet/60"
              style={{ boxShadow: '0 0 10px rgba(108,82,255,0.4)' }}
            />

            {steps.map((step, i) => (
              <div
                key={i}
                className={`glass-hover rounded-2xl p-8 text-center relative bg-gradient-to-br ${step.grad} group`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Step number glow */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.grad} border ${step.border} flex flex-col items-center justify-center mx-auto mb-6 text-3xl group-hover:scale-110 transition-transform duration-300`}
                >
                  {step.icon}
                </div>
                <div className={`font-mono text-xs font-bold ${step.text} mb-2 tracking-widest`}>{step.num}</div>
                <h3 className="font-heading font-semibold text-xl text-white mb-3">{step.title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-900/20 to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="section-label mx-auto w-fit">Features</div>
            <h2 className="font-heading font-bold text-4xl sm:text-5xl text-white mb-4">
              Built for accuracy &amp; speed
            </h2>
            <p className="text-surface-400 text-lg max-w-xl mx-auto">
              Every component engineered for Indian plate recognition.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="neon-card p-6 group cursor-default"
                style={{ '--glow': f.glow }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: f.bg, border: `1px solid ${f.border}`, color: f.text, boxShadow: `0 0 20px ${f.glow}` }}
                >
                  {f.icon}
                </div>

                <h3 className="font-heading font-semibold text-white mb-2 text-lg">{f.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{f.desc}</p>

                {/* Bottom accent line on hover */}
                <div
                  className="mt-4 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${f.text}, transparent)` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEURAL NETWORK SHOWCASE ── */}
      <section className="py-28 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Image side */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden" style={{ animation: 'float 8s ease-in-out infinite' }}>
                <img
                  src="/neural_network.png"
                  alt="Neural network pipeline visualization"
                  className="w-full object-cover rounded-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-transparent to-transparent" />

                {/* Overlay labels */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between">
                  {['YOLOv8', 'EasyOCR', 'CNN'].map((m, i) => (
                    <div
                      key={m}
                      className="glass px-3 py-1.5 rounded-lg text-xs font-mono font-bold"
                      style={{ color: ['#a394ff', '#22d3ee', '#a78bfa'][i], borderColor: ['rgba(108,82,255,0.3)', 'rgba(34,211,238,0.3)', 'rgba(167,139,250,0.3)'][i] }}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative corner lines */}
              <div className="absolute -top-2 -left-2 w-12 h-12 border-t-2 border-l-2 border-brand-500/40 rounded-tl-xl" />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-2 border-r-2 border-accent-cyan/40 rounded-br-xl" />
            </div>

            {/* Text side */}
            <div className="order-1 lg:order-2">
              <div className="section-label">Architecture</div>
              <h2 className="font-heading font-bold text-4xl sm:text-5xl text-white mb-6">
                See how the models
                <span className="gradient-text block">work together</span>
              </h2>
              <p className="text-surface-400 text-lg leading-relaxed mb-8">
                Explore the full interactive pipeline — from raw image input, through
                YOLOv8 detection, EasyOCR text reading, and CNN classification, to the final output.
              </p>

              {/* Mini pipeline */}
              <div className="space-y-3 mb-10">
                {[
                  { label: 'Plate Detection', model: 'YOLOv8', pct: 96, color: '#6c52ff' },
                  { label: 'Text Extraction', model: 'EasyOCR', pct: 91, color: '#22d3ee' },
                  { label: 'Classification',  model: 'CNN',     pct: 88, color: '#a78bfa' },
                ].map(row => (
                  <div key={row.label} className="glass rounded-xl p-3 flex items-center gap-3">
                    <div className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ color: row.color, background: `${row.color}15`, border: `1px solid ${row.color}30` }}>
                      {row.model}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-surface-300">{row.label}</span>
                        <span className="font-mono font-bold" style={{ color: row.color }}>{row.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${row.pct}%`, background: `linear-gradient(90deg, ${row.color}, ${row.color}80)`, boxShadow: `0 0 8px ${row.color}50` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 flex-col sm:flex-row">
                <Link to="/pipeline" className="btn-brand px-8 py-3.5">
                  View Full Pipeline
                  <ArrowRight size={16} />
                </Link>
                <Link to="/scan" className="btn-ghost px-8 py-3.5">
                  Try Live Scan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section className="py-28 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative">
          {/* Glowing border card */}
          <div
            className="relative rounded-3xl p-12 sm:p-16 text-center overflow-hidden"
            style={{
              background: 'rgba(10,10,30,0.8)',
              border: '1px solid rgba(108,82,255,0.3)',
              boxShadow: '0 0 0 1px rgba(108,82,255,0.08), 0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
              animation: 'borderGlow 4s ease-in-out infinite',
            }}
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/6 via-transparent to-accent-cyan/4 pointer-events-none" />
            <div className="orb w-64 h-64 bg-brand-600/15 -top-10 left-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="section-label mx-auto w-fit mb-8">
                <Activity size={12} />
                Ready to Use
              </div>
              <h2 className="font-heading font-bold text-4xl sm:text-5xl text-white mb-5">
                Start scanning plates{' '}
                <span className="gradient-text">right now</span>
              </h2>
              <p className="text-surface-400 text-lg max-w-xl mx-auto mb-10">
                Upload any image of an Indian vehicle and get instant AI-powered results
                — plate number, state, vehicle type, and stolen status in milliseconds.
              </p>

              <div className="flex gap-4 justify-center flex-col sm:flex-row">
                <Link to="/scan" className="btn-brand text-base px-10 py-4">
                  <Scan size={18} />
                  Scan a Plate Now
                  <ArrowRight size={16} />
                </Link>
                <Link to="/dashboard" className="btn-ghost text-base px-10 py-4">
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
