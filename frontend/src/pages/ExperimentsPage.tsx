import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Play,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BarChart3,
  Trash2,
  Eye,
  Sliders,
  Layers
} from 'lucide-react';
import { experimentsApi, datasetsApi } from '../services/api';
import { Experiment, Dataset, ExperimentResult } from '../types';
import { Modal } from '../components/common/Modal';

export const ExperimentsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningId, setRunningId] = useState<number | null>(null);

  // New Experiment Form
  const [newExpModal, setNewExpModal] = useState(false);
  const [expName, setExpName] = useState('');
  const [selectedDatasetId, setSelectedDatasetId] = useState<number>(0);
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [sampleSize, setSampleSize] = useState(20);

  // Results Inspector Modal
  const [selectedExp, setSelectedExp] = useState<Experiment | null>(null);
  const [results, setResults] = useState<ExperimentResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [expList, dsList] = await Promise.all([
        experimentsApi.list(),
        datasetsApi.list()
      ]);
      setExperiments(expList);
      setDatasets(dsList);
      if (dsList.length > 0 && !selectedDatasetId) {
        setSelectedDatasetId(dsList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDatasetId) {
      alert('Please select a dataset.');
      return;
    }

    try {
      const created = await experimentsApi.create({
        name: expName || `Experiment-${new Date().toISOString().substring(0, 16)}`,
        dataset_id: selectedDatasetId,
        provider,
        model,
        sample_size: Number(sampleSize) || 20
      });
      setNewExpModal(false);
      setExpName('');
      loadData();
      // Auto-run if desired
      handleRunExperiment(created.id);
    } catch (err: any) {
      alert('Failed to create experiment: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleRunExperiment = async (id: number) => {
    setRunningId(id);
    try {
      await experimentsApi.run(id);
      await loadData();
    } catch (err: any) {
      alert('Experiment execution failed: ' + (err.response?.data?.detail || err.message));
      await loadData();
    } finally {
      setRunningId(null);
    }
  };

  const handleInspectResults = async (exp: Experiment) => {
    setSelectedExp(exp);
    setResultsLoading(true);
    try {
      const res = await experimentsApi.getResults(exp.id, 100);
      setResults(res);
    } catch (err) {
      alert('Failed to load experiment predictions.');
    } finally {
      setResultsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this experiment and its evaluated metrics?')) return;
    try {
      await experimentsApi.delete(id);
      loadData();
    } catch (err) {
      alert('Failed to delete experiment.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-emerald-950/70 text-emerald-400 border-emerald-700/50';
      case 'RUNNING':
        return 'bg-cyberRed/20 text-cyberRed border-cyberRed/50 animate-pulse-slow';
      case 'FAILED':
        return 'bg-red-950/80 text-red-400 border-red-800';
      default:
        return 'bg-zinc-900 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-xl font-bold font-mono-tech tracking-wide text-textPrimary uppercase flex items-center">
            <FlaskConical className="w-5 h-5 text-cyberRed mr-2" />
            LLM IDS Evaluation Experiments
          </h1>
          <p className="text-xs text-textMuted font-mono-tech mt-0.5">
            Conduct reproducible benchmarks comparing LLM alert triage against ground-truth intrusion telemetry
          </p>
        </div>

        <button
          onClick={() => setNewExpModal(true)}
          className="px-4 py-1.5 bg-cyberRed hover:bg-red-600 text-white text-xs font-mono-tech font-bold uppercase rounded shadow-cyberRed flex items-center space-x-1.5 transition"
        >
          <Play className="w-3.5 h-3.5" />
          <span>LAUNCH NEW EXPERIMENT</span>
        </button>
      </div>

      {/* Experiments History Table */}
      <div className="cyber-card p-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <span className="text-xs font-bold uppercase text-textPrimary font-mono-tech flex items-center">
            <Layers className="w-4 h-4 text-cyberCyan mr-2" />
            Research Experiment Registry ({experiments.length})
          </span>
          <button
            onClick={loadData}
            className="p-1.5 text-textMuted hover:text-textPrimary bg-secondary hover:bg-card border border-border rounded transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-tech">
            <thead className="bg-secondary text-textMuted uppercase border-b border-border">
              <tr>
                <th className="px-3 py-2.5">Experiment Name</th>
                <th className="px-3 py-2.5">Dataset</th>
                <th className="px-3 py-2.5">Provider / Model</th>
                <th className="px-3 py-2.5">Sample Size</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Completed At</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-textMuted">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-cyberRed mb-2" />
                    Loading experiments...
                  </td>
                </tr>
              ) : experiments.length > 0 ? (
                experiments.map((exp) => (
                  <tr key={exp.id} className="hover:bg-cardHover transition">
                    <td className="px-3 py-3 font-bold text-textPrimary">{exp.name}</td>
                    <td className="px-3 py-3 text-cyberCyan">{exp.dataset?.name || `Dataset #${exp.dataset_id}`}</td>
                    <td className="px-3 py-3 text-textSecondary">
                      <span className="text-cyberRed font-semibold">{exp.provider}</span> / {exp.model}
                    </td>
                    <td className="px-3 py-3 text-textPrimary font-mono-tech">{exp.sample_size} records</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(exp.status)}`}>
                        {runningId === exp.id ? 'RUNNING...' : exp.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-textMuted whitespace-nowrap">
                      {exp.completed_at ? exp.completed_at.replace('T', ' ').substring(0, 16) : '-'}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {exp.status === 'COMPLETED' ? (
                          <>
                            <button
                              onClick={() => navigate(`/metrics?experiment_id=${exp.id}`)}
                              title="View Research Metrics"
                              className="px-2 py-1 bg-secondary hover:bg-card border border-border text-cyberGreen rounded text-[10px] font-bold uppercase flex items-center space-x-1"
                            >
                              <BarChart3 className="w-3 h-3" />
                              <span>METRICS</span>
                            </button>
                            <button
                              onClick={() => navigate(`/reports?experiment_id=${exp.id}`)}
                              title="View Report"
                              className="px-2 py-1 bg-secondary hover:bg-card border border-border text-cyberCyan rounded text-[10px] font-bold uppercase flex items-center space-x-1"
                            >
                              <FileText className="w-3 h-3" />
                              <span>REPORT</span>
                            </button>
                            <button
                              onClick={() => handleInspectResults(exp)}
                              title="Inspect Record Predictions"
                              className="p-1.5 bg-secondary hover:bg-card border border-border text-textSecondary hover:text-textPrimary rounded"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRunExperiment(exp.id)}
                            disabled={runningId === exp.id}
                            className="px-2.5 py-1 bg-cyberRed hover:bg-red-600 text-white rounded text-[10px] font-bold uppercase disabled:opacity-50 flex items-center space-x-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>RUN</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1.5 bg-secondary hover:bg-red-950/40 text-textMuted hover:text-cyberRed border border-border rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-textMuted">
                    No experiments created yet. Click "Launch New Experiment" above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Launch Experiment Wizard Modal */}
      {newExpModal && (
        <Modal
          isOpen={newExpModal}
          onClose={() => setNewExpModal(false)}
          title="LAUNCH REPRODUCIBLE RESEARCH EXPERIMENT"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateExperiment} className="space-y-4 text-xs font-mono-tech">
            <div>
              <label className="text-textMuted uppercase block mb-1">Experiment Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Gemini 2.5 Flash vs CIC-IDS Baseline"
                value={expName}
                onChange={(e) => setExpName(e.target.value)}
                className="w-full bg-secondary border border-border rounded p-2 text-textPrimary outline-none focus:border-cyberRed"
              />
            </div>

            <div>
              <label className="text-textMuted uppercase block mb-1">Select Benchmark Dataset</label>
              <select
                value={selectedDatasetId}
                onChange={(e) => setSelectedDatasetId(parseInt(e.target.value))}
                className="w-full bg-secondary border border-border rounded p-2 text-textPrimary outline-none focus:border-cyberRed"
              >
                {datasets.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name} ({ds.row_count} records, Ground Truth: {ds.ground_truth_column})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-textMuted uppercase block mb-1">LLM Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-secondary border border-border rounded p-2 text-textPrimary outline-none focus:border-cyberRed"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="heuristic">Research Heuristic Engine</option>
                </select>
              </div>

              <div>
                <label className="text-textMuted uppercase block mb-1">Model Architecture</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-secondary border border-border rounded p-2 text-textPrimary outline-none focus:border-cyberRed"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                  <option value="gpt-4o">gpt-4o</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-textMuted uppercase block mb-1">
                Sample Size (Records to Evaluate)
              </label>
              <input
                type="number"
                min={5}
                max={200}
                value={sampleSize}
                onChange={(e) => setSampleSize(parseInt(e.target.value) || 20)}
                className="w-full bg-secondary border border-border rounded p-2 text-textPrimary outline-none focus:border-cyberRed"
              />
              <span className="text-[10px] text-textMuted mt-1 block">
                Higher sample sizes yield stronger statistical significance. Recommended: 20-50 for fast triage.
              </span>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setNewExpModal(false)}
                className="px-4 py-2 bg-secondary hover:bg-card border border-border text-textSecondary rounded uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyberRed hover:bg-red-600 text-white font-bold rounded shadow-cyberRed uppercase flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Initialize & Run Experiment</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Record Predictions Drawer / Modal */}
      {selectedExp && (
        <Modal
          isOpen={!!selectedExp}
          onClose={() => setSelectedExp(null)}
          title={`EXPERIMENT EVALUATIONS // ${selectedExp.name}`}
          maxWidth="4xl"
        >
          <div className="space-y-4 text-xs font-mono-tech">
            <div className="flex items-center justify-between bg-secondary p-3 rounded border border-border">
              <div>
                <span className="text-textMuted block text-[10px] uppercase">Evaluated Records</span>
                <span className="text-textPrimary font-bold">{results.length} samples</span>
              </div>
              <div>
                <span className="text-textMuted block text-[10px] uppercase">Model</span>
                <span className="text-cyberCyan font-bold">{selectedExp.model}</span>
              </div>
              <button
                onClick={() => navigate(`/metrics?experiment_id=${selectedExp.id}`)}
                className="px-3 py-1.5 bg-cyberGreen hover:bg-green-600 text-black font-bold uppercase rounded"
              >
                Go to Metrics Dashboard
              </button>
            </div>

            <div className="overflow-x-auto border border-border rounded max-h-96">
              <table className="w-full text-left text-[11px] font-mono-tech divide-y divide-border">
                <thead className="bg-secondary text-textMuted uppercase sticky top-0">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Ground Truth</th>
                    <th className="px-3 py-2">LLM Prediction</th>
                    <th className="px-3 py-2">Match</th>
                    <th className="px-3 py-2">Confidence</th>
                    <th className="px-3 py-2">Severity</th>
                    <th className="px-3 py-2">Priority</th>
                    <th className="px-3 py-2">FP Likelihood</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-card">
                  {resultsLoading ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-6 text-center text-textMuted">
                        Loading record predictions...
                      </td>
                    </tr>
                  ) : results.map((r) => (
                    <tr key={r.id} className="hover:bg-cardHover">
                      <td className="px-3 py-2 text-textMuted">#{r.record_id}</td>
                      <td className="px-3 py-2 font-bold uppercase text-textPrimary">{r.ground_truth}</td>
                      <td className="px-3 py-2 font-bold uppercase text-cyberCyan">{r.prediction}</td>
                      <td className="px-3 py-2">
                        {r.is_correct ? (
                          <span className="text-cyberGreen font-bold">MATCH [✓]</span>
                        ) : (
                          <span className="text-cyberRed font-bold">MISMATCH [X]</span>
                        )}
                      </td>
                      <td className="px-3 py-2">{Math.round(r.confidence * 100)}%</td>
                      <td className="px-3 py-2">{r.severity}</td>
                      <td className="px-3 py-2 font-bold text-cyberRed">{r.priority}</td>
                      <td className="px-3 py-2">{Math.round(r.fp_likelihood * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedExp(null)}
                className="px-4 py-1.5 bg-secondary hover:bg-card border border-border text-textPrimary rounded uppercase"
              >
                Close View
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
