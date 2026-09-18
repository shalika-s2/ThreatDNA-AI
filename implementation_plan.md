# Implementation Plan: ThreatDNA-AI Full-Stack Platform

ThreatDNA-AI is an academic cybersecurity research platform and full-stack SOC web application designed to investigate whether Large Language Models (LLMs) can reduce false positives, accurately classify intrusion alerts, and prioritize alerts for SOC analysts.

## System Architecture

```text
                               THREATDNA-AI
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
   React 18 + Vite + TS                              FastAPI Backend
(Dark Cyber SOC Design System)                   (REST APIs + Pydantic v2)
  ├── TailwindCSS Custom Theme                               │
  ├── Recharts SOC Analytics               ┌─────────────────┴─────────────────┐
  ├── Real-time Alerts & Feed              ▼                                   ▼
  ├── AI Analysis Workbench         SQLAlchemy ORM                      LLM Abstraction
  ├── Dataset & CSV Manager         (MySQL 8+ / SQLite)             (Gemini / OpenAI / Fallback)
  ├── Experiment Engine & Wizard           │                                   │
  ├── Research Metrics & Confusion         ▼                                   ▼
  └── Executive Reports & Export      Data Layer                      Structured Threat JSON
                               (Alerts, Experiments,             (Classification, Severity,
                                Datasets, Metrics)                Priority, FP Likelihood)
```

---

## User Review Required

> [!IMPORTANT]
> - **Database Support**: The system uses SQLAlchemy ORM with support for MySQL 8+ (`mysql+pymysql://...`) as specified in the requirements, with automatic SQLite fallback (`sqlite:///./threatdna_ai.db`) if MySQL credentials are not yet configured in `.env`.
> - **LLM Integration**: The LLM engine supports **Google Gemini**, **OpenAI**, and an intelligent **Academic Rule-Based/Heuristic Engine** when API keys are not supplied. This ensures the application is 100% functional out of the box for testing and evaluation without failing on missing API keys.
> - **Synthetic Seed Data**: Pre-loaded with clearly labelled `SYNTHETIC DEMO DATA` covering Brute Force, SQL Injection, Port Scanning, DNS Exfiltration, DDoS, and Benign HTTP traffic.

---

## Proposed Changes

### 1. Database Architecture & Seed Data (`/database` & `/backend/app/models`)
- **`database/schema.sql`**: Full MySQL 8 DDL with foreign keys, indexes, and constraints.
- Tables:
  - `users`: ID, username, email, password_hash, role, created_at.
  - `alerts`: ID, alert_id (e.g. ALR-0001), timestamp, source_ip, destination_ip, source_port, destination_port, protocol, attack_type, signature, raw_log, severity, status, created_at.
  - `ai_analyses`: ID, alert_id, provider, model, classification, severity, priority, confidence, false_positive_likelihood, reason, recommended_action, created_at.
  - `datasets`: ID, name, filename, row_count, column_count, ground_truth_column, file_path, created_at.
  - `experiments`: ID, dataset_id, provider, model, status, total_records, sample_size, started_at, completed_at.
  - `experiment_results`: ID, experiment_id, record_id, ground_truth, prediction, confidence, severity, priority, fp_likelihood, is_correct, created_at.
  - `metrics`: ID, experiment_id, true_positive, true_negative, false_positive, false_negative, precision, recall, f1_score, false_positive_rate, accuracy, created_at.

### 2. Backend Implementation (`/backend`)
- **Core (`/backend/app/core`)**:
  - `config.py`: Pydantic settings loading `.env` (DB URL, JWT secret, LLM keys, CORS).
  - `security.py`: Password hashing (Bcrypt/Passlib), JWT token creation, validation, dependency injection for protected routes.
  - `database.py`: SQLAlchemy engine, session factory, auto-table creation, and fallback logic.
- **Prompts (`/backend/app/prompts`)**:
  - `alert_analysis_prompt.py`: Strict system and user prompt templates instructing LLMs to output validated JSON without raw chain-of-thought leakage.
- **Services (`/backend/app/services`)**:
  - `llm_service.py`: LLM abstraction supporting Google Gemini (`google-genai` / REST), OpenAI (`openai`), and intelligent heuristic analyzer fallback.
  - `dataset_service.py`: CSV parsing, row/column validation, ground-truth column inference, and sample extraction using `pandas`.
  - `experiment_service.py`: Experiment pipeline execution (sample processing, batch LLM classification, prediction comparison against ground truth).
  - `metrics_service.py`: Scikit-learn + NumPy powered calculation of Confusion Matrix (TP, TN, FP, FN), Precision, Recall, F1, FPR, Accuracy.
