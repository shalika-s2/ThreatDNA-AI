-- ThreatDNA-AI Database Schema (MySQL 8+)
-- Academic Cybersecurity Research Platform for IDS Alert Analysis & Prioritization

CREATE DATABASE IF NOT EXISTS threatdna_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE threatdna_ai;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'analyst',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
) ENGINE=InnoDB;

-- 2. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id VARCHAR(32) NOT NULL UNIQUE,
    timestamp DATETIME NOT NULL,
    source_ip VARCHAR(45) NOT NULL,
    destination_ip VARCHAR(45) NOT NULL,
    source_port INT,
    destination_port INT,
    protocol VARCHAR(16) NOT NULL,
    attack_type VARCHAR(64) NOT NULL,
    signature VARCHAR(255) NOT NULL,
    raw_log TEXT NOT NULL,
    severity VARCHAR(16) NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
    status VARCHAR(32) NOT NULL DEFAULT 'NEW', -- NEW, INVESTIGATING, ESCALATED, RESOLVED, FALSE_POSITIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_alerts_alert_id (alert_id),
    INDEX idx_alerts_severity (severity),
    INDEX idx_alerts_status (status),
    INDEX idx_alerts_timestamp (timestamp),
    INDEX idx_alerts_attack_type (attack_type)
) ENGINE=InnoDB;

-- 3. AI Analyses Table
CREATE TABLE IF NOT EXISTS ai_analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id INT NOT NULL,
    provider VARCHAR(32) NOT NULL,
    model VARCHAR(64) NOT NULL,
    classification VARCHAR(32) NOT NULL, -- malicious, benign, suspicious
    severity VARCHAR(16) NOT NULL,       -- critical, high, medium, low
    priority VARCHAR(8) NOT NULL,         -- P1, P2, P3, P4
    confidence FLOAT NOT NULL,
    false_positive_likelihood FLOAT NOT NULL,
    reason TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    INDEX idx_ai_analyses_alert_id (alert_id),
    INDEX idx_ai_analyses_classification (classification),
    INDEX idx_ai_analyses_priority (priority)
) ENGINE=InnoDB;

-- 4. Datasets Table
CREATE TABLE IF NOT EXISTS datasets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    row_count INT NOT NULL DEFAULT 0,
    column_count INT NOT NULL DEFAULT 0,
    ground_truth_column VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_datasets_name (name)
) ENGINE=InnoDB;

-- 5. Experiments Table
CREATE TABLE IF NOT EXISTS experiments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dataset_id INT NOT NULL,
    name VARCHAR(128) NOT NULL,
    provider VARCHAR(32) NOT NULL,
    model VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, RUNNING, COMPLETED, FAILED
    total_records INT NOT NULL DEFAULT 0,
    sample_size INT NOT NULL DEFAULT 0,
    error_message TEXT,
    started_at DATETIME,
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
    INDEX idx_experiments_status (status),
    INDEX idx_experiments_dataset (dataset_id)
) ENGINE=InnoDB;

-- 6. Experiment Results Table
CREATE TABLE IF NOT EXISTS experiment_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    experiment_id INT NOT NULL,
    record_id INT NOT NULL,
    ground_truth VARCHAR(32) NOT NULL,
    prediction VARCHAR(32) NOT NULL,
    confidence FLOAT NOT NULL,
    severity VARCHAR(16) NOT NULL,
    priority VARCHAR(8) NOT NULL,
    fp_likelihood FLOAT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
    INDEX idx_exp_res_experiment (experiment_id),
    INDEX idx_exp_res_is_correct (is_correct)
) ENGINE=InnoDB;

-- 7. Metrics Table
CREATE TABLE IF NOT EXISTS metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    experiment_id INT NOT NULL UNIQUE,
    true_positive INT NOT NULL DEFAULT 0,
    true_negative INT NOT NULL DEFAULT 0,
    false_positive INT NOT NULL DEFAULT 0,
    false_negative INT NOT NULL DEFAULT 0,
    precision_score FLOAT NOT NULL DEFAULT 0.0,
    recall_score FLOAT NOT NULL DEFAULT 0.0,
    f1_score FLOAT NOT NULL DEFAULT 0.0,
    false_positive_rate FLOAT NOT NULL DEFAULT 0.0,
    accuracy_score FLOAT NOT NULL DEFAULT 0.0,
    total_samples INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
    INDEX idx_metrics_experiment (experiment_id)
) ENGINE=InnoDB;
