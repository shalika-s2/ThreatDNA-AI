import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Info,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Flame,
  ArrowRight,
  Eye,
  RefreshCw,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  Activity,
  Terminal,
  Layers,
  Radio
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { dashboardApi, alertsApi } from '../services/api';
import { DashboardSummary, Alert } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { SeverityBadge, PriorityBadge, StatusBadge } from '../components/common/Badges';
import { Modal } from '../components/common/Modal';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumData, alertsData] = await Promise.all([
        dashboardApi.getSummary(),
        alertsApi.list({ page: 1, page_size: 10, sort_by: 'timestamp', sort_order: 'desc' })
      ]);
      setSummary(sumData);
      setRecentAlerts(alertsData.alerts);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Bloomberg Terminal Chart Colors
  const SEVERITY_COLORS: Record<string, string> = {
    CRITICAL: '#FF5252',
    HIGH: '#FF7A00',
    MEDIUM: '#FF9900',
    LOW: '#00E676'
  };

  const PIE_COLORS = ['#FF5252', '#00E676', '#FF9900'];
  const PRIORITY_COLORS = ['#FF5252', '#FF7A00', '#FF9900', '#00E676'];

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-96 font-mono">
        <div className="flex flex-col items-center space-y-3 bg-[#080808] p-6 border border-border">
          <RefreshCw className="w-8 h-8 text-terminalAmber animate-spin" />
          <span className="text-xs font-mono text-terminalAmber uppercase tracking-widest font-bold">
            &gt; INITIALIZING BLOOMBERG TELEMETRY FEED...
          </span>
        </div>
      </div>
    );
  }

  const cards = summary?.summary_cards || {
    total_alerts: 0,
    critical_alerts: 0,
    high_alerts: 0,
    medium_alerts: 0,
    low_alerts: 0,
    false_positives: 0,
    true_positives: 0,
    ai_analyzed: 0,
  };

  const tpVsFpData = [
    { name: 'True Positives', count: cards.true_positives, fill: '#FF5252' },
    { name: 'False Positives', count: cards.false_positives, fill: '#00E676' },
  ];

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-border bg-[#050505] p-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-terminalAmber text-black px-1.5 py-0.2 text-[10px] font-black">
              CMD://SOC_ROOT
            </span>
            <h1 className="text-sm font-black tracking-wide text-terminalAmber uppercase">
              THREAT TELEMETRY &amp; AI TRIAGE STATION
            </h1>
          </div>
          <p className="text-[10px] text-textMuted mt-0.5">
            &gt; Real-time IDS alert triage, automated false-positive reduction, and prioritization engine
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchDashboardData}
            className="px-2.5 py-1 bg-black hover:bg-[#150d00] border border-border text-terminalAmber text-xs font-bold flex items-center space-x-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>[SYNC DATA]</span>
          </button>
          <button
            onClick={() => navigate('/analysis')}
            className="px-3 py-1 bg-terminalAmber hover:bg-white text-black text-xs font-extrabold uppercase border border-terminalAmber flex items-center space-x-1.5 transition"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>[RUN AI TRIAGE]</span>
          </button>
        </div>
      </div>

      {/* 8 Terminal Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <MetricCard
          tag="01"
          title="TOTAL ALERTS"
          value={cards.total_alerts}
          icon={ShieldAlert}
          variant="default"
          subtitle="All received"
        />
        <MetricCard
          tag="02"
          title="CRITICAL"
          value={cards.critical_alerts}
          icon={Flame}
          variant="red"
          trend="▲ IMMEDIATE"
          subtitle="Immediate triage"
        />
        <MetricCard
          tag="03"
          title="HIGH RISK"
          value={cards.high_alerts}
          icon={AlertOctagon}
          variant="red"
          subtitle="Elevated risk"
        />
        <MetricCard
          tag="04"
          title="MEDIUM"
          value={cards.medium_alerts}
          icon={AlertTriangle}
          variant="amber"
          subtitle="Suspicious flow"
        />
        <MetricCard
          tag="05"
          title="LOW NOISE"
          value={cards.low_alerts}
          icon={Info}
          variant="green"
          subtitle="Benign/Noise"
        />
        <MetricCard
          tag="06"
          title="FP REDUCED"
          value={cards.false_positives}
          icon={ShieldCheck}
          variant="green"
          trend="▲ FILTERED"
          subtitle="Filtered noise"
        />
        <MetricCard
          tag="07"
          title="TRUE THREATS"
          value={cards.true_positives}
          icon={CheckCircle2}
          variant="red"
          subtitle="Verified threats"
        />
        <MetricCard
          tag="08"
          title="AI ANALYZED"
          value={cards.ai_analyzed}
          icon={Cpu}
          variant="green"
          subtitle="Triage coverage"
        />
      </div>

      {/* Main Analysis Section: AI Score Gauge + Alerts Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Central Dynamic AI Alert Analysis Score */}
        <div className="lg:col-span-1">
          {summary?.ai_security_score && (
            <ScoreGauge
              score={summary.ai_security_score.overall_score}
              breakdown={summary.ai_security_score}
            />
          )}
        </div>

        {/* Alerts Over Time Chart Window */}
        <div className="lg:col-span-2 terminal-card flex flex-col justify-between overflow-hidden">
          <div className="px-3 py-1.5 bg-[#120a00] border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-terminalAmber bg-black px-1.5 py-0.2 border border-border">
                [02]
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-terminalAmber flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1 text-terminalAmber" />
                TEMPORAL INGRESS TREND &amp; VOLUME HISTOGRAM
              </span>
            </div>
            <div className="flex items-center space-x-1 opacity-60">
              <span className="w-2.5 h-2.5 flex items-center justify-center text-[8px] bg-black border border-border text-textMuted">_</span>
              <span className="w-2.5 h-2.5 flex items-center justify-center text-[8px] bg-black border border-border text-textMuted">□</span>
            </div>
          </div>

          <div className="p-3 h-52 w-full bg-[#050505]">
            {summary?.alerts_over_time && summary.alerts_over_time.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.alerts_over_time} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#221500" vertical={false} />
                  <XAxis dataKey="timestamp" stroke="#8A8A8E" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8A8A8E" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#050505', borderColor: '#FF9900', fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#FFFFFF' }}
                  />
                  <Line type="monotone" dataKey="count" name="Total Alerts" stroke="#FF9900" strokeWidth={2} dot={{ r: 2, fill: '#FF9900' }} />
                  <Line type="monotone" dataKey="critical" name="Critical" stroke="#FF5252" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                  <Line type="monotone" dataKey="high" name="High" stroke="#FF7A00" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-textMuted font-mono">
                &gt; Awaiting temporal telemetry stream...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5 Analytical Deep-Dive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. Alerts by Severity */}
        <div className="terminal-card overflow-hidden">
          <div className="px-3 py-1.5 bg-[#120a00] border-b border-border flex items-center justify-between">
            <span className="text-xs font-black tracking-wider uppercase text-terminalAmber flex items-center">
              <span className="text-[10px] text-terminalAmber bg-black px-1 mr-1.5 border border-border">[03]</span>
              ALERTS BY SEVERITY
            </span>
          </div>
          <div className="p-3 h-44 w-full bg-[#050505]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.severity_distribution || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#221500" vertical={false} />
                <XAxis dataKey="severity" stroke="#8A8A8E" fontSize={10} tickLine={false} />
                <YAxis stroke="#8A8A8E" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#050505', borderColor: '#FF9900', fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#FFFFFF' }}
                />
                <Bar dataKey="count" name="Alerts" radius={[0, 0, 0, 0]}>
                  {(summary?.severity_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity] || '#FF9900'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Malicious vs Benign Classification */}
        <div className="terminal-card overflow-hidden">
          <div className="px-3 py-1.5 bg-[#120a00] border-b border-border flex items-center justify-between">
            <span className="text-xs font-black tracking-wider uppercase text-terminalAmber flex items-center">
              <span className="text-[10px] text-terminalAmber bg-black px-1 mr-1.5 border border-border">[04]</span>
              MALICIOUS VS BENIGN
            </span>
          </div>
          <div className="p-3 h-44 w-full bg-[#050505]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary?.classification_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={54}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="classification"
                >
                  {(summary?.classification_distribution || []).map((entry, index) => (
                    <Cell key={`cell-pie-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#050505', borderColor: '#FF9900', fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#FFFFFF' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. True Positive vs False Positive */}
        <div className="terminal-card overflow-hidden">
          <div className="px-3 py-1.5 bg-[#120a00] border-b border-border flex items-center justify-between">
            <span className="text-xs font-black tracking-wider uppercase text-terminalAmber flex items-center">
              <span className="text-[10px] text-terminalAmber bg-black px-1 mr-1.5 border border-border">[05]</span>
              TRUE VS FALSE POSITIVES
            </span>
          </div>
          <div className="p-3 h-44 w-full bg-[#050505]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tpVsFpData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#221500" vertical={false} />
                <XAxis dataKey="name" stroke="#8A8A8E" fontSize={10} tickLine={false} />
                <YAxis stroke="#8A8A8E" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#050505', borderColor: '#FF9900', fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#FFFFFF' }}
                />
                <Bar dataKey="count" radius={[0, 0, 0, 0]}>
                  {tpVsFpData.map((entry, index) => (
                    <Cell key={`cell-tpfp-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. AI Confidence Distribution */}
        <div className="terminal-card overflow-hidden">
          <div className="px-3 py-1.5 bg-[#120a00] border-b border-border flex items-center justify-between">
            <span className="text-xs font-black tracking-wider uppercase text-terminalAmber flex items-center">
              <span className="text-[10px] text-terminalAmber bg-black px-1 mr-1.5 border border-border">[06]</span>
              AI CONFIDENCE DISTRIBUTION
            </span>
          </div>
          <div className="p-3 h-44 w-full bg-[#050505]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.confidence_distribution || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#221500" vertical={false} />
                <XAxis dataKey="range" stroke="#8A8A8E" fontSize={10} tickLine={false} />
                <YAxis stroke="#8A8A8E" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#050505', borderColor: '#FF9900', fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#FFFFFF' }}
                />
                <Bar dataKey="count" name="Evaluations" fill="#FF9900" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Alert Priority Distribution (P1 - P4) */}
        <div className="terminal-card overflow-hidden md:col-span-2 lg:col-span-2">
          <div className="px-3 py-1.5 bg-[#120a00] border-b border-border flex items-center justify-between">
            <span className="text-xs font-black tracking-wider uppercase text-terminalAmber flex items-center">
              <span className="text-[10px] text-terminalAmber bg-black px-1 mr-1.5 border border-border">[07]</span>
              ALERT PRIORITY DISTRIBUTION (P1 - P4 QUEUE)
            </span>
          </div>
          <div className="p-3 h-44 w-full bg-[#050505]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.priority_distribution || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#221500" vertical={false} />
                <XAxis dataKey="priority" stroke="#8A8A8E" fontSize={10} tickLine={false} />
                <YAxis stroke="#8A8A8E" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#050505', borderColor: '#FF9900', fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#FFFFFF' }}
                />
                <Bar dataKey="count" name="Alerts in Queue" radius={[0, 0, 0, 0]}>
                  {(summary?.priority_distribution || []).map((entry, index) => (
                    <Cell key={`cell-prio-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Terminal Data Feed Table */}
      <div className="terminal-card overflow-hidden">
        <div className="px-3 py-1.5 bg-[#120a00] border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black text-terminalAmber bg-black px-1.5 py-0.2 border border-border">
              [08]
            </span>
            <span className="text-xs font-black tracking-wider uppercase text-terminalAmber flex items-center">
              <Radio className="w-3.5 h-3.5 mr-1 text-stockGreen animate-pulse" />
              LIVE SOC TELEMETRY FEED // REAL-TIME INGRESS
            </span>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="text-xs font-bold text-terminalAmber hover:text-white flex items-center space-x-1 transition"
          >
            <span>[VIEW FULL TELEMETRY TABLE]</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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
                <th className="px-3 py-2 border-r border-border">CONF%</th>
                <th className="px-3 py-2 border-r border-border">PRIO</th>
                <th className="px-3 py-2 border-r border-border">STATUS</th>
                <th className="px-3 py-2 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-black">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => {
                  const latestAi = alert.analyses && alert.analyses.length > 0 ? alert.analyses[0] : null;
                  const timeFormatted = alert.timestamp ? alert.timestamp.replace('T', ' ').substring(0, 19) : 'N/A';
                  return (
                    <tr key={alert.id} className="hover:bg-[#120a00] transition">
                      <td className="px-3 py-2 text-white font-bold border-r border-border/40">{alert.alert_id}</td>
                      <td className="px-3 py-2 text-textMuted whitespace-nowrap border-r border-border/40">{timeFormatted}</td>
                      <td className="px-3 py-2 text-[#00E5FF] font-bold border-r border-border/40">{alert.source_ip}</td>
                      <td className="px-3 py-2 text-textSecondary border-r border-border/40">{alert.destination_ip}</td>
                      <td className="px-3 py-2 text-textMuted border-r border-border/40">{alert.protocol}</td>
                      <td className="px-3 py-2 text-white font-medium truncate max-w-[150px] border-r border-border/40">{alert.attack_type}</td>
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
                        {latestAi ? (
                          <span className="text-white font-bold">{Math.round(latestAi.confidence * 100)}%</span>
                        ) : (
                          <span className="text-textMuted">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 border-r border-border/40">
                        {latestAi ? <PriorityBadge priority={latestAi.priority} /> : <span className="text-textMuted">-</span>}
                      </td>
                      <td className="px-3 py-2 border-r border-border/40">
                        <StatusBadge status={alert.status} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="px-2 py-0.5 bg-black hover:bg-terminalAmber hover:text-black border border-terminalAmber/50 text-terminalAmber text-[10px] font-bold uppercase transition inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3 mr-0.5" />
                          <span>[INSPECT]</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="px-3 py-8 text-center text-textMuted">
                    &gt; No active alerts in queue buffer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black p-3 border border-border">
              <div>
                <span className="text-textMuted block text-[10px] uppercase">SOURCE_IP:PORT</span>
                <span className="text-[#00E5FF] font-bold">{selectedAlert.source_ip}:{selectedAlert.source_port || '0'}</span>
              </div>
              <div>
                <span className="text-textMuted block text-[10px] uppercase">DEST_IP:PORT</span>
                <span className="text-white font-bold">{selectedAlert.destination_ip}:{selectedAlert.destination_port || '0'}</span>
              </div>
              <div>
                <span className="text-textMuted block text-[10px] uppercase">PROTOCOL</span>
                <span className="text-terminalAmber font-bold">{selectedAlert.protocol}</span>
              </div>
              <div>
                <span className="text-textMuted block text-[10px] uppercase">SEVERITY</span>
                <SeverityBadge severity={selectedAlert.severity} />
              </div>
            </div>

            {/* Signature & Attack Type */}
            <div className="space-y-1">
              <span className="text-terminalAmber block text-[10px] uppercase font-bold">&gt; SIGNATURE DETECTION</span>
              <div className="p-2 bg-black border border-border text-white">
                {selectedAlert.signature}
              </div>
            </div>

            {/* Raw Log */}
            <div className="space-y-1">
              <span className="text-terminalAmber block text-[10px] uppercase font-bold">&gt; RAW PACKET PAYLOAD / EVENT LOG</span>
              <pre className="p-2.5 bg-black border border-border text-textSecondary font-mono text-[11px] whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                {selectedAlert.raw_log}
              </pre>
            </div>

            {/* AI Analysis Block */}
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
                  <span className="text-[#00E5FF] block text-[10px] uppercase font-bold mb-0.5">&gt; RECOMMENDED MITIGATION</span>
                  <p className="text-white leading-relaxed bg-black p-2 border border-border">{selectedAlert.analyses[0].recommended_action}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-black border border-border text-center">
                <p className="text-textMuted mb-2">&gt; Alert has not been triaged through AI pipeline yet.</p>
                <button
                  onClick={() => {
                    navigate('/analysis');
                  }}
                  className="px-3 py-1 bg-terminalAmber text-black font-bold text-xs uppercase"
                >
                  [ANALYZE WITH AI NOW]
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
