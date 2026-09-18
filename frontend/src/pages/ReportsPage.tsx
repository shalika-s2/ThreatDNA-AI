import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Download,
  Printer,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { reportsApi, experimentsApi } from '../services/api';
import { Experiment, ExperimentReport } from '../types';

export const ReportsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<number | null>(null);
  const [report, setReport] = useState<ExperimentReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await experimentsApi.list();
        const completed = data.filter((e) => e.status === 'COMPLETED');
        setExperiments(completed);

        const paramId = searchParams.get('experiment_id');
        if (paramId && completed.some((e) => e.id === parseInt(paramId))) {
          setSelectedExpId(parseInt(paramId));
        } else if (completed.length > 0) {
          setSelectedExpId(completed[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedExpId) {
      setSearchParams({ experiment_id: selectedExpId.toString() });
      fetchReport(selectedExpId);
    }
  }, [selectedExpId]);

  const fetchReport = async (id: number) => {
    setLoading(true);
    try {
      const data = await reportsApi.getReport(id);
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!selectedExpId) return;
    window.open(reportsApi.getExportUrl(selectedExpId), '_blank');
  };

  const handleExportPdf = () => {
    if (!selectedExpId) return;
    window.open(reportsApi.getPdfExportUrl(selectedExpId), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-xl font-bold font-mono-tech tracking-wide text-textPrimary uppercase flex items-center">
            <FileText className="w-5 h-5 text-cyberRed mr-2" />
            Executive &amp; Research Evaluation Reports
          </h1>
          <p className="text-xs text-textMuted font-mono-tech mt-0.5">
            Structured scientific assessment reports for academic publication and SOC architecture reviews
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {experiments.length > 0 && (
            <select
              value={selectedExpId || ''}
              onChange={(e) => setSelectedExpId(parseInt(e.target.value))}
              className="bg-secondary border border-border text-xs font-mono-tech text-textPrimary rounded px-3 py-1.5 outline-none focus:border-cyberRed"
            >
              {experiments.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  #{exp.id} - {exp.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleExportCsv}
            disabled={!report}
            className="px-3 py-1.5 bg-secondary hover:bg-card border border-border text-textPrimary text-xs font-mono-tech rounded flex items-center space-x-1.5 transition disabled:opacity-50"
            title="Download Raw Predictions CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyberCyan" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={!report}
            className="px-3.5 py-1.5 bg-cyberRed hover:bg-red-600 text-white text-xs font-mono-tech font-bold uppercase rounded shadow-cyberRed flex items-center space-x-1.5 transition disabled:opacity-50"
            title="Download Official Publication PDF Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT PDF</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!report}
            className="p-1.5 bg-secondary hover:bg-card border border-border text-textSecondary hover:text-textPrimary rounded transition disabled:opacity-50"
            title="Print or Browser PDF Save"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-cyberRed animate-spin" />
        </div>
      ) : report ? (
        <div className="cyber-card p-8 bg-card space-y-6 font-mono-tech print:bg-white print:text-black print:p-0 print:border-0">
          {/* Report Title & Metadata Header */}
          <div className="border-b border-border pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-cyberRed/10 border border-cyberRed/30 rounded-lg text-cyberRed">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-cyberRed uppercase tracking-widest block font-bold">
                    Academic Research Evaluation Report
                  </span>
                  <h2 className="text-lg font-bold text-textPrimary uppercase">
                    ThreatDNA-AI // {report.experiment_name}
                  </h2>
                </div>
              </div>
              <div className="text-right text-xs text-textMuted">
                <div>Experiment ID: #{report.experiment_id}</div>
                <div>Generated: {new Date().toISOString().substring(0, 19)} UTC</div>
              </div>
            </div>

            {/* Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-secondary p-3.5 rounded border border-border mt-4 text-xs">
              <div>
                <span className="text-textMuted block text-[10px] uppercase">Benchmark Dataset</span>
                <span className="text-cyberCyan font-bold">{report.dataset_name}</span>
              </div>
              <div>
                <span className="text-textMuted block text-[10px] uppercase">LLM Provider &amp; Model</span>
                <span className="text-textPrimary font-bold">{report.provider} / {report.model}</span>
              </div>
              <div>
                <span className="text-textMuted block text-[10px] uppercase">Evaluated Samples</span>
                <span className="text-textPrimary font-bold">{report.sample_size} IDS Alerts</span>
              </div>
              <div>
                <span className="text-textMuted block text-[10px] uppercase">Execution Status</span>
                <span className="text-cyberGreen font-bold uppercase">{report.status}</span>
              </div>
            </div>
          </div>

          {/* Quantitative Metrics Summary */}
          {report.metrics && (
            <div>
              <h3 className="text-xs font-bold uppercase text-textPrimary mb-3 flex items-center">
                <Sparkles className="w-4 h-4 text-cyberAmber mr-2" />
                1. Quantitative Academic Performance Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3.5 bg-secondary rounded border border-border">
                  <span className="text-textMuted block text-[10px] uppercase">Precision</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {(report.metrics.precision_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3.5 bg-secondary rounded border border-border">
                  <span className="text-textMuted block text-[10px] uppercase">Recall (Detection)</span>
                  <span className="text-xl font-bold text-cyan-400">
                    {(report.metrics.recall_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3.5 bg-secondary rounded border border-border">
                  <span className="text-textMuted block text-[10px] uppercase">F1 Score</span>
                  <span className="text-xl font-bold text-amber-400">
                    {(report.metrics.f1_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3.5 bg-secondary rounded border border-border">
                  <span className="text-textMuted block text-[10px] uppercase">False Positive Rate</span>
                  <span className="text-xl font-bold text-cyberRed">
                    {(report.metrics.false_positive_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3.5 bg-secondary rounded border border-border">
                  <span className="text-textMuted block text-[10px] uppercase">Accuracy</span>
                  <span className="text-xl font-bold text-textPrimary">
                    {(report.metrics.accuracy_score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Confusion Matrix Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase text-textPrimary mb-3 flex items-center">
              <Scale className="w-4 h-4 text-cyberCyan mr-2" />
              2. Empirical Confusion Matrix Distribution
            </h3>
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-emerald-950/30 border border-emerald-700/40 rounded">
                <span className="text-[10px] text-emerald-400 block uppercase">True Positives (TP)</span>
                <span className="text-2xl font-bold text-emerald-400">{report.confusion_matrix.TP}</span>
              </div>
              <div className="p-3 bg-cyan-950/30 border border-cyan-700/40 rounded">
                <span className="text-[10px] text-cyan-400 block uppercase">True Negatives (TN)</span>
                <span className="text-2xl font-bold text-cyan-400">{report.confusion_matrix.TN}</span>
              </div>
              <div className="p-3 bg-red-950/30 border border-red-700/40 rounded">
                <span className="text-[10px] text-red-400 block uppercase">False Positives (FP)</span>
                <span className="text-2xl font-bold text-red-400">{report.confusion_matrix.FP}</span>
              </div>
              <div className="p-3 bg-amber-950/30 border border-amber-700/40 rounded">
                <span className="text-[10px] text-amber-400 block uppercase">False Negatives (FN)</span>
                <span className="text-2xl font-bold text-amber-400">{report.confusion_matrix.FN}</span>
              </div>
            </div>
          </div>

          {/* Comparative Baseline Assessment */}
          {report.comparisons.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase text-textPrimary mb-3 flex items-center">
                <Layers className="w-4 h-4 text-cyberRed mr-2" />
                3. Comparative Analysis against Traditional Rule-Based IDS
              </h3>
              <div className="overflow-x-auto border border-border rounded">
                <table className="w-full text-left text-xs divide-y divide-border">
                  <thead className="bg-secondary text-textMuted uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Evaluation Dimension</th>
                      <th className="px-4 py-2.5 text-right">Traditional IDS</th>
                      <th className="px-4 py-2.5 text-right text-cyberCyan">ThreatDNA-AI LLM</th>
                      <th className="px-4 py-2.5 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-card">
                    {report.comparisons.map((c, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2.5 font-medium text-textPrimary">{c.metric_name}</td>
                        <td className="px-4 py-2.5 text-right text-textMuted">{c.traditional_value}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-cyberCyan">{c.llm_value}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-cyberGreen">{c.difference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Key Findings & Academic Observations */}
          <div>
            <h3 className="text-xs font-bold uppercase text-textPrimary mb-3 flex items-center">
              <CheckCircle2 className="w-4 h-4 text-cyberGreen mr-2" />
              4. Key Research Findings &amp; Observations
            </h3>
            <ul className="space-y-2 text-xs text-textSecondary bg-secondary p-4 rounded border border-border">
              {report.key_findings.map((f, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-cyberGreen font-bold flex-shrink-0">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Research Integrity & Ethical Statement */}
          <div className="p-4 bg-secondary/50 rounded border border-border text-[11px] text-textMuted space-y-1">
            <span className="font-bold uppercase text-textPrimary block">Research Integrity Notice</span>
            <p>
              This evaluation was conducted objectively by comparing LLM predictions against ground-truth labels.
              All sample records, model parameters, and raw inference responses are logged for academic reproducibility.
            </p>
          </div>
        </div>
      ) : (
        <div className="cyber-card p-12 text-center text-textMuted font-mono-tech">
          No completed experiments available to generate report.
        </div>
      )}
    </div>
  );
};
