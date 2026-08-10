import React from 'react';
import { ArrowRight, Box, Type, Brain, ChevronRight, Zap, Target, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const models = [
  {
    id: 'yolo',
    label: 'Stage 1',
    name: 'YOLOv8',
    fullName: 'You Only Look Once v8',
    role: 'Plate Detection',
    icon: <Target size={28} />,
    color: 'brand',
    inputLabel: 'Full Vehicle Image',
    outputLabel: 'Bounding Box Coordinates',
    metrics: [
      { k: 'Architecture', v: 'YOLOv8n (Nano)' },
      { k: 'Task',         v: 'Object Detection' },
      { k: 'Input Size',   v: '640 × 640 px' },
      { k: 'Classes',      v: '1 (license_plate)' },
      { k: 'Dataset',      v: '15,000+ Indian plates' },
      { k: 'Format',       v: 'YOLO TXT Labels' },
    ],
    desc: 'YOLOv8 is a single-pass convolutional neural network that divides the image into a grid and simultaneously predicts bounding boxes and confidence scores for all regions. Trained on the Kaggle Indian Number Plates dataset, it precisely locates the rectangular plate region within any vehicle photo.',
    accentBg: 'bg-brand-500/10',
    accentBorder: 'border-brand-500/30',
    accentText: 'text-brand-400',
    accentRing: 'ring-brand-500/30',
  },
  {
    id: 'ocr',
    label: 'Stage 2',
    name: 'EasyOCR',
    fullName: 'Easy Optical Character Recognition',
    role: 'Text Extraction',
    icon: <Type size={28} />,
    color: 'cyan',
    inputLabel: 'Cropped Plate Image (ROI)',
    outputLabel: 'Alphanumeric Plate String',
    metrics: [
      { k: 'Engine',       v: 'CRAFT + CRNN' },
      { k: 'Task',         v: 'Scene Text Recognition' },
      { k: 'Language',     v: 'English (Latin script)' },
      { k: 'Architecture', v: 'BiLSTM + CTC Loss' },
      { k: 'Input',        v: 'Cropped plate ROI' },
      { k: 'Output',       v: 'Unicode string' },
    ],
    desc: 'EasyOCR uses a two-stage approach: CRAFT (Character Region Awareness) identifies individual character bounding boxes, and a Bidirectional LSTM with CTC loss decodes the sequence. The model is pre-trained on millions of scene text examples and fine-tunes well on structured plate fonts.',
    accentBg: 'bg-accent-cyan/10',
    accentBorder: 'border-accent-cyan/30',
    accentText: 'text-accent-cyan',
    accentRing: 'ring-accent-cyan/30',
  },
  {
    id: 'cnn',
    label: 'Stage 3',
    name: 'CNN',
    fullName: 'Convolutional Neural Network',
    role: 'Vehicle Classification',
    icon: <Brain size={28} />,
    color: 'violet',
    inputLabel: 'Plate String + Visual Features',
    outputLabel: 'Vehicle Category',
    metrics: [
      { k: 'Architecture', v: 'Custom CNN' },
      { k: 'Task',         v: 'Classification' },
      { k: 'Classes',      v: 'Private / Commercial / Govt.' },
      { k: 'Input',        v: 'Plate region image' },
      { k: 'Loss',         v: 'Categorical Cross-Entropy' },
      { k: 'Status',       v: 'Architecture stage' },
    ],
    desc: 'The CNN classifier analyses the visual features of the plate (background colour, border type, font style) to determine the vehicle\'s registration category. White plates indicate Private vehicles, yellow plates indicate Commercial, and blue plates indicate Government vehicles — a uniquely Indian plate standard.',
    accentBg: 'bg-accent-violet/10',
    accentBorder: 'border-accent-violet/30',
    accentText: 'text-accent-violet',
    accentRing: 'ring-accent-violet/30',
  },
];

const arrowColors = ['text-brand-400', 'text-accent-cyan'];

const pipelineSteps = [
  { label: 'Input\nImage',      icon: <Box size={20} />,      color: 'surface' },
  { label: 'YOLOv8\nDetect',    icon: <Target size={20} />,   color: 'brand'   },
  { label: 'Crop\nROI',         icon: <FileText size={20} />, color: 'surface' },
  { label: 'EasyOCR\nRead',     icon: <Type size={20} />,     color: 'cyan'    },
  { label: 'CNN\nClassify',     icon: <Brain size={20} />,    color: 'violet'  },
  { label: 'Registry\nCheck',   icon: <Zap size={20} />,      color: 'surface' },
  { label: 'Final\nOutput',     icon: <ChevronRight size={20} />, color: 'green' },
];

const stepColorMap = {
  surface: { bg: 'bg-surface-800', border: 'border-surface-700', text: 'text-surface-300' },
  brand:   { bg: 'bg-brand-500/15', border: 'border-brand-500/40', text: 'text-brand-300' },
  cyan:    { bg: 'bg-accent-cyan/10', border: 'border-accent-cyan/40', text: 'text-accent-cyan' },
  violet:  { bg: 'bg-accent-violet/10', border: 'border-accent-violet/40', text: 'text-accent-violet' },
  green:   { bg: 'bg-accent-green/10', border: 'border-accent-green/40', text: 'text-accent-green' },
};

export default function Pipeline() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

      {/* Header */}
      <div className="text-center">
        <div className="section-label mx-auto w-fit">Architecture</div>
        <h1 className="font-heading font-bold text-5xl text-white mb-5">
          Pipeline Architecture
        </h1>
        <p className="text-surface-400 text-lg max-w-2xl mx-auto leading-relaxed">
          PlateSense AI uses three specialised deep learning models working in sequence
          to transform a raw image into actionable plate data.
        </p>
      </div>

      {/* Flow diagram */}
      <div>
        <h2 className="font-heading font-semibold text-xl text-white mb-8 text-center">
          End-to-End Data Flow
        </h2>
        <div className="glass rounded-3xl p-8 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] gap-2">
            {pipelineSteps.map((step, i) => {
              const c = stepColorMap[step.color];
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-3 flex-1">
                    <div className={`w-14 h-14 rounded-2xl border ${c.bg} ${c.border} flex items-center justify-center ${c.text}`}>
                      {step.icon}
                    </div>
                    <span className={`text-xs font-medium text-center whitespace-pre-line ${c.text}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <ArrowRight
                      size={18}
                      className={`flex-shrink-0 ${arrowColors[i % 2]}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model deep-dives */}
      <div className="space-y-8">
        <h2 className="font-heading font-bold text-3xl text-white text-center">
          Model Deep-Dives
        </h2>

        {models.map((model) => (
          <div
            key={model.id}
            id={model.id}
            className={`glass rounded-3xl p-8 border ${model.accentBorder} hover:shadow-card transition-all duration-300`}
          >
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left - Identity */}
              <div className="lg:col-span-1 flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${model.accentBg} border ${model.accentBorder} flex items-center justify-center flex-shrink-0 ${model.accentText}`}>
                    {model.icon}
                  </div>
                  <div>
                    <span className={`badge ${model.accentBg} ${model.accentText} border ${model.accentBorder} mb-1`}>
                      {model.label}
                    </span>
                    <h3 className="font-heading font-bold text-2xl text-white">{model.name}</h3>
                    <p className="text-surface-500 text-sm">{model.fullName}</p>
                  </div>
                </div>

                {/* I/O */}
                <div className="bg-surface-900/60 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-surface-600 text-xs uppercase tracking-wider mb-1">Input</p>
                    <p className={`font-mono text-sm ${model.accentText}`}>{model.inputLabel}</p>
                  </div>
                  <div className="border-t border-surface-800" />
                  <div>
                    <p className="text-surface-600 text-xs uppercase tracking-wider mb-1">Output</p>
                    <p className={`font-mono text-sm ${model.accentText}`}>{model.outputLabel}</p>
                  </div>
                </div>
              </div>

              {/* Middle - Description */}
              <div className="lg:col-span-1">
                <h4 className="font-semibold text-white mb-3">How It Works</h4>
                <p className="text-surface-400 text-sm leading-relaxed">{model.desc}</p>

                <div className="mt-6">
                  <h4 className="font-semibold text-white mb-3">Role in PlateSense</h4>
                  <p className={`text-sm font-medium ${model.accentText}`}>{model.role}</p>
                </div>
              </div>

              {/* Right - Metrics */}
              <div className="lg:col-span-1">
                <h4 className="font-semibold text-white mb-3">Model Specs</h4>
                <div className="space-y-2">
                  {model.metrics.map((m) => (
                    <div key={m.k} className="flex items-center justify-between py-2 border-b border-surface-800 last:border-0">
                      <span className="text-surface-500 text-sm">{m.k}</span>
                      <span className="text-surface-200 text-sm font-mono">{m.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Integration explanation */}
      <div className="glass rounded-3xl p-10 border border-surface-700/50">
        <h2 className="font-heading font-bold text-3xl text-white mb-6 text-center">
          Why Three Models?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto mb-4">
              <Target size={22} />
            </div>
            <h3 className="font-semibold text-white mb-2">Specialisation</h3>
            <p className="text-surface-500 text-sm leading-relaxed">
              Each model is purpose-built for its task. Using a single model for detection + OCR + classification 
              would sacrifice accuracy in every area.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan mx-auto mb-4">
              <Zap size={22} />
            </div>
            <h3 className="font-semibold text-white mb-2">Pipeline Efficiency</h3>
            <p className="text-surface-500 text-sm leading-relaxed">
              Each stage feeds its output as structured input to the next. Cropping before OCR dramatically 
              reduces noise and improves text reading accuracy.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-center text-accent-violet mx-auto mb-4">
              <Brain size={22} />
            </div>
            <h3 className="font-semibold text-white mb-2">Modularity</h3>
            <p className="text-surface-500 text-sm leading-relaxed">
              Any stage can be upgraded independently. Swap YOLOv8n for YOLOv8l, or replace EasyOCR with 
              PaddleOCR — without changing the rest of the system.
            </p>
          </div>
        </div>
      </div>

      {/* Try it CTA */}
      <div className="text-center pb-8">
        <Link to="/scan" className="btn-brand inline-flex items-center gap-2 px-10 py-4 text-base">
          Try the Live Pipeline
          <ArrowRight size={18} />
        </Link>
      </div>

    </div>
  );
}
