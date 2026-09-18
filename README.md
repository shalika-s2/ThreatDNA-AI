# ThreatDNA-AI
### AI-Powered IDS Alert Analysis & Prioritization Platform

> **Academic Cybersecurity Research Platform** investigating whether Large Language Models (LLMs) can reduce false positives, accurately classify intrusion detection telemetry, and prioritize alerts for Security Operations Center (SOC) analysts.

---

## 1. Overview

**ThreatDNA-AI** is a full-stack, production-grade cybersecurity research and SOC operations platform. Traditional Intrusion Detection Systems (IDS) such as Snort, Suricata, and Zeek generate tens of thousands of alerts per day—up to **95% of which can be benign false positives or low-priority background noise**. This causes acute **analyst fatigue**, increases dwell time, and heightens the risk of missing sophisticated multi-stage intrusions.

ThreatDNA-AI integrates Large Language Models (Google Gemini, OpenAI, and heuristic baseline engines) to:
* Automatically analyze raw alert payloads and network telemetry.
* Calculate false-positive likelihoods.
* Assign dynamic operational severity and triage priority (`P1 Critical` to `P4 Low`).
* Provide concise, actionable security justifications and mitigation instructions.
* Run reproducible empirical experiments on intrusion datasets (e.g., CIC-IDS, NSL-KDD, synthetic benchmark datasets).
* Calculate Confusion Matrices, Precision, Recall, F1 Score, and False Positive Rates (FPR).

---

## 2. Core Research Objective

```text
Traditional IDS Alerts / Datasets
               ↓
        Alert Processing
               ↓
          LLM Analysis
               ↓
         Classification
               ↓
    False Positive Assessment
               ↓
        Severity & Priority
               ↓
       Research Evaluation
               ↓
  Precision / Recall / F1 / FPR
               ↓
      SOC Research Dashboard
```

The core research question investigated is:
> *Can Large Language Models effectively differentiate between genuine cyber attacks and benign anomalies to reduce SOC false positives without degrading detection sensitivity (recall)?*

---

## 3. System Architecture

```text
                                 THREATDNA-AI
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
      React 18 + Vite + TS                             FastAPI Backend
   (Dark SOC Design System)                         (REST APIs + Pydantic v2)
  ├── TailwindCSS Custom Theme                                │
  ├── Recharts Visualizations                 ┌───────────────┴───────────────┐
  ├── Live SOC Alert Feed                     ▼                               ▼
  ├── AI Triage Workbench              SQLAlchemy ORM                 LLM Abstraction Layer
  ├── Dataset & CSV Manager         (MySQL 8+ / SQLite)           (Google Gemini / OpenAI /
  ├── Experiment Engine                       │                    Research Heuristic Engine)
  ├── Research Metrics Dashboard              ▼                               ▼
  └── Report Generator & Exporter        Data Layer                  Structured Output
                                    (Users, Alerts,             (Classification, Priority,
                                     Experiments, Metrics)       FP Likelihood, Mitigation)
```

---

## 4. Technology Stack

### Frontend
* **Core**: React 18, Vite, TypeScript
* **Styling**: Tailwind CSS (Dark SOC theme: `#050505` bg, `#111111` card, `#EF4444` cyber red, `#22C55E` cyber green, `#06B6D4` cyber cyan)
* **Routing**: React Router v6
* **Visualizations**: Recharts
* **Icons**: Lucide React
* **HTTP Client**: Axios with JWT interceptors

### Backend
* **Runtime**: Python 3.11+ / 3.12+
* **Framework**: FastAPI, Uvicorn
* **ORM & Database**: SQLAlchemy 2.0, PyMySQL / SQLite
* **Authentication**: JWT (`python-jose`), Passlib with Bcrypt
* **Data Science**: Pandas, NumPy, Scikit-learn
* **LLM SDKs**: Google GenAI, OpenAI, HTTPX async clients

### Database
* **Primary**: MySQL 8.0+
* **Fallback**: SQLite 3 (automatic zero-config local fallback if MySQL is unconfigured)

---

## 5. Project Directory Structure

