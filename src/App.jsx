import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Scan, LayoutDashboard, Cpu, Info, Menu, X, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

import Home from './screens/Home';
import ScanPlate from './screens/ScanPlate';
import Dashboard from './screens/Dashboard';
import Pipeline from './screens/Pipeline';
import About from './screens/About';

function Navigation() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { path: '/',          label: 'Home',      icon: <ShieldCheck size={15} /> },
    { path: '/scan',      label: 'Scan',       icon: <Scan size={15} /> },
    { path: '/pipeline',  label: 'Pipeline',   icon: <Cpu size={15} /> },
    { path: '/dashboard', label: 'Dashboard',  icon: <LayoutDashboard size={15} /> },
    { path: '/about',     label: 'About',      icon: <Info size={15} /> },
  ];

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(5,5,15,0.92)'
          : 'rgba(5,5,15,0.7)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        borderBottom: scrolled
          ? '1px solid rgba(108,82,255,0.2)'
          : '1px solid rgba(108,82,255,0.08)',
        boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #6c52ff, #a78bfa)',
              boxShadow: '0 0 20px rgba(108,82,255,0.5)',
            }}
          >
            <ShieldCheck size={18} className="text-white relative z-10" />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(135deg, #8470ff, #c4b5fd)' }}
            />
          </div>
          <div>
            <span className="font-heading font-bold text-lg text-white tracking-tight">
              PlateSense <span style={{ color: '#a394ff' }}>AI</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/scan" className="btn-brand text-sm px-5 py-2.5">
            <Zap size={14} />
            Scan Now
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-xl text-surface-400 hover:text-white transition-colors"
          style={{ background: 'rgba(108,82,255,0.08)', border: '1px solid rgba(108,82,255,0.2)' }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div
          className="md:hidden px-4 py-4 flex flex-col gap-1"
          style={{
            borderTop: '1px solid rgba(108,82,255,0.15)',
            background: 'rgba(5,5,15,0.98)',
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/scan"
            onClick={() => setMobileOpen(false)}
            className="btn-brand text-sm mt-2 text-center justify-center"
          >
            <Zap size={14} />
            Scan Now
          </Link>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ borderTop: '1px solid rgba(108,82,255,0.12)', background: 'rgba(5,5,15,0.95)' }}
    >
      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(108,82,255,0.5), rgba(167,139,250,0.5), transparent)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6c52ff, #a78bfa)', boxShadow: '0 0 20px rgba(108,82,255,0.4)' }}
              >
                <ShieldCheck size={18} className="text-white" />
              </div>
              <span className="font-heading font-bold text-lg text-white">PlateSense AI</span>
            </div>
            <p className="text-surface-500 text-sm leading-relaxed max-w-xs mb-6">
              Intelligent Indian Automatic Number Plate Recognition powered by a
              three-stage deep learning pipeline.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'YOLOv8', c: '#6c52ff' },
                { label: 'EasyOCR', c: '#22d3ee' },
                { label: 'CNN', c: '#a78bfa' },
                { label: 'FastAPI', c: '#4ade80' },
              ].map(t => (
                <span
                  key={t.label}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                  style={{ color: t.c, background: `${t.c}15`, border: `1px solid ${t.c}30` }}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 font-heading">Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/', label: 'Home' },
                { to: '/scan', label: 'Scan Plate' },
                { to: '/pipeline', label: 'ML Pipeline' },
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/about', label: 'About' },
              ].map(l => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-surface-500 hover:text-brand-300 transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 font-heading">Tech Stack</h4>
            <ul className="space-y-2.5 text-sm text-surface-500">
              {['FastAPI Backend', 'React + Vite', 'YOLOv8 Detection', 'EasyOCR', 'SQLite Database', 'PyTorch'].map(t => (
                <li key={t} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-surface-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(24,24,56,0.8)' }}
        >
          <p className="text-surface-600 text-sm">
            © {new Date().getFullYear()} PlateSense AI — Neural Networks &amp; Deep Learning Course Project
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            <p className="text-surface-700 text-xs font-mono">v2.0.0 · Live</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-surface-950">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/scan"      element={<ScanPlate />} />
            <Route path="/pipeline"  element={<Pipeline />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about"     element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
