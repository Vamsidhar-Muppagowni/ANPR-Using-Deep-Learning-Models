import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Type, Brain, Database, Code2, Server, Globe, ArrowRight } from 'lucide-react';

const modelCards = [
  {
    icon: <Target size={24} />,
    name: 'YOLOv8',
    subtitle: 'Plate Detection',
    version: 'v8n (Nano)',
    color: 'brand',
    accentBg: 'bg-brand-500/10',
    accentBorder: 'border-brand-500/30',
    accentText: 'text-brand-400',
    facts: [
      'Single-pass detection network',
      'Trained on Kaggle dataset (~15K images)',
      'Outputs bounding box with confidence score',
      'Runs in < 50ms per image on CPU',
    ],
  },
  {
    icon: <Type size={24} />,
    name: 'EasyOCR',
    subtitle: 'Text Extraction',
    version: 'v1.7.2',
    color: 'cyan',
    accentBg: 'bg-accent-cyan/10',
    accentBorder: 'border-accent-cyan/30',
    accentText: 'text-accent-cyan',
    facts: [
      'CRAFT detector + BiLSTM recogniser',
      'Pre-trained on millions of text samples',
      'Handles noisy, tilted plate images',
      'Supports English alphanumeric characters',
    ],
  },
  {
    icon: <Brain size={24} />,
    name: 'CNN Classifier',
    subtitle: 'Vehicle Classification',
    version: 'Custom',
    color: 'violet',
    accentBg: 'bg-accent-violet/10',
    accentBorder: 'border-accent-violet/30',
    accentText: 'text-accent-violet',
    facts: [
      'Classifies Private / Commercial / Government',
      'Plate colour analysis (white/yellow/blue)',
      'Visual feature-based classification',
      'Architecture stage of the pipeline',
    ],
  },
];

const techStack = [
  { icon: <Server size={18} />,   label: 'FastAPI',        desc: 'Backend REST API' },
  { icon: <Code2 size={18} />,    label: 'React + Vite',   desc: 'Frontend Framework' },
  { icon: <Brain size={18} />,    label: 'PyTorch',        desc: 'Deep Learning Runtime' },
  { icon: <Target size={18} />,   label: 'Ultralytics',    desc: 'YOLOv8 Library' },
  { icon: <Type size={18} />,     label: 'EasyOCR',        desc: 'OCR Library' },
  { icon: <Database size={18} />, label: 'SQLite',         desc: 'Scan History DB' },
  { icon: <Globe size={18} />,    label: 'Kaggle Dataset', desc: '15K+ labelled images' },
  { icon: <Code2 size={18} />,    label: 'Tailwind CSS',   desc: 'Styling' },
];

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="section-label">About</div>
        <h1 className="font-heading font-bold text-5xl text-white mb-5">About PlateSense AI</h1>
        <p className="text-surface-400 text-lg leading-relaxed">
          PlateSense AI is a Neural Networks & Deep Learning course project that demonstrates the practical 
          integration of multiple state-of-the-art ML models into a real-world ANPR (Automatic Number Plate 
          Recognition) application for Indian roads.
        </p>
      </div>

      {/* Project overview */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass rounded-2xl p-8">
          <h2 className="font-heading font-bold text-2xl text-white mb-4">The Problem</h2>
          <p className="text-surface-400 leading-relaxed">
            India has one of the largest vehicle registrations in the world, with a unique plate formatting 
            system that varies by state, vehicle type, and era. Manual plate reading is slow, error-prone, 
            and impossible to scale for traffic surveillance, toll collection, or stolen vehicle detection.
          </p>
        </div>
        <div className="glass rounded-2xl p-8">
          <h2 className="font-heading font-bold text-2xl text-white mb-4">The Solution</h2>
          <p className="text-surface-400 leading-relaxed">
            A three-stage deep learning pipeline that first detects the plate region using object detection (YOLOv8), 
            then reads the alphanumeric string using scene-text OCR (EasyOCR), and finally classifies the 
            vehicle category using visual plate features (CNN) — all in a single automated pass.
          </p>
        </div>
      </div>

      {/* Dataset */}
      <div>
        <h2 className="font-heading font-bold text-3xl text-white mb-8">Dataset</h2>
        <div className="glass rounded-2xl p-8 border border-surface-700/50">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-surface-500 text-xs uppercase tracking-wider mb-2">Source</p>
              <p className="text-white font-semibold">Kaggle — DataCluster Labs</p>
              <p className="text-surface-500 text-sm mt-0.5 font-mono">indian-number-plates-dataset</p>
            </div>
            <div>
              <p className="text-surface-500 text-xs uppercase tracking-wider mb-2">Content</p>
              <p className="text-white font-semibold">15,000+ Images</p>
              <p className="text-surface-500 text-sm mt-0.5">Pascal VOC XML annotations</p>
            </div>
            <div>
              <p className="text-surface-500 text-xs uppercase tracking-wider mb-2">Converted To</p>
              <p className="text-white font-semibold">YOLO TXT Format</p>
              <p className="text-surface-500 text-sm mt-0.5">80/20 train-val split</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-surface-800">
            <p className="text-surface-400 text-sm leading-relaxed">
              The Colab notebook in <span className="font-mono text-brand-400">scripts/Colab_Training.ipynb</span> automatically 
              downloads the dataset via kagglehub, converts annotations from Pascal VOC XML to YOLO TXT format, 
              trains YOLOv8n for 50 epochs on a T4 GPU, and exports the <span className="font-mono text-brand-400">best.pt</span> weights.
            </p>
          </div>
        </div>
      </div>

      {/* Models */}
      <div>
        <h2 className="font-heading font-bold text-3xl text-white mb-8">The Three Models</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {modelCards.map((m) => (
            <div key={m.name} className={`glass rounded-2xl p-6 border ${m.accentBorder} hover:shadow-card transition-all`}>
              <div className={`w-12 h-12 rounded-xl ${m.accentBg} border ${m.accentBorder} flex items-center justify-center mb-4 ${m.accentText}`}>
                {m.icon}
              </div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-heading font-bold text-xl text-white">{m.name}</h3>
                  <p className="text-surface-500 text-sm">{m.subtitle}</p>
                </div>
                <span className={`badge ${m.accentBg} ${m.accentText} border ${m.accentBorder} text-xs`}>{m.version}</span>
              </div>
              <ul className="space-y-2 mt-4">
                {m.facts.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-surface-400 text-sm">
                    <span className={`${m.accentText} mt-0.5`}>•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div>
        <h2 className="font-heading font-bold text-3xl text-white mb-8">Tech Stack</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {techStack.map((t) => (
            <div key={t.label} className="glass-hover rounded-xl p-4 flex items-center gap-3">
              <div className="text-brand-400 flex-shrink-0">{t.icon}</div>
              <div>
                <p className="text-white text-sm font-medium">{t.label}</p>
                <p className="text-surface-600 text-xs">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-8 space-y-4">
        <h3 className="font-heading font-bold text-2xl text-white">Ready to see it in action?</h3>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/pipeline" className="btn-ghost flex items-center gap-2">
            View Pipeline
            <ArrowRight size={16} />
          </Link>
          <Link to="/scan" className="btn-brand flex items-center gap-2">
            Scan a Plate
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