```text
ThreatDNA-AI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/           # MetricCard, Badges, Header, Sidebar, Modal, ScoreGauge
│   │   ├── context/              # AuthContext (JWT state)
│   │   ├── layouts/              # DashboardLayout (Master SOC layout)
│   │   ├── pages/                # Login, Dashboard, Alerts, Analysis, Datasets, Experiments, Metrics, Reports, Settings
│   │   ├── services/             # Axios REST API client
│   │   ├── types/                # TypeScript data interfaces
│   │   ├── App.tsx               # Routes & protected route guards
│   │   ├── main.tsx              # Entry point
│   │   └── index.css             # Tailwind base & cyber effects
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/
│   ├── app/
│   │   ├── core/                 # config.py, database.py, security.py
│   │   ├── models/               # SQLAlchemy models (User, Alert, AIAnalysis, Dataset, Experiment, Metric)
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── prompts/              # Strict LLM prompt templates (no chain-of-thought leakage)
│   │   ├── services/             # LLMService, DatasetService, ExperimentService, MetricsService
│   │   ├── routers/              # Auth, Dashboard, Alerts, Analyses, Datasets, Experiments, Metrics, Reports
│   │   ├── utils/                # Seed script with realistic synthetic demo alerts
│   │   └── main.py               # FastAPI application entry point
│   ├── tests/                    # Automated pytest test suite
│   ├── requirements.txt
│   └── .env.example
│
├── database/
│   └── schema.sql                # Complete MySQL 8+ DDL schema with indexes and foreign keys
│
├── uploads/
│   └── sample_datasets/          # Synthetic benchmark CSVs
│
├── README.md
└── .gitignore
```

---

## 6. MySQL Database Setup

### Step 1: Install MySQL 8.0+
Ensure MySQL 8.0+ is installed and running on Windows or Linux.

### Step 2: Create Database and Apply Schema
Open PowerShell or MySQL CLI:
```bash
mysql -u root -p
```
Run the DDL script:
```sql
CREATE DATABASE IF NOT EXISTS threatdna_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE threatdna_ai;
SOURCE d:/Cyber security/ThreatDNA-AI/database/schema.sql;
```

---

## 7. Backend Installation & Setup

1. Open PowerShell and navigate to the backend directory:
   ```powershell
   cd "d:\Cyber security\ThreatDNA-AI\backend"
   ```

2. (Optional) Create and activate a Python virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Install required Python packages:
   ```powershell
   pip install -r requirements.txt
   ```

4. Configure the environment:
   Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
   Edit `.env` as needed:
   ```env
   # MySQL connection:
   DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/threatdna_ai

   # Or SQLite (default):
   # DATABASE_URL=sqlite:///./threatdna_ai.db

   JWT_SECRET_KEY=threatdna_ai_super_secret_cyber_security_jwt_key_2026_soc_platform
   LLM_PROVIDER=gemini
   LLM_MODEL=gemini-2.5-flash
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. Run database initialization and synthetic seed data:
   ```powershell
   python -m app.utils.seed_data
   ```

6. Start the FastAPI server:
   ```powershell
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
   ```
   Backend API docs will be available at: `http://localhost:8001/docs`

---

## 8. Frontend Installation & Setup

1. Open a new PowerShell terminal and navigate to the frontend directory:
   ```powershell
   cd "d:\Cyber security\ThreatDNA-AI\frontend"
   ```

2. Install Node dependencies:
   ```powershell
   npm install
   ```

3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   Frontend will run at: `http://localhost:5173`

---

## 9. Default Demo Credentials

ThreatDNA-AI comes pre-seeded with an initial administrator / SOC lead analyst account:

* **Email**: `admin@threatdna.ai`
* **Password**: `Admin@123456`
* **Role**: `Lead SOC Analyst`

You can also register new analyst accounts directly via the **Analyst Authentication** login page.

---

## 10. Platform Walkthrough & Core Workflows

### A. Real-Time SOC Command Center (`/dashboard`)
* View 8 live telemetry cards: Total Alerts, Critical, High, Medium, Low, False Positives, True Positives, and AI Analyzed.
* Inspect the dynamic **AI Alert Analysis Score** with circular gauge and math formula breakdown.
* Analyze 6 interactive Recharts charts: Alerts over time, severity distributions, malicious vs benign donut chart, and priority queue distributions.
* Live Alert Feed table with instant modal log inspection.

### B. Alert Management (`/alerts`)
* Filter alerts by Severity, Status (`NEW`, `INVESTIGATING`, `ESCALATED`, `RESOLVED`, `FALSE_POSITIVE`), and Attack Type.
* Ingest new custom IDS alerts.
* Trigger 1-click AI triage on any alert.

