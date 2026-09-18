from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, init_db
from app.utils.seed_data import seed_database

# Initialize database schema and seeds for tests
init_db()
seed_database()

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["system"] == "OPERATIONAL"

def test_auth_login():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@threatdna.ai", "password": "Admin@123456"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@threatdna.ai"

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "summary_cards" in data
    assert data["summary_cards"]["total_alerts"] >= 10
    assert "ai_security_score" in data
    assert 0 <= data["ai_security_score"]["overall_score"] <= 100

def test_alerts_list_and_create():
    # 1. List alerts
    list_resp = client.get("/api/alerts?page=1&page_size=10")
    assert list_resp.status_code == 200
    alerts_data = list_resp.json()
    assert alerts_data["total"] >= 10

    # 2. Create alert
    new_alert = {
        "source_ip": "203.0.113.15",
        "destination_ip": "10.0.0.8",
        "protocol": "TCP",
        "attack_type": "Test SQLi Probe",
        "signature": "ET WEB_SPECIFIC_APPS SQL Injection Test",
        "raw_log": "GET /test?id=1%20OR%201=1 HTTP/1.1",
        "severity": "HIGH",
        "status": "NEW"
    }
    create_resp = client.post("/api/alerts", json=new_alert)
    assert create_resp.status_code == 201
    created_data = create_resp.json()
    assert created_data["source_ip"] == "203.0.113.15"

    # 3. Analyze alert with AI
    alert_id = created_data["id"]
    analyze_resp = client.post(f"/api/alerts/{alert_id}/analyze")
    assert analyze_resp.status_code == 200
    ai_data = analyze_resp.json()
    assert ai_data["classification"] in ["malicious", "benign", "suspicious"]
    assert ai_data["priority"] in ["P1", "P2", "P3", "P4"]

def test_raw_log_interactive_analysis():
    payload = {
        "raw_log": "GET /login.php?user=admin' OR '1'='1'-- HTTP/1.1\r\nHost: target.corp",
        "source_ip": "198.51.100.22",
        "destination_ip": "10.0.0.14",
        "attack_type": "SQL Injection"
    }
    response = client.post("/api/analyses/raw", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["classification"] == "malicious"
    assert data["priority"] in ["P1", "P2"]
    assert "reason" in data
    assert "recommended_action" in data

def test_datasets_and_preview():
    datasets_resp = client.get("/api/datasets")
    assert datasets_resp.status_code == 200
    datasets = datasets_resp.json()
    assert len(datasets) > 0
    ds_id = datasets[0]["id"]

    preview_resp = client.get(f"/api/datasets/{ds_id}/preview?nrows=5")
    assert preview_resp.status_code == 200
    preview_data = preview_resp.json()
    assert len(preview_data["sample_rows"]) > 0

def test_experiment_metrics_and_reports():
    exp_resp = client.get("/api/experiments")
    assert exp_resp.status_code == 200
    exps = exp_resp.json()
    assert len(exps) > 0
    exp_id = exps[0]["id"]

    # Metrics
    metrics_resp = client.get(f"/api/metrics/{exp_id}")
    assert metrics_resp.status_code == 200
    m_data = metrics_resp.json()
    assert "precision_score" in m_data
    assert "recall_score" in m_data
    assert "f1_score" in m_data
    assert "false_positive_rate" in m_data

    # Traditional comparison
    comp_resp = client.get(f"/api/metrics/{exp_id}/comparison")
    assert comp_resp.status_code == 200
    comps = comp_resp.json()
    assert len(comps) >= 4

    # Report
    report_resp = client.get(f"/api/reports/{exp_id}")
    assert report_resp.status_code == 200
    report_data = report_resp.json()
    assert len(report_data["key_findings"]) > 0

    # CSV Export
    csv_resp = client.get(f"/api/reports/{exp_id}/export-csv")
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers["content-type"]
