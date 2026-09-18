import React, { useState } from 'react';
import { ShieldCheck, Info, Sparkles, Terminal } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  breakdown?: {
    precision_factor: number;
    fp_reduction_factor: number;
    confidence_factor: number;
    coverage_factor: number;
    formula_explanation: string;
  };
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, breakdown }) => {
  const [showModal, setShowModal] = useState(false);

  // Dynamic stroke color based on score
  const getColor = () => {
    if (score >= 85) return '#00E676'; // stock green
    if (score >= 70) return '#00E5FF'; // cyan
    if (score >= 50) return '#FF9900'; // terminal amber
    return '#FF5252'; // stock red
  };

  const color = getColor();
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="terminal-card flex flex-col justify-between font-mono overflow-hidden">
      {/* Bloomberg Window Header Strip */}
      <div className="px-3 py-1.5 bg-[#120a00] border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-black text-terminalAmber bg-black px-1.5 py-0.2 border border-border">
            [01]
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-terminalAmber flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-terminalAmber" />
            AI TRIAGE INDEX &amp; FIDELITY SCORE
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowModal(true)}
            title="Inspect Calculation Formula"
            className="text-[10px] text-terminalAmber hover:text-black hover:bg-terminalAmber px-1.5 py-0.5 border border-border transition flex items-center font-bold"
          >
            <Info className="w-3 h-3 mr-1" />
            [FORMULA]
          </button>
          <div className="flex items-center space-x-0.5 opacity-60">
            <span className="w-2.5 h-2.5 flex items-center justify-center text-[8px] bg-black border border-border text-textMuted">_</span>
            <span className="w-2.5 h-2.5 flex items-center justify-center text-[8px] bg-black border border-border text-textMuted">□</span>
          </div>
        </div>
      </div>

      {/* Main Gauge & Metrics Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Circular Gauge */}
        <div className="flex items-center justify-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#1a1100"
                strokeWidth="9"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={color}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black font-mono tracking-tight" style={{ color }}>
                {score}%
              </span>
              <span className="text-[9px] text-textMuted uppercase font-bold tracking-widest">
                {score >= 85 ? '[OPTIMAL]' : score >= 70 ? '[STRONG]' : '[MODERATE]'}
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown Breakdown Table */}
        <div className="space-y-1.5 text-[11px] font-mono border-l md:border-border md:pl-4">
          <div className="flex items-center justify-between pb-1 border-b border-border/40 text-[10px] text-textMuted font-bold uppercase">
            <span>PARAMETER</span>
            <span>WEIGHT / VAL</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-textSecondary">PRECISION (40%):</span>
            <span className="text-stockGreen font-bold">{breakdown?.precision_factor ?? '38.1'}/40</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-textSecondary">FP REDUCTION (30%):</span>
            <span className="text-stockGreen font-bold">{breakdown?.fp_reduction_factor ?? '28.3'}/30</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-textSecondary">AI CONFIDENCE (20%):</span>
            <span className="text-terminalAmber font-bold">{breakdown?.confidence_factor ?? '18.8'}/20</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-textSecondary">COVERAGE (10%):</span>
            <span className="text-white font-bold">{breakdown?.coverage_factor ?? '10.0'}/10</span>
          </div>
        </div>
      </div>

      <div className="px-3 py-1 bg-[#040404] border-t border-border text-[10px] text-textMuted flex items-center justify-between font-mono">
        <span className="flex items-center text-terminalAmber">
          <Sparkles className="w-3 h-3 mr-1" />
          REAL-TIME TELEMETRY WEIGHTED COMPOSITE
        </span>
        <span className="text-textMuted">SAMPLING: CONTINUOUS</span>
      </div>

      {/* Explanation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 font-mono">
          <div className="terminal-card p-5 max-w-lg w-full border-2 border-terminalAmber relative bg-[#0a0a0a]">
            <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
              <h3 className="text-xs font-black text-terminalAmber uppercase flex items-center">
                <ShieldCheck className="w-4 h-4 text-terminalAmber mr-1.5" />
                AI ALERT ANALYSIS SCORE FORMULA
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-xs text-textMuted hover:text-white px-1.5 py-0.5 border border-border hover:border-stockRed"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-textSecondary mb-3 leading-relaxed">
              The AI Alert Analysis Score reflects operational reliability and false-positive suppression capacity for the SOC triage pipeline:
            </p>

            <div className="bg-black p-2.5 border border-terminalAmber text-xs font-mono text-terminalAmber font-bold mb-3 select-all">
              SCORE = (Precision × 40%) + ((1 - FPR) × 30%) + (Mean AI Conf × 20%) + (Coverage × 10%)
            </div>

            <ul className="text-[11px] text-textSecondary space-y-1.5 mb-4">
              <li><strong className="text-terminalAmber">[PRECISION 40%]</strong>: Guarantees prioritized alerts represent authentic security events.</li>
              <li><strong className="text-stockGreen">[FP SUPPRESSION 30%]</strong>: Directly counters alert fatigue by suppressing non-malicious noise.</li>
              <li><strong className="text-stockGreen">[CONFIDENCE 20%]</strong>: Mean certainty of LLM structured assessments.</li>
              <li><strong className="text-white">[COVERAGE 10%]</strong>: Percentage of raw IDS alerts analyzed by the AI pipeline.</li>
            </ul>

            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-terminalAmber text-black text-xs font-bold uppercase hover:bg-white transition"
              >
                DISMISS [ESC]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
