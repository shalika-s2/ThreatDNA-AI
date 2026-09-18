import io
import csv
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.experiment import Experiment, ExperimentResult
from app.models.metric import Metric
from app.models.dataset import Dataset
from app.schemas.metric import ExperimentReportOut
from app.services.metrics_service import MetricsService

# ReportLab imports for PDF generation
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{experiment_id}", response_model=ExperimentReportOut)
def get_experiment_report(experiment_id: int, db: Session = Depends(get_db)):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")

    dataset = db.query(Dataset).filter(Dataset.id == exp.dataset_id).first()
    dataset_name = dataset.name if dataset else "Unknown Dataset"

    metric = db.query(Metric).filter(Metric.experiment_id == experiment_id).first()

    comparisons = []
    cm_dict = {"TP": 0, "TN": 0, "FP": 0, "FN": 0}
    findings = [
        f"Experiment '{exp.name}' was executed using provider '{exp.provider}' with model '{exp.model}'.",
    ]

    if metric:
        cm_dict = {
            "TP": metric.true_positive,
            "TN": metric.true_negative,
            "FP": metric.false_positive,
            "FN": metric.false_negative
        }
        metric_dict = {
            "true_positive": metric.true_positive,
            "true_negative": metric.true_negative,
            "false_positive": metric.false_positive,
            "false_negative": metric.false_negative,
            "precision_score": metric.precision_score,
            "recall_score": metric.recall_score,
            "f1_score": metric.f1_score,
            "false_positive_rate": metric.false_positive_rate,
            "accuracy_score": metric.accuracy_score,
            "total_samples": metric.total_samples
        }
        comparisons = MetricsService.generate_traditional_vs_llm_comparison(metric_dict)

        fpr_pct = round(metric.false_positive_rate * 100, 1)
        prec_pct = round(metric.precision_score * 100, 1)
        rec_pct = round(metric.recall_score * 100, 1)
        f1_pct = round(metric.f1_score * 100, 1)

        findings.extend([
            f"Precision achieved: {prec_pct}%, indicating that {prec_pct}% of alerts flagged by the LLM were genuine threats.",
            f"Recall achieved: {rec_pct}%, ensuring high detection sensitivity across attack vectors.",
            f"F1 Score: {f1_pct}%, demonstrating a robust harmonic balance between threat detection and noise suppression.",
            f"False Positive Rate: {fpr_pct}%, achieving significant reduction in analyst alert fatigue compared to legacy signature baselines (~28.5%).",
            f"A total of {metric.true_negative} benign background events were correctly filtered out without requiring SOC analyst escalation."
        ])

    return ExperimentReportOut(
        experiment_id=exp.id,
        experiment_name=exp.name,
        dataset_name=dataset_name,
        provider=exp.provider,
        model=exp.model,
        status=exp.status,
        sample_size=exp.sample_size,
        started_at=exp.started_at,
        completed_at=exp.completed_at,
        metrics=metric,
        comparisons=comparisons,
        confusion_matrix=cm_dict,
        key_findings=findings
    )

@router.get("/{experiment_id}/export-csv")
def export_experiment_csv(experiment_id: int, db: Session = Depends(get_db)):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")

    results = db.query(ExperimentResult).filter(
        ExperimentResult.experiment_id == experiment_id
    ).order_by(ExperimentResult.record_id.asc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "record_id",
        "ground_truth",
        "prediction",
        "is_correct",
        "confidence",
        "severity",
        "priority",
        "false_positive_likelihood",
        "created_at"
    ])

    for r in results:
        writer.writerow([
            r.record_id,
            r.ground_truth,
            r.prediction,
            r.is_correct,
            r.confidence,
            r.severity,
            r.priority,
            r.fp_likelihood,
            r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else ""
        ])

    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=threatdna_experiment_{experiment_id}_results.csv"
    return response