### C. AI Alert Analysis Workbench (`/analysis`)
* Paste raw syslog/Snort/Suricata payloads or select existing alerts.
* Choose model provider (Gemini, OpenAI, or Heuristic Analyzer).
* Click **ANALYZE WITH AI** and observe real-time status progression (`[✓] Processing IDS alert`, `[✓] Evaluating threat indicators`, etc.).
* Review structured JSON output: Classification, Severity, Priority, Confidence, False Positive Likelihood, concise security justification, and actionable remediation instructions.
* Save the analyzed alert directly to the database.

### D. Dataset Repository (`/datasets`)
* Drag and drop benchmark CSV datasets (e.g. CIC-IDS, NSL-KDD, synthetic benchmarks).
* Automatic schema detection, column mapping, and record preview.
* Select or change the ground-truth label column.

### E. Research Experiments Module (`/experiments`)
* Launch reproducible experiments by configuring dataset, sample size, model architecture, and provider.
* Live execution tracking (`PENDING`, `RUNNING`, `COMPLETED`, `FAILED`).
* Deep-dive prediction viewer comparing model predictions against ground truth for every sample.

### F. Dedicated Research Metrics (`/metrics`)
* Select any completed experiment to inspect:
  * **Precision**
  * **Recall (Sensitivity)**
  * **F1 Score**
  * **False Positive Rate (FPR)**
  * **Accuracy**
* Interactive **2×2 Confusion Matrix** (`TP`, `TN`, `FP`, `FN`).
* Dynamic **Traditional Signature IDS vs. ThreatDNA-AI LLM Pipeline** comparative benchmark table.

### G. Executive & Academic Reports (`/reports`)
* View standardized research findings reports.
* Export evaluation results to CSV for external statistical analysis.
* Print or save executive PDF reports.

---

## 11. Mathematical Definitions of Research Metrics

### 1. Confusion Matrix
| | Predicted Malicious | Predicted Benign |
|---|---|---|
| **Actual Malicious** | **True Positive (TP)** | **False Negative (FN)** |
| **Actual Benign** | **False Positive (FP)** | **True Negative (TN)** |

### 2. Precision
$$\text{Precision} = \frac{TP}{TP + FP}$$
*Measures the proportion of alerts flagged as malicious that were genuine security threats.*

### 3. Recall (Detection Rate / Sensitivity)
$$\text{Recall} = \frac{TP}{TP + FN}$$
*Measures the proportion of actual malicious events that were successfully identified.*

### 4. F1 Score
$$\text{F1} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$
*Harmonic mean balancing precision and recall into a single unified benchmark.*

### 5. False Positive Rate (FPR)
$$\text{FPR} = \frac{FP}{FP + TN}$$
*Measures the proportion of benign events erroneously escalated to SOC analysts.*

### 6. AI Alert Analysis Score
$$\text{Score} = (\text{Precision} \times 40) + ((1 - \text{FPR}) \times 30) + (\text{Avg Confidence} \times 20) + (\text{Coverage} \times 10)$$

---

## 12. Security Controls & Best Practices

* **No Frontend Secrets**: API keys (Gemini, OpenAI) are strictly loaded in backend environment variables and never sent to the browser.
* **JWT Authentication**: High-entropy HMAC-SHA256 tokens with configurable expiration.
* **Password Hashing**: Salted Bcrypt encryption.
* **SQL Injection Prevention**: SQLAlchemy parameterized ORM queries.
* **Input Sanitization**: Pydantic v2 request body schema validation and file upload inspection.
* **CORS**: Configurable whitelist restricted to authorized frontend origins.

---

## 13. Research Integrity & Limitations

1. **Synthetic vs. Real-World Telemetry**: All preloaded alerts and sample datasets are explicitly labeled as `SYNTHETIC DEMO DATA` to ensure research transparency.
2. **Ground Truth Independence**: LLM predictions are never treated as ground truth; they are rigorously compared against independent dataset labels.
3. **Latency & Throughput**: In production environments processing 100,000+ packets/sec, LLM analysis is recommended for Tier-2/Tier-3 triage queues rather than inline packet filtering.
4. **Reproducibility**: All experiment configurations, timestamps, model versions, and prediction logs are persisted in the database.

---

## 14. Testing & Verification

Run the automated backend test suite:
```powershell
cd "d:\Cyber security\ThreatDNA-AI\backend"
python -m pytest tests/test_api.py -v
```

Run frontend build check:
```powershell
cd "d:\Cyber security\ThreatDNA-AI\frontend"
npm run build
```

---

## License
ThreatDNA-AI is developed for Academic Cybersecurity Research and Educational Evaluation.
#   T h r e a t D N A - A I - W a l k t h r o u g h - V e r i f i c a t i o n - R e p o r t  
 