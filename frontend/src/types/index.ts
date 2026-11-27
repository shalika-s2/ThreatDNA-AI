export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AIAnalysis {
  id: number;
  alert_id: number;
  provider: string;
  model: string;
  classification: 'malicious' | 'benign' | 'suspicious';
  severity: 'critical' | 'high' | 'medium' | 'low';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  confidence: number;
  false_positive_likelihood: number;
  reason: string;
  recommended_action: string;
  created_at: string;
}

export interface Alert {
  id: number;
  alert_id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  source_port?: number;
  destination_port?: number;
  protocol: string;
  attack_type: string;
  signature: string;
  raw_log: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED' | 'FALSE_POSITIVE';
  created_at: string;
  analyses: AIAnalysis[];
}

export interface AlertListResponse {
  total: number;
  page: number;
  page_size: number;
  alerts: Alert[];
}

export interface Dataset {
  id: number;
  name: string;
  filename: string;
  row_count: number;
  column_count: number;
  ground_truth_column: string;
  created_at: string;
}

export interface DatasetPreview {
  id: number;
  name: string;
  filename: string;
  row_count: number;
  column_count: number;
  columns: string[];
  ground_truth_column: string;
  sample_rows: Record<string, any>[];
}

export interface Experiment {
  id: number;
  name: string;
  dataset_id: number;
  provider: string;
  model: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  total_records: number;
  sample_size: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  dataset?: Dataset;
}

export interface ExperimentResult {
  id: number;
  record_id: number;
  ground_truth: string;
  prediction: string;
  confidence: number;
  severity: string;
  priority: string;
  fp_likelihood: number;
  is_correct: boolean;
  created_at: string;
}

export interface Metric {
  id: number;
  experiment_id: number;
  true_positive: number;
  true_negative: number;
  false_positive: number;
  false_negative: number;
  precision_score: number;
  recall_score: number;
  f1_score: number;
  false_positive_rate: number;
  accuracy_score: number;
  total_samples: number;
  created_at: string;
}

export interface TraditionalComparisonItem {
  metric_name: string;
  traditional_value: string;
  llm_value: string;
  difference: string;
  description: string;
}

export interface ExperimentReport {
  experiment_id: number;
  experiment_name: string;
  dataset_name: string;
  provider: string;
  model: string;
  status: string;
  sample_size: number;
  started_at?: string;
  completed_at?: string;
  metrics?: Metric;
  comparisons: TraditionalComparisonItem[];
  confusion_matrix: {
    TP: number;
    TN: number;
    FP: number;
    FN: number;
  };
  key_findings: string[];
}

export interface DashboardSummary {
  system_status: string;
  summary_cards: {
    total_alerts: number;
    critical_alerts: number;
    high_alerts: number;
    medium_alerts: number;
    low_alerts: number;
    false_positives: number;
    true_positives: number;
    ai_analyzed: number;
  };
  ai_security_score: {
    overall_score: number;
    precision_factor: number;
    fp_reduction_factor: number;
    confidence_factor: number;
    coverage_factor: number;
    formula_explanation: string;
  };
  severity_distribution: { severity: string; count: number }[];
  priority_distribution: { priority: string; count: number }[];
  classification_distribution: { classification: string; count: number }[];
  alerts_over_time: {
    timestamp: string;
    count: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }[];
  tp_vs_fp: {
    true_positives: number;
    false_positives: number;
    true_negatives: number;
  };
  confidence_distribution: { range: string; count: number }[];
}

export interface NetworkInterface {
  name: string;
  ipv4: string;
  ipv6: string;
  mac: string;
  is_up: boolean;
  speed_mbps: number;
  is_active: boolean;
}

export interface NetworkPacket {
  id: string;
  timestamp: string;
  source_ip: string;
  source_port: number;
  destination_ip: string;
  destination_port: number;
  protocol: string;
  length: number;
  flags: string;
  info: string;
  is_threat: boolean;
  threat_type?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  payload_hex?: string;
}

export interface NetworkConnection {
  fd?: number;
  family: string;
  protocol: string;
  local_address: string;
  remote_address: string;
  status: string;
  pid?: number;
  process_name: string;
  is_suspicious: boolean;
  threat_note?: string;
}

export interface NetworkStatus {
  is_capturing: boolean;
  interface?: string;
  auto_triage: boolean;
  elapsed_seconds: number;
  total_packets: number;
  total_bytes: number;
  packets_per_sec: number;
  bandwidth_kbps: number;
  threats_detected: number;
  protocol_counts: Record<string, number>;
  system_bytes_sent: number;
  system_bytes_recv: number;
  buffered_packets_count: number;
  buffered_threats_count: number;
}

