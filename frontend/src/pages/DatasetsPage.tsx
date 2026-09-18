import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Table,
  Plus,
  Play,
  FlaskConical,
  BarChart3,
  FileText,
  Sparkles,
  FileCode,
  Layers
} from 'lucide-react';
import { datasetsApi, experimentsApi } from '../services/api';
import { Dataset, DatasetPreview, Experiment } from '../types';
import { Modal } from '../components/common/Modal';

export const DatasetsPage: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload Form State
  const [file, setFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');
  const [groundTruthCol, setGroundTruthCol] = useState('label');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Preview State
  const [previewData, setPreviewData] = useState<DatasetPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Quick Analysis Modal State
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [expName, setExpName] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [sampleSize, setSampleSize] = useState(25);
  const [analyzing, setAnalyzing] = useState(false);
  const [completedExperiment, setCompletedExperiment] = useState<Experiment | null>(null);

  const navigate = useNavigate();

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const data = await datasetsApi.list();
      setDatasets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a dataset file.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (customName) formData.append('name', customName);
      if (groundTruthCol) formData.append('ground_truth_column', groundTruthCol);

      await datasetsApi.upload(formData);
      setUploadModalOpen(false);
      setFile(null);
      setCustomName('');
      fetchDatasets();
    } catch (err: any) {
      alert('Upload failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleOpenPreview = async (id: number) => {
    setPreviewLoading(true);
    try {
      const prev = await datasetsApi.preview(id, 15);
      setPreviewData(prev);
    } catch (err) {
      alert('Failed to load dataset preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this dataset?')) return;
    try {
      await datasetsApi.delete(id);
      fetchDatasets();
    } catch (err) {
      alert('Failed to delete dataset.');
    }
  };

  const handleOpenAnalyzeModal = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setExpName(`${dataset.name} AI Triage Benchmark`);
    setCompletedExperiment(null);
    setAnalyzeModalOpen(true);
  };

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDataset) return;

    setAnalyzing(true);
    try {
      // 1. Create experiment
      const created = await experimentsApi.create({
        name: expName || `${selectedDataset.name} Benchmark`,
        dataset_id: selectedDataset.id,
        provider,
        model,
        sample_size: Number(sampleSize) || 25
      });

      // 2. Run analysis
      await experimentsApi.run(created.id);

      // 3. Fetch completed details
      const expDetails = await experimentsApi.get(created.id);
      setCompletedExperiment(expDetails);
    } catch (err: any) {
      alert('Analysis execution failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const getFormatBadge = (filename: string) => {
    const ext = filename.split('.').pop()?.toUpperCase() || 'DATA';
    switch (ext) {
      case 'CSV':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50';
      case 'XLSX':
      case 'XLS':
        return 'bg-green-950/60 text-green-300 border-green-700/50';
      case 'JSON':
      case 'JSONL':
        return 'bg-amber-950/60 text-amber-400 border-amber-700/50';
      case 'PARQUET':
        return 'bg-purple-950/60 text-purple-400 border-purple-700/50';
      default:
        return 'bg-cyan-950/60 text-cyberCyan border-cyan-700/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-xl font-bold font-mono-tech tracking-wide text-textPrimary uppercase flex items-center">
            <Database className="w-5 h-5 text-cyberRed mr-2" />
            Universal Dataset Repository &amp; AI Analysis Hub
          </h1>
          <p className="text-xs text-textMuted font-mono-tech mt-0.5">
            Ingest and analyze any dataset format (CSV, Excel, JSON, Parquet, TSV, System Logs) with autonomous LLM triage
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-3.5 py-1.5 bg-cyberRed hover:bg-red-600 text-white text-xs font-mono-tech font-bold uppercase rounded shadow-cyberRed flex items-center space-x-1.5 transition"
        >
          <UploadCloud className="w-4 h-4" />
          <span>UPLOAD DATASET / LOGS</span>
        </button>
      </div>

      {/* Format Info Banner */}
      <div className="p-3 bg-secondary/50 border border-border/70 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech">
        <div className="flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-cyberCyan" />
          <span className="text-textSecondary">Supported Formats:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['CSV (.csv)', 'Excel (.xlsx, .xls)', 'JSON / JSONL (.json, .jsonl)', 'Parquet (.parquet)', 'TSV / Logs (.tsv, .txt, .log)'].map((fmt) => (
            <span key={fmt} className="px-2 py-0.5 bg-card border border-border rounded text-[10px] text-textMuted font-mono-tech">
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Datasets Table */}
      <div className="cyber-card p-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <span className="text-xs font-bold uppercase text-textPrimary font-mono-tech flex items-center">
            <FileSpreadsheet className="w-4 h-4 text-cyberCyan mr-2" />
            Active Research Datasets ({datasets.length})
          </span>
          <button
            onClick={fetchDatasets}
            className="p-1.5 text-textMuted hover:text-textPrimary bg-secondary hover:bg-card border border-border rounded transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-tech">
            <thead className="bg-secondary text-textMuted uppercase border-b border-border">
              <tr>
                <th className="px-3 py-2.5">Dataset Name</th>
                <th className="px-3 py-2.5">Format</th>
                <th className="px-3 py-2.5">Filename</th>
                <th className="px-3 py-2.5">Records / Rows</th>
                <th className="px-3 py-2.5">Columns</th>
                <th className="px-3 py-2.5">Ground-Truth Label</th>
                <th className="px-3 py-2.5">Ingested Date</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-textMuted">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-cyberRed mb-2" />
                    Loading datasets...
                  </td>
                </tr>
              ) : datasets.length > 0 ? (
                datasets.map((ds) => (
                  <tr key={ds.id} className="hover:bg-cardHover transition">
                    <td className="px-3 py-3 text-textPrimary font-bold flex items-center">
                      <Table className="w-3.5 h-3.5 mr-2 text-cyberCyan" />
                      {ds.name}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getFormatBadge(ds.filename)}`}>
                        {ds.filename.split('.').pop()?.toUpperCase() || 'DATA'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-textSecondary">{ds.filename}</td>
                    <td className="px-3 py-3 text-textPrimary font-bold">{ds.row_count.toLocaleString()}</td>
                    <td className="px-3 py-3 text-textMuted">{ds.column_count}</td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 bg-cyberRed/10 border border-cyberRed/30 text-cyberRed rounded uppercase text-[10px] font-semibold">
                        {ds.ground_truth_column}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-textMuted whitespace-nowrap">
                      {ds.created_at ? ds.created_at.replace('T', ' ').substring(0, 16) : 'N/A'}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Direct Analyze Button */}
                        <button
                          onClick={() => handleOpenAnalyzeModal(ds)}
                          className="px-2.5 py-1 bg-cyberRed/90 hover:bg-cyberRed text-white rounded text-[11px] font-bold uppercase transition flex items-center space-x-1 shadow-sm"
                          title="Run AI Triage & Analysis on this Dataset"
                        >
                          <Play className="w-3 h-3" />
                          <span>ANALYZE</span>
                        </button>

                        <button
                          onClick={() => handleOpenPreview(ds.id)}
                          className="px-2.5 py-1 bg-secondary hover:bg-card border border-border text-textSecondary hover:text-textPrimary rounded text-[11px] uppercase transition flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>PREVIEW</span>
                        </button>

                        <button
                          onClick={() => handleDelete(ds.id)}
                          className="p-1.5 bg-secondary hover:bg-red-950/40 text-textMuted hover:text-cyberRed border border-border rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-textMuted">
                    No datasets found. Upload a dataset file (CSV, Excel, JSON, Parquet, or Logs) to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Dataset Modal */}
      {uploadModalOpen && (
        <Modal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          title="UPLOAD DATASET / SECURITY TELEMETRY"
          maxWidth="md"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-mono-tech">
            <div>
              <label className="text-textMuted uppercase block mb-1.5">
                Dataset / Corpora Name
              </label>
              <input
                type="text"
                placeholder="e.g. CIC-IDS-2017 Intrusion Benchmark"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-secondary border border-border rounded p-2 text-textPrimary outline-none focus:border-cyberRed"
              />
            </div>

            <div>
              <label className="text-textMuted uppercase block mb-1.5">
                Ground-Truth Label Column (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. label, attack, class, or category (auto-detected if empty)"
                value={groundTruthCol}
                onChange={(e) => setGroundTruthCol(e.target.value)}
                className="w-full bg-secondary border border-border rounded p-2 text-textPrimary outline-none focus:border-cyberRed"
              />
              <span className="text-[10px] text-textMuted mt-1 block">
                Leave blank or 'label' to let the system automatically detect attack vs benign column.
              </span>
            </div>

            <div>
              <label className="text-textMuted uppercase block mb-1.5">
                Select Dataset File (CSV, Excel, JSON, Parquet, TSV, TXT, LOG)
              </label>
              <input
                type="file"
                accept=".csv, .xlsx, .xls, .json, .jsonl, .parquet, .tsv, .txt, .log, .dat"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-secondary border border-border rounded p-2 text-textPrimary text-xs file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-cyberRed file:text-white"
              />
              <span className="text-[10px] text-textMuted mt-1 block">
                Supports: .csv, .xlsx, .xls, .json, .jsonl, .parquet, .tsv, .txt, .log
              </span>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 bg-secondary hover:bg-card border border-border text-textSecondary rounded uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-cyberRed hover:bg-red-600 text-white font-bold rounded shadow-cyberRed uppercase disabled:opacity-50 flex items-center space-x-1.5"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>PARSING &amp; REGISTERING...</span>
                  </>
                ) : (
                  <span>UPLOAD &amp; REGISTER</span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Dataset Preview Modal */}
      {previewData && (
        <Modal
          isOpen={!!previewData}
          onClose={() => setPreviewData(null)}
          title={`DATASET PREVIEW // ${previewData.name} (${previewData.row_count} records)`}
          maxWidth="4xl"
        >
          <div className="space-y-4 text-xs font-mono-tech">
            <div className="flex items-center justify-between bg-secondary p-3 rounded border border-border">
              <div>
                <span className="text-textMuted block text-[10px] uppercase">Filename</span>
                <span className="text-textPrimary font-bold">{previewData.filename}</span>
              </div>
              <div>
                <span className="text-textMuted block text-[10px] uppercase">Ground-Truth Label Col</span>
                <span className="text-cyberRed font-bold uppercase">{previewData.ground_truth_column}</span>
              </div>
              <div>
                <span className="text-textMuted block text-[10px] uppercase">Total Columns</span>
                <span className="text-cyberCyan font-bold">{previewData.column_count}</span>
              </div>
            </div>

            <div className="overflow-x-auto border border-border rounded max-h-96">
              <table className="w-full text-left text-[11px] font-mono-tech divide-y divide-border">
                <thead className="bg-secondary text-textMuted uppercase sticky top-0">
                  <tr>
                    {previewData.columns.map((col) => (
                      <th
                        key={col}
                        className={`px-3 py-2 whitespace-nowrap ${
                          col === previewData.ground_truth_column ? 'text-cyberRed font-bold bg-cyberRed/10' : ''
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-card">
                  {previewData.sample_rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-cardHover transition">
                      {previewData.columns.map((col) => (
                        <td
                          key={col}
                          className={`px-3 py-2 truncate max-w-xs whitespace-nowrap ${
                            col === previewData.ground_truth_column ? 'text-cyberRed font-bold' : 'text-textSecondary'
                          }`}
                        >
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              {datasets.find(d => d.id === previewData.id) && (
                <button
                  onClick={() => {
                    const ds = datasets.find(d => d.id === previewData.id);
                    if (ds) {
                      setPreviewData(null);
                      handleOpenAnalyzeModal(ds);
                    }
                  }}
                  className="px-4 py-1.5 bg-cyberRed hover:bg-red-600 text-white font-bold rounded uppercase flex items-center space-x-1.5 shadow-cyberRed"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Analyze This Dataset</span>
                </button>
              )}
              <button
                onClick={() => setPreviewData(null)}
                className="px-4 py-1.5 bg-secondary hover:bg-card border border-border text-textPrimary rounded uppercase ml-auto"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Quick Analyze / Experiment Launch Modal */}
      {analyzeModalOpen && selectedDataset && (
        <Modal
          isOpen={analyzeModalOpen}
          onClose={() => {
            if (!analyzing) {
              setAnalyzeModalOpen(false);
              setCompletedExperiment(null);
            }
          }}
          title={`ANALYZE DATASET // ${selectedDataset.name}`}
          maxWidth="lg"
        >
          {completedExperiment ? (
            <div className="space-y-5 text-xs font-mono-tech py-2">
              <div className="p-4 bg-emerald-950/40 border border-emerald-700/50 rounded-lg text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white uppercase">AI Analysis Successfully Completed!</h3>
                <p className="text-textSecondary text-xs">
                  Evaluated {completedExperiment.sample_size} records using {completedExperiment.provider} ({completedExperiment.model}).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => navigate(`/metrics?experiment_id=${completedExperiment.id}`)}
                  className="p-3 bg-secondary hover:bg-card border border-border rounded text-center text-textPrimary hover:border-cyberCyan transition group"
                >
                  <BarChart3 className="w-5 h-5 text-cyberCyan mx-auto mb-1.5 group-hover:scale-110 transition" />
                  <span className="font-bold block uppercase">View Research Metrics</span>
                  <span className="text-[10px] text-textMuted">Precision, Recall, FPR &amp; Charts</span>
                </button>

                <button
                  onClick={() => navigate(`/reports?experiment_id=${completedExperiment.id}`)}
                  className="p-3 bg-secondary hover:bg-card border border-border rounded text-center text-textPrimary hover:border-cyberRed transition group"
                >
                  <FileText className="w-5 h-5 text-cyberRed mx-auto mb-1.5 group-hover:scale-110 transition" />
                  <span className="font-bold block uppercase">View &amp; Export PDF Report</span>
                  <span className="text-[10px] text-textMuted">Download Official Scientific PDF</span>
                </button>
              </div>

              <div className="flex justify-end pt-3 border-t border-border">
                <button
                  onClick={() => {
                    setAnalyzeModalOpen(false);
                    setCompletedExperiment(null);
                  }}
                  className="px-4 py-2 bg-secondary hover:bg-card border border-border text-textPrimary rounded uppercase"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleStartAnalysis} className="space-y-4 text-xs font-mono-tech">
              {/* Selected dataset info bar */}
              <div className="p-3 bg-secondary rounded border border-border grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-textMuted uppercase block">Target Dataset</span>
                  <span className="font-bold text-textPrimary truncate block">{selectedDataset.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-textMuted uppercase block">Total Records</span>
                  <span className="font-bold text-cyberCyan">{selectedDataset.row_count.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-textMuted uppercase block">Ground Truth Column</span>
                  <span className="font-bold text-cyberRed uppercase">{selectedDataset.ground_truth_column}</span>
                </div>
              </div>

              <div>
                <label className="text-textMuted uppercase block mb-1">Experiment / Evaluation Name</label>
                <input
                  type="text"
                  required
                  value={expName}
                  onChange={(e) => setExpName(e.target.value)}
                  className="w-full bg-secondary border border-border rounded p-2 text-textPrimary outline-none focus:border-cyberRed"
                />
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
                  onChange={(e) => setSampleSize(parseInt(e.target.value) || 25)}
                  className="w-full bg-secondary border border-border rounded p-2 text-textPrimary outline-none focus:border-cyberRed"
                />
                <span className="text-[10px] text-textMuted mt-1 block">
                  Select how many telemetry rows to triage with the AI model. Recommended: 20-50 for high-speed analysis.
                </span>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <button
                  type="button"
                  disabled={analyzing}
                  onClick={() => setAnalyzeModalOpen(false)}
                  className="px-4 py-2 bg-secondary hover:bg-card border border-border text-textSecondary rounded uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={analyzing}
                  className="px-4 py-2 bg-cyberRed hover:bg-red-600 text-white font-bold rounded shadow-cyberRed uppercase disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>ANALYZING WITH {provider.toUpperCase()}...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>RUN AI ANALYSIS</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
