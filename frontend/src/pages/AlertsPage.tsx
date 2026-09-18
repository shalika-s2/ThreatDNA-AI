import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Plus,
  Trash2,
  Cpu,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Radio
} from 'lucide-react';
import { alertsApi } from '../services/api';
import { Alert } from '../types';
import { SeverityBadge, PriorityBadge, StatusBadge } from '../components/common/Badges';
import { Modal } from '../components/common/Modal';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [attackTypeFilter, setAttackTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals & Drawers
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);

  // Form State for New Alert
  const [newAlert, setNewAlert] = useState({
    source_ip: '192.168.1.50',
    destination_ip: '10.0.0.12',
    source_port: 49152,
    destination_port: 80,
    protocol: 'TCP',
    attack_type: 'Brute Force',
    signature: 'ET SCAN Potential Authentication Brute Force detected',
    raw_log: 'SYNTHETIC DEMO DATA: Multiple failed login attempts (15/min) targeting administrative portal',
    severity: 'HIGH',
    status: 'NEW',
  });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await alertsApi.list({
        page,
        page_size: pageSize,
        search: search || undefined,
        severity: severityFilter || undefined,
        status: statusFilter || undefined,
        attack_type: attackTypeFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setAlerts(data.alerts);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [page, severityFilter, statusFilter, attackTypeFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAlerts();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await alertsApi.create(newAlert as any);
      setIsCreateOpen(false);
      fetchAlerts();
    } catch (err) {
      alert('Failed to create alert.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;
    try {
      await alertsApi.delete(id);
      if (selectedAlert?.id === id) setSelectedAlert(null);
      fetchAlerts();
    } catch (err) {
      alert('Failed to delete alert.');
    }
  };

  const handleQuickAnalyze = async (alertId: number) => {
    setAnalyzingId(alertId);
    try {
      await alertsApi.analyze(alertId);
      await fetchAlerts();
      if (selectedAlert?.id === alertId) {
        const updated = await alertsApi.get(alertId);
        setSelectedAlert(updated);
      }
    } catch (err) {
      alert('AI Analysis failed.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleStatusChange = async (alertId: number, newStatus: string) => {
    try {
      await alertsApi.update(alertId, { status: newStatus as any });
      await fetchAlerts();
      if (selectedAlert?.id === alertId) {
        setSelectedAlert({ ...selectedAlert, status: newStatus as any });
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-3 font-mono">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border bg-[#050505] p-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-terminalAmber text-black px-1.5 py-0.2 text-[10px] font-black">
              CMD://ALERTS
            </span>
            <h1 className="text-sm font-black tracking-wide text-terminalAmber uppercase">
              IDS ALERT MANAGEMENT &amp; TRIAGE DATABASE
            </h1>
          </div>
          <p className="text-[10px] text-textMuted mt-0.5">
            &gt; Query, filter, inspect, and execute LLM-based alert triage and severity reclassification
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3 py-1 bg-terminalAmber hover:bg-white text-black text-xs font-extrabold uppercase border border-terminalAmber flex items-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>[INGEST NEW ALERT]</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="terminal-card p-3 space-y-2.5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-terminalAmber absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="SEARCH BY IP, ATTACK TYPE, SIGNATURE, ALERT ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black border border-border focus:border-terminalAmber rounded-none py-1.5 pl-8 pr-3 text-xs font-mono text-white placeholder-textMuted outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-4 py-1.5 bg-black hover:bg-[#150d00] border border-terminalAmber text-terminalAmber font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>[EXECUTE SEARCH]</span>
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border text-xs font-mono">
          <div className="flex items-center text-terminalAmber font-bold text-[10px] mr-1">
            <Filter className="w-3 h-3 mr-1" />
            <span>FILTERS &gt;&gt;</span>
          </div>

          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(1);
            }}
            className="bg-black border border-border text-white text-[11px] px-2 py-0.5 outline-none focus:border-terminalAmber"
          >
            <option value="">ALL SEVERITIES</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-black border border-border text-white text-[11px] px-2 py-0.5 outline-none focus:border-terminalAmber"
          >
            <option value="">ALL STATUSES</option>
            <option value="NEW">NEW</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center ml-auto space-x-1.5 text-[11px]">
            <span className="text-textMuted font-bold">SORT:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, ord] = e.target.value.split('-');
                setSortBy(by);
                setSortOrder(ord);
              }}
              className="bg-black border border-border text-terminalAmber text-[11px] px-2 py-0.5 outline-none focus:border-terminalAmber font-bold"
            >
              <option value="timestamp-desc">NEWEST FIRST</option>
              <option value="timestamp-asc">OLDEST FIRST</option>
              <option value="severity-desc">SEVERITY DESC</option>
              <option value="alert_id-asc">ALERT ID ASC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Table Window */}
      <div className="terminal-card overflow-hidden">
        <div className="px-3 py-1.5 bg-[#120a00] border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black text-terminalAmber bg-black px-1.5 py-0.2 border border-border">
              [02]
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-terminalAmber flex items-center">
              <Radio className="w-3.5 h-3.5 mr-1 text-stockGreen animate-pulse" />
              IDS INGRESS BUFFER // {total} TOTAL RECORDS
            </span>
          </div>
          <div className="flex items-center space-x-1 opacity-60">
            <span className="w-2.5 h-2.5 flex items-center justify-center text-[8px] bg-black border border-border text-textMuted">_</span>
            <span className="w-2.5 h-2.5 flex items-center justify-center text-[8px] bg-black border border-border text-textMuted">□</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] font-mono border-collapse">
            <thead className="bg-[#0e0e0e] text-terminalAmber uppercase border-b border-border text-[10px]">
              <tr>
                <th className="px-3 py-2 border-r border-border">ALERT_ID</th>
                <th className="px-3 py-2 border-r border-border">TIMESTAMP (UTC)</th>
                <th className="px-3 py-2 border-r border-border">SOURCE_IP</th>
                <th className="px-3 py-2 border-r border-border">DEST_IP</th>
                <th className="px-3 py-2 border-r border-border">PROTO</th>
                <th className="px-3 py-2 border-r border-border">ATTACK_TYPE</th>
                <th className="px-3 py-2 border-r border-border">SEVERITY</th>
                <th className="px-3 py-2 border-r border-border">AI_CLASS</th>
                <th className="px-3 py-2 border-r border-border">PRIO</th>
                <th className="px-3 py-2 border-r border-border">STATUS</th>
                <th className="px-3 py-2 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-black">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-3 py-8 text-center text-terminalAmber font-bold">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-terminalAmber mb-2" />
                    &gt; QUERYING TELEMETRY STACK...
                  </td>
                </tr>
              ) : alerts.length > 0 ? (
                alerts.map((alert) => {
                  const latestAi = alert.analyses && alert.analyses.length > 0 ? alert.analyses[0] : null;
                  const timeFormatted = alert.timestamp ? alert.timestamp.replace('T', ' ').substring(0, 19) : 'N/A';
                  return (
                    <tr key={alert.id} className="hover:bg-[#120a00] transition">
                      <td className="px-3 py-2 font-bold text-white border-r border-border/40">{alert.alert_id}</td>
                      <td className="px-3 py-2 text-textMuted whitespace-nowrap border-r border-border/40">{timeFormatted}</td>
                      <td className="px-3 py-2 text-[#00E5FF] font-bold border-r border-border/40">{alert.source_ip}</td>
                      <td className="px-3 py-2 text-textSecondary border-r border-border/40">{alert.destination_ip}</td>
                      <td className="px-3 py-2 text-textMuted border-r border-border/40">{alert.protocol}</td>
                      <td className="px-3 py-2 text-white font-medium truncate max-w-[140px] border-r border-border/40">{alert.attack_type}</td>
                      <td className="px-3 py-2 border-r border-border/40">
                        <SeverityBadge severity={alert.severity} />
                      </td>
                      <td className="px-3 py-2 border-r border-border/40">
                        {latestAi ? (
                          <span
                            className={`font-bold uppercase text-[10px] ${
                              latestAi.classification === 'malicious'
                                ? 'text-stockRed'
                                : latestAi.classification === 'benign'
                                ? 'text-stockGreen'
                                : 'text-terminalAmber'
                            }`}
                          >
                            [{latestAi.classification}]
                          </span>
                        ) : (
                          <span className="text-textMuted">[PENDING]</span>
                        )}
                      </td>
                      <td className="px-3 py-2 border-r border-border/40">
                        {latestAi ? <PriorityBadge priority={latestAi.priority} /> : <span className="text-textMuted">-</span>}
                      </td>
                      <td className="px-3 py-2 border-r border-border/40">
                        <StatusBadge status={alert.status} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleQuickAnalyze(alert.id)}
                            disabled={analyzingId === alert.id}
                            title="Run AI Triage"
                            className="p-1 bg-black hover:bg-terminalAmber hover:text-black text-terminalAmber border border-terminalAmber transition disabled:opacity-40"
                          >
                            <Cpu className={`w-3.5 h-3.5 ${analyzingId === alert.id ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => setSelectedAlert(alert)}
                            title="View Details"
                            className="p-1 bg-black hover:bg-terminalAmber hover:text-black border border-border text-textSecondary hover:border-terminalAmber transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(alert.id)}
                            title="Delete Alert"
                            className="p-1 bg-black hover:bg-stockRed hover:text-white border border-border hover:border-stockRed text-textMuted transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="px-3 py-8 text-center text-textMuted">
                    &gt; No alerts matched your search query criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between p-2.5 bg-[#080808] border-t border-border text-xs font-mono">
          <span className="text-textMuted text-[11px]">
            &gt; SHOWING {alerts.length > 0 ? (page - 1) * pageSize + 1 : 0} TO{' '}
            {Math.min(page * pageSize, total)} OF {total} RECORDS
          </span>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-2 py-0.5 bg-black hover:bg-[#150d00] border border-border hover:border-terminalAmber text-terminalAmber disabled:opacity-40 transition"
            >
              [PREV]
            </button>
            <span className="px-2 py-0.5 bg-black border border-border text-white text-[11px] font-bold">
              PAGE {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-2 py-0.5 bg-black hover:bg-[#150d00] border border-border hover:border-terminalAmber text-terminalAmber disabled:opacity-40 transition"
            >
              [NEXT]
            </button>
          </div>
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <Modal
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          title={`ALERT INSPECTION // ${selectedAlert.alert_id}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs font-mono">
            {/* Header info bar */}
            <div className="flex items-center justify-between bg-black p-2.5 border border-border">
              <div>
                <span className="text-textMuted text-[10px] block uppercase">STATUS</span>
                <select
                  value={selectedAlert.status}
                  onChange={(e) => handleStatusChange(selectedAlert.id, e.target.value)}
                  className="bg-[#111111] border border-border px-2 py-0.5 text-xs text-terminalAmber font-bold outline-none mt-0.5"
                >
                  <option value="NEW">NEW</option>
                  <option value="INVESTIGATING">INVESTIGATING</option>
                  <option value="ESCALATED">ESCALATED</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
                </select>
              </div>

              <div>
                <span className="text-textMuted text-[10px] block uppercase">SEVERITY</span>
                <div className="mt-0.5">
                  <SeverityBadge severity={selectedAlert.severity} />
                </div>
              </div>

              <div>
                <span className="text-textMuted text-[10px] block uppercase">TIMESTAMP</span>
                <span className="text-white font-bold mt-0.5 block">
                  {selectedAlert.timestamp.replace('T', ' ').substring(0, 19)}
                </span>
              </div>
            </div>

            {/* Network Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black p-2.5 border border-border">
              <div>
                <span className="text-textMuted text-[10px] block uppercase">SOURCE_IP</span>
                <span className="text-[#00E5FF] font-bold">{selectedAlert.source_ip}</span>
              </div>
              <div>
                <span className="text-textMuted text-[10px] block uppercase">SOURCE_PORT</span>
                <span className="text-white">{selectedAlert.source_port || 'N/A'}</span>
              </div>
              <div>
                <span className="text-textMuted text-[10px] block uppercase">DEST_IP</span>
                <span className="text-white font-bold">{selectedAlert.destination_ip}</span>
              </div>
              <div>
                <span className="text-textMuted text-[10px] block uppercase">DEST_PORT</span>
                <span className="text-white">{selectedAlert.destination_port || 'N/A'}</span>
              </div>
            </div>

            {/* Signature */}
            <div>
              <span className="text-terminalAmber block text-[10px] uppercase font-bold mb-0.5">&gt; IDS RULE SIGNATURE</span>
              <div className="p-2 bg-black border border-border text-white">
                {selectedAlert.signature}
              </div>
            </div>

            {/* Raw Log */}
            <div>
              <span className="text-terminalAmber block text-[10px] uppercase font-bold mb-0.5">&gt; RAW TELEMETRY / EVENT LOG</span>
              <pre className="p-2.5 bg-black border border-border text-textSecondary whitespace-pre-wrap break-all max-h-32 overflow-y-auto font-mono text-[11px]">
                {selectedAlert.raw_log}
              </pre>
            </div>

            {/* AI Analysis */}
            {selectedAlert.analyses && selectedAlert.analyses.length > 0 ? (
              <div className="p-3 bg-[#0f0900] border border-terminalAmber space-y-2.5">
                <div className="flex items-center justify-between border-b border-terminalAmber/40 pb-1.5">
                  <span className="font-extrabold text-terminalAmber flex items-center uppercase">
                    <Cpu className="w-4 h-4 text-terminalAmber mr-1.5" />
                    AI STRUCTURED SECURITY ASSESSMENT
                  </span>
                  <PriorityBadge priority={selectedAlert.analyses[0].priority} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-textMuted block text-[10px]">CLASSIFICATION</span>
                    <span className="font-bold uppercase text-stockRed">[{selectedAlert.analyses[0].classification}]</span>
                  </div>
                  <div>
                    <span className="text-textMuted block text-[10px]">CONFIDENCE</span>
                    <span className="text-stockGreen font-bold">{Math.round(selectedAlert.analyses[0].confidence * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-textMuted block text-[10px]">FP LIKELIHOOD</span>
                    <span className="text-terminalAmber font-bold">{Math.round(selectedAlert.analyses[0].false_positive_likelihood * 100)}%</span>
                  </div>
                </div>

                <div>
                  <span className="text-textMuted block text-[10px] uppercase mb-0.5">&gt; REASONING SUMMARY</span>
                  <p className="text-textSecondary leading-relaxed bg-black p-2 border border-border">{selectedAlert.analyses[0].reason}</p>
                </div>

                <div className="pt-1 border-t border-border">
                  <span className="text-[#00E5FF] block text-[10px] uppercase font-bold mb-0.5">&gt; RECOMMENDED ACTION</span>
                  <p className="text-white leading-relaxed bg-black p-2 border border-border">{selectedAlert.analyses[0].recommended_action}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-black border border-border flex items-center justify-between">
                <span className="text-textMuted">&gt; No AI analysis on record for this alert.</span>
                <button
                  onClick={() => handleQuickAnalyze(selectedAlert.id)}
                  disabled={analyzingId === selectedAlert.id}
                  className="px-3 py-1 bg-terminalAmber hover:bg-white text-black font-bold text-xs uppercase"
                >
                  {analyzingId === selectedAlert.id ? 'Analyzing...' : '[RUN AI TRIAGE]'}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Ingest New Alert Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="MANUAL IDS ALERT INGESTION"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs font-mono">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-terminalAmber uppercase block mb-0.5 text-[10px]">&gt; SOURCE_IP</label>
                <input
                  type="text"
                  required
                  value={newAlert.source_ip}
                  onChange={(e) => setNewAlert({ ...newAlert, source_ip: e.target.value })}
                  className="w-full bg-black border border-border p-1.5 text-white outline-none focus:border-terminalAmber font-mono"
                />
              </div>
              <div>
                <label className="text-terminalAmber uppercase block mb-0.5 text-[10px]">&gt; SOURCE_PORT</label>
                <input
                  type="number"
                  value={newAlert.source_port}
                  onChange={(e) => setNewAlert({ ...newAlert, source_port: parseInt(e.target.value) || 0 })}
                  className="w-full bg-black border border-border p-1.5 text-white outline-none focus:border-terminalAmber font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-terminalAmber uppercase block mb-0.5 text-[10px]">&gt; DESTINATION_IP</label>
                <input
                  type="text"
                  required
                  value={newAlert.destination_ip}
                  onChange={(e) => setNewAlert({ ...newAlert, destination_ip: e.target.value })}
                  className="w-full bg-black border border-border p-1.5 text-white outline-none focus:border-terminalAmber font-mono"
                />
              </div>
              <div>
                <label className="text-terminalAmber uppercase block mb-0.5 text-[10px]">&gt; DESTINATION_PORT</label>
                <input
                  type="number"
                  value={newAlert.destination_port}
                  onChange={(e) => setNewAlert({ ...newAlert, destination_port: parseInt(e.target.value) || 0 })}
                  className="w-full bg-black border border-border p-1.5 text-white outline-none focus:border-terminalAmber font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-terminalAmber uppercase block mb-0.5 text-[10px]">&gt; PROTOCOL</label>
                <select
                  value={newAlert.protocol}
                  onChange={(e) => setNewAlert({ ...newAlert, protocol: e.target.value })}
                  className="w-full bg-black border border-border p-1.5 text-white outline-none focus:border-terminalAmber font-mono"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="ICMP">ICMP</option>
                  <option value="HTTP">HTTP</option>
                </select>
              </div>
              <div>
                <label className="text-terminalAmber uppercase block mb-0.5 text-[10px]">&gt; SEVERITY</label>
                <select
                  value={newAlert.severity}
                  onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                  className="w-full bg-black border border-border p-1.5 text-white outline-none focus:border-terminalAmber font-mono"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-terminalAmber uppercase block mb-0.5 text-[10px]">&gt; ATTACK_TYPE</label>
              <input
                type="text"
                required
                value={newAlert.attack_type}
                onChange={(e) => setNewAlert({ ...newAlert, attack_type: e.target.value })}
                className="w-full bg-black border border-border p-1.5 text-white outline-none focus:border-terminalAmber font-mono"
              />
            </div>

            <div>
              <label className="text-terminalAmber uppercase block mb-0.5 text-[10px]">&gt; SIGNATURE</label>
              <input
                type="text"
                required
                value={newAlert.signature}
                onChange={(e) => setNewAlert({ ...newAlert, signature: e.target.value })}
                className="w-full bg-black border border-border p-1.5 text-white outline-none focus:border-terminalAmber font-mono"
              />
            </div>

            <div>
              <label className="text-terminalAmber uppercase block mb-0.5 text-[10px]">&gt; RAW_PAYLOAD_EVENT_LOG</label>
              <textarea
                rows={3}
                required
                value={newAlert.raw_log}
                onChange={(e) => setNewAlert({ ...newAlert, raw_log: e.target.value })}
                className="w-full bg-black border border-border p-1.5 text-white outline-none focus:border-terminalAmber font-mono"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-3 py-1 bg-black border border-border text-textSecondary uppercase hover:text-white"
              >
                [CANCEL]
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-terminalAmber hover:bg-white text-black font-extrabold uppercase"
              >
                [COMMIT TO DB]
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