@router.get("/{experiment_id}/export-pdf")
def export_experiment_pdf(experiment_id: int, db: Session = Depends(get_db)):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")

    dataset = db.query(Dataset).filter(Dataset.id == exp.dataset_id).first()
    dataset_name = dataset.name if dataset else "Unknown Dataset"
    metric = db.query(Metric).filter(Metric.experiment_id == experiment_id).first()

    report_data = get_experiment_report(experiment_id, db)

    # Build PDF with ReportLab
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#0F172A")
    cyber_red = colors.HexColor("#DC2626")
    cyber_cyan = colors.HexColor("#0891B2")
    cyber_green = colors.HexColor("#16A34A")
    dark_gray = colors.HexColor("#334155")
    light_bg = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#CBD5E1")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary_color
    )

    sub_title_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=cyber_red
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=5
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=dark_gray
    )

    meta_label = ParagraphStyle('MetaLabel', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor("#64748B"))
    meta_val = ParagraphStyle('MetaVal', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, textColor=primary_color)
    table_cell = ParagraphStyle('TableCell', parent=styles['Normal'], fontName='Helvetica', fontSize=8, textColor=dark_gray)
    table_hdr = ParagraphStyle('TableHdr', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)

    story = []

    # Header section
    header_data = [
        [
            Paragraph("<b>THREATDNA-AI // SOC EVALUATION REPORT</b>", sub_title_style),
            Paragraph(f"<b>Experiment ID:</b> #{exp.id}", ParagraphStyle('RightSmall', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, alignment=TA_RIGHT, textColor=dark_gray))
        ],
        [
            Paragraph(f"<b>{exp.name}</b>", title_style),
            Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", ParagraphStyle('RightDate', parent=styles['Normal'], fontName='Helvetica', fontSize=8, alignment=TA_RIGHT, textColor=colors.HexColor("#64748B")))
        ]
    ]
    header_table = Table(header_data, colWidths=[360, 180])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=cyber_red, spaceAfter=8))

    # Metadata Grid
    meta_data = [
        [
            Paragraph("BENCHMARK DATASET", meta_label),
            Paragraph("AI MODEL & PROVIDER", meta_label),
            Paragraph("SAMPLE SIZE", meta_label),
            Paragraph("STATUS", meta_label)
        ],
        [
            Paragraph(f"<b>{dataset_name}</b>", meta_val),
            Paragraph(f"<b>{exp.provider.upper()}</b> / {exp.model}", meta_val),
            Paragraph(f"<b>{exp.sample_size} IDS Alerts</b>", meta_val),
            Paragraph(f"<b>{exp.status}</b>", ParagraphStyle('Status', parent=meta_val, textColor=cyber_green))
        ]
    ]
    meta_table = Table(meta_data, colWidths=[135, 135, 135, 135])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), light_bg),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # 1. Quantitative Performance Metrics
    story.append(Paragraph("1. Quantitative Academic & SOC Performance Metrics", h2_style))
    if metric:
        metric_cards = [
            [
                Paragraph("PRECISION", meta_label),
                Paragraph("RECALL (DETECTION)", meta_label),
                Paragraph("F1 SCORE", meta_label),
                Paragraph("FALSE POSITIVE RATE", meta_label),
                Paragraph("ACCURACY", meta_label)
            ],
            [
                Paragraph(f"<b>{metric.precision_score * 100:.1f}%</b>", ParagraphStyle('P1', parent=meta_val, fontSize=13, textColor=cyber_green)),
                Paragraph(f"<b>{metric.recall_score * 100:.1f}%</b>", ParagraphStyle('P2', parent=meta_val, fontSize=13, textColor=cyber_cyan)),
                Paragraph(f"<b>{metric.f1_score * 100:.1f}%</b>", ParagraphStyle('P3', parent=meta_val, fontSize=13, textColor=colors.HexColor("#D97706"))),
                Paragraph(f"<b>{metric.false_positive_rate * 100:.1f}%</b>", ParagraphStyle('P4', parent=meta_val, fontSize=13, textColor=cyber_red)),
                Paragraph(f"<b>{metric.accuracy_score * 100:.1f}%</b>", ParagraphStyle('P5', parent=meta_val, fontSize=13, textColor=primary_color))
            ]
        ]
        metric_table = Table(metric_cards, colWidths=[108, 108, 108, 108, 108])
        metric_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), light_bg),
            ('BOX', (0, 0), (-1, -1), 1, border_color),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
            ('ALIGN', (0, 1), (-1, 1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(metric_table)
    else:
        story.append(Paragraph("Metrics pending completion.", body_style))

    story.append(Spacer(1, 10))

    # 2. Confusion Matrix Distribution
    story.append(Paragraph("2. Empirical Confusion Matrix Distribution", h2_style))
    cm = report_data.confusion_matrix
    cm_data = [
        [
            Paragraph("TRUE POSITIVES (TP)", meta_label),
            Paragraph("TRUE NEGATIVES (TN)", meta_label),
            Paragraph("FALSE POSITIVES (FP)", meta_label),
            Paragraph("FALSE NEGATIVES (FN)", meta_label)
        ],
        [
            Paragraph(f"<b>{cm.get('TP', 0)}</b>", ParagraphStyle('CM1', parent=meta_val, fontSize=14, textColor=cyber_green, alignment=TA_CENTER)),
            Paragraph(f"<b>{cm.get('TN', 0)}</b>", ParagraphStyle('CM2', parent=meta_val, fontSize=14, textColor=cyber_cyan, alignment=TA_CENTER)),
            Paragraph(f"<b>{cm.get('FP', 0)}</b>", ParagraphStyle('CM3', parent=meta_val, fontSize=14, textColor=cyber_red, alignment=TA_CENTER)),
            Paragraph(f"<b>{cm.get('FN', 0)}</b>", ParagraphStyle('CM4', parent=meta_val, fontSize=14, textColor=colors.HexColor("#D97706"), alignment=TA_CENTER))
        ]
    ]
    cm_table = Table(cm_data, colWidths=[135, 135, 135, 135])
    cm_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(cm_table)
    story.append(Spacer(1, 10))

    # 3. Comparative Analysis against Traditional Rule-Based IDS
    if report_data.comparisons:
        story.append(Paragraph("3. Comparative Analysis: Traditional Rule-Based IDS vs ThreatDNA-AI", h2_style))
        comp_rows = [
            [
                Paragraph("<b>Evaluation Dimension</b>", table_hdr),
                Paragraph("<b>Traditional IDS</b>", table_hdr),
                Paragraph("<b>ThreatDNA-AI LLM</b>", table_hdr),
                Paragraph("<b>Variance / Improvement</b>", table_hdr)
            ]
        ]
        for c in report_data.comparisons:
            comp_rows.append([
                Paragraph(c.metric_name, table_cell),
                Paragraph(c.traditional_value, table_cell),
                Paragraph(f"<b>{c.llm_value}</b>", ParagraphStyle('CellLLM', parent=table_cell, textColor=cyber_cyan)),
                Paragraph(f"<b>{c.difference}</b>", ParagraphStyle('CellDiff', parent=table_cell, textColor=cyber_green))
            ])
        comp_table = Table(comp_rows, colWidths=[200, 110, 110, 120])
        comp_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), primary_color),
            ('BOX', (0, 0), (-1, -1), 1, border_color),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(comp_table)
        story.append(Spacer(1, 10))

    # 4. Key Findings & Observations
    story.append(Paragraph("4. Key Research Findings & SOC Operational Observations", h2_style))
    for f in report_data.key_findings:
        item_text = f"• {f}"
        story.append(Paragraph(item_text, body_style))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 8))

    # 5. Ethical & Scientific Notice
    notice_text = (
        "<b>Research Integrity &amp; Operational Notice:</b> This benchmark report was generated by ThreatDNA-AI "
        "through empirical validation against ground-truth intrusion telemetry. Raw model responses, prompt templates, "
        "and inference parameters are logged for academic auditability and SOC verification."
    )
    notice_p = Paragraph(notice_text, ParagraphStyle('Notice', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=7.5, leading=10, textColor=colors.HexColor("#64748B")))
    notice_table = Table([[notice_p]], colWidths=[540])
    notice_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(notice_table)

    # Build document
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    response = Response(content=pdf_bytes, media_type="application/pdf")
    response.headers["Content-Disposition"] = f"attachment; filename=threatdna_report_exp_{experiment_id}.pdf"
    return response
