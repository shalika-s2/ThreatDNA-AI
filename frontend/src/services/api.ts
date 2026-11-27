import axios from 'axios';
import {
  AuthResponse,
  User,
  Alert,
  AlertListResponse,
  AIAnalysis,
  Dataset,
  DatasetPreview,
  Experiment,
  ExperimentResult,
  Metric,
  TraditionalComparisonItem,
  ExperimentReport,
  DashboardSummary,
  NetworkInterface,
  NetworkPacket,
  NetworkConnection,
  NetworkStatus
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('threatdna_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for 401 response handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('threatdna_token');
      localStorage.removeItem('threatdna_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  register: async (data: { username: string; email: string; password: string; role?: string }): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },
};

// Alerts API
export const alertsApi = {
  list: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    severity?: string;
    status?: string;
    attack_type?: string;
    classification?: string;
    priority?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<AlertListResponse> => {
    const response = await apiClient.get<AlertListResponse>('/alerts', { params });
    return response.data;
  },
  get: async (id: string | number): Promise<Alert> => {
    const response = await apiClient.get<Alert>(`/alerts/${id}`);
    return response.data;
  },
  create: async (data: Partial<Alert>): Promise<Alert> => {
    const response = await apiClient.post<Alert>('/alerts', data);
    return response.data;
  },
  update: async (id: string | number, data: Partial<Alert>): Promise<Alert> => {
    const response = await apiClient.patch<Alert>(`/alerts/${id}`, data);
    return response.data;
  },
  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/alerts/${id}`);
  },
  analyze: async (id: string | number, params?: { provider?: string; model?: string }): Promise<AIAnalysis> => {
    const response = await apiClient.post<AIAnalysis>(`/alerts/${id}/analyze`, null, { params });
    return response.data;
  },
};

// Analyses API
export const analysesApi = {
  list: async (limit = 50): Promise<AIAnalysis[]> => {
    const response = await apiClient.get<AIAnalysis[]>('/analyses', { params: { limit } });
    return response.data;
  },
  analyzeRaw: async (data: {
    raw_log: string;
    source_ip?: string;
    destination_ip?: string;
    protocol?: string;
    attack_type?: string;
    provider?: string;
    model?: string;
  }): Promise<{
    classification: 'malicious' | 'benign' | 'suspicious';
    severity: 'critical' | 'high' | 'medium' | 'low';
    priority: 'P1' | 'P2' | 'P3' | 'P4';
    confidence: number;
    false_positive_likelihood: number;
    reason: string;
    recommended_action: string;
  }> => {
    const response = await apiClient.post('/analyses/raw', data);
    return response.data;
  },
};

// Datasets API
export const datasetsApi = {
  list: async (): Promise<Dataset[]> => {
    const response = await apiClient.get<Dataset[]>('/datasets');
    return response.data;
  },
  get: async (id: number): Promise<Dataset> => {
    const response = await apiClient.get<Dataset>(`/datasets/${id}`);
    return response.data;
  },
  preview: async (id: number, nrows = 15): Promise<DatasetPreview> => {
    const response = await apiClient.get<DatasetPreview>(`/datasets/${id}/preview`, { params: { nrows } });
    return response.data;
  },
  upload: async (formData: FormData): Promise<Dataset> => {
    const response = await apiClient.post<Dataset>('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/datasets/${id}`);
  },
};

// Experiments API
export const experimentsApi = {
  list: async (): Promise<Experiment[]> => {
    const response = await apiClient.get<Experiment[]>('/experiments');
    return response.data;
  },
  get: async (id: number): Promise<Experiment> => {
    const response = await apiClient.get<Experiment>(`/experiments/${id}`);
    return response.data;
  },
  create: async (data: {
    name: string;
    dataset_id: number;
    provider: string;
    model: string;
    sample_size: number;
  }): Promise<Experiment> => {
    const response = await apiClient.post<Experiment>('/experiments', data);
    return response.data;
  },
  run: async (id: number): Promise<any> => {
    const response = await apiClient.post(`/experiments/${id}/run`);
    return response.data;
  },
  getResults: async (id: number, limit = 100): Promise<ExperimentResult[]> => {
    const response = await apiClient.get<ExperimentResult[]>(`/experiments/${id}/results`, { params: { limit } });
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/experiments/${id}`);
  },
};

// Metrics API
export const metricsApi = {
  get: async (experimentId: number): Promise<Metric> => {
    const response = await apiClient.get<Metric>(`/metrics/${experimentId}`);
    return response.data;
  },
  getComparison: async (experimentId: number): Promise<TraditionalComparisonItem[]> => {
    const response = await apiClient.get<TraditionalComparisonItem[]>(`/metrics/${experimentId}/comparison`);
    return response.data;
  },
};

// Reports API
export const reportsApi = {
  getReport: async (experimentId: number): Promise<ExperimentReport> => {
    const response = await apiClient.get<ExperimentReport>(`/reports/${experimentId}`);
    return response.data;
  },
  getExportUrl: (experimentId: number): string => {
    return `${API_BASE_URL}/reports/${experimentId}/export-csv`;
  },
  getPdfExportUrl: (experimentId: number): string => {
    return `${API_BASE_URL}/reports/${experimentId}/export-pdf`;
  },
};

// Live Network Monitor API
export const networkApi = {
  getInterfaces: async (): Promise<NetworkInterface[]> => {
    const response = await apiClient.get<NetworkInterface[]>('/network/interfaces');
    return response.data;
  },
  startCapture: async (params?: { interface?: string; auto_triage?: boolean }): Promise<any> => {
    const response = await apiClient.post('/network/start', params || {});
    return response.data;
  },
  stopCapture: async (): Promise<any> => {
    const response = await apiClient.post('/network/stop');
    return response.data;
  },
  getStatus: async (): Promise<NetworkStatus> => {
    const response = await apiClient.get<NetworkStatus>('/network/status');
    return response.data;
  },
  getPackets: async (params?: { limit?: number; protocol?: string; threats_only?: boolean }): Promise<{ count: number; packets: NetworkPacket[] }> => {
    const response = await apiClient.get('/network/packets', { params });
    return response.data;
  },
  getConnections: async (limit = 50): Promise<{ count: number; connections: NetworkConnection[] }> => {
    const response = await apiClient.get('/network/connections', { params: { limit } });
    return response.data;
  },
  clearBuffer: async (): Promise<any> => {
    const response = await apiClient.post('/network/clear');
    return response.data;
  },
  analyzeEvent: async (eventData: Partial<NetworkPacket> & { save_as_alert?: boolean }): Promise<any> => {
    const response = await apiClient.post('/network/analyze-event', eventData);
    return response.data;
  }
};