- **Routers (`/backend/app/routers`)**:
  - `auth.py`: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.
  - `dashboard.py`: `/api/dashboard/summary` (real metrics, severity breakdown, classification distribution, AI security score).
  - `alerts.py`: CRUD operations, filtering, sorting, pagination, and `/api/alerts/{id}/analyze`.
  - `analyses.py`: Querying AI analysis histories and stats.
  - `datasets.py`: `/api/datasets/upload`, list, get, preview records, download sample CSVs.
  - `experiments.py`: Create, list, retrieve, run `/api/experiments/{id}/run`, track progress.
  - `metrics.py`: `/api/metrics/{experiment_id}`, compare with traditional baseline rules.
  - `reports.py`: `/api/reports/{experiment_id}` summary data, export CSV.
- **Seed Script (`/backend/app/utils/seed_data.py`)**:
  - Populates admin user (`admin@threatdna.ai` / `Admin@123456`) and 30+ diverse synthetic IDS alerts and sample dataset for immediate experimentation.

### 3. Frontend Implementation (`/frontend`)
- **Theme & Design System**:
  - Custom Tailwind config matching required dark SOC palette: `#050505` bg, `#0B0B0B` surface, `#111111` card, `#242424` border, `#EF4444` cyber red, `#22C55E` cyber green, monospace font for IPs/ports/logs.
  - Custom glowing badges, terminal scanline effects, animated status spinners, and glassmorphism.
- **Pages & Components**:
  - `Layout`: Sidebar navigation, active route highlights, operational status indicator, analyst user menu, breadcrumbs.
  - `Login / Register`: Cyber-styled terminal authentication card with JWT handling.
  - `Dashboard`:
    * Real-time SOC header & status.
    * 8 Security overview metric cards (Total, Critical, High, Med, Low, False Positives, True Positives, AI Analyzed).
    * Dynamic AI Alert Analysis Score circular gauge with mathematical explanation modal/tooltip.
    * 6 Recharts visualizations (Alerts over time, Severity distribution, Malicious vs Benign donut, TP vs FP, AI Confidence histogram, P1-P4 priority distribution).
    * Live Alert Feed table with status updates and quick analysis modal.
  - `Alerts`: Filterable, searchable, sortable, paginated table with alert creation modal, delete confirmation, and deep-dive drawer.
  - `Alert Details Modal`: Technical log inspector (IPs, ports, protocols, raw log) + AI threat breakdown (Priority, False Positive Likelihood, concise security justification, recommended action).
  - `Alert Analysis Workbench`: Paste raw syslog/Snort/Suricata log or select alert, multi-step analysis progress visualizer, real-time LLM inference, and save-to-database action.
  - `Datasets`: Drag-and-drop CSV uploader, schema detection, row preview table, ground-truth column selector, pre-bundled academic sample datasets download.
  - `Experiments`: Multi-step experiment launcher (Dataset selection -> Ground-truth mapping -> LLM Provider & Model selection -> Sample size config), live execution progress bar, experiment runs history table with statuses (`PENDING`, `RUNNING`, `COMPLETED`, `FAILED`).
  - `Metrics`: Experiment selector, KPI cards (Precision, Recall, F1, FPR, Accuracy), interactive 2x2 Confusion Matrix grid, Precision-Recall & ROC-style charts, dynamic Traditional IDS vs LLM comparative benchmark table.
  - `Reports`: Comprehensive research findings report builder with printable PDF layout, export to CSV, key observations, and experiment metadata.
  - `Settings`: LLM API configuration viewer, database health check, system telemetry.

### 4. Comprehensive Documentation (`README.md`)
- Complete manual covering all 23+ topics with setup commands, architectural diagrams, metric math formulas, research integrity statements, and troubleshooting guides.

---

## Verification Plan

### Automated & Unit Verification
1. Backend tests: Verify FastAPI endpoints with `pytest` (Auth, Alerts CRUD, Analysis logic, Metrics computation, CSV upload).
2. Frontend build verification: Run `npm run build` with zero TypeScript or bundling errors.
3. Database seeding: Execute seed script to ensure schema initialization, user creation, and synthetic records loading.

### Full-Stack End-to-End Verification
1. Start backend on `http://localhost:8000` and frontend on `http://localhost:5173`.
2. Authenticate as SOC analyst.
3. Verify live dashboard metrics and charts pulling from backend database.
4. Perform live AI Alert Analysis on raw IDS log and save result.
5. Upload a test CSV dataset, run an academic experiment, and verify computed Confusion Matrix, Precision, Recall, F1, and FPR.
6. Verify Traditional vs LLM comparative metrics.
7. Export experiment report to CSV and inspect generated data.
