import logging
from typing import List, Dict, Any, Tuple
from app.schemas.metric import TraditionalComparisonItem

logger = logging.getLogger(__name__)

def normalize_label(val: Any) -> str:
    """Normalize label to binary classification: 'malicious' or 'benign'."""
    s = str(val).strip().lower()
    if s in ["1", "true", "malicious", "attack", "bad", "anomaly", "suspicious"]:
        return "malicious"
    return "benign"

class MetricsService:
    @staticmethod
    def compute_metrics(
        ground_truths: List[str],
        predictions: List[str]
    ) -> Dict[str, Any]:
        """
        Computes accurate academic evaluation metrics:
        - True Positives (TP): Actual Malicious & Predicted Malicious
        - True Negatives (TN): Actual Benign & Predicted Benign
        - False Positives (FP): Actual Benign & Predicted Malicious
        - False Negatives (FN): Actual Malicious & Predicted Benign
        - Precision: TP / (TP + FP)
        - Recall: TP / (TP + FN)
        - F1 Score: 2 * (Precision * Recall) / (Precision + Recall)
        - False Positive Rate: FP / (FP + TN)
        - Accuracy: (TP + TN) / Total
        """
        tp = 0
        tn = 0
        fp = 0
        fn = 0

        for gt, pred in zip(ground_truths, predictions):
            norm_gt = normalize_label(gt)
            norm_pred = normalize_label(pred)

            if norm_gt == "malicious" and norm_pred == "malicious":
                tp += 1
            elif norm_gt == "benign" and norm_pred == "benign":
                tn += 1
            elif norm_gt == "benign" and norm_pred == "malicious":
                fp += 1
            elif norm_gt == "malicious" and norm_pred == "benign":
                fn += 1

        total = tp + tn + fp + fn
        precision = (tp / (tp + fp)) if (tp + fp) > 0 else 0.0
        recall = (tp / (tp + fn)) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
        fpr = (fp / (fp + tn)) if (fp + tn) > 0 else 0.0
        accuracy = ((tp + tn) / total) if total > 0 else 0.0

        return {
            "true_positive": tp,
            "true_negative": tn,
            "false_positive": fp,
            "false_negative": fn,
            "precision_score": round(precision, 4),
            "recall_score": round(recall, 4),
            "f1_score": round(f1, 4),
            "false_positive_rate": round(fpr, 4),
            "accuracy_score": round(accuracy, 4),
            "total_samples": total
        }

    @staticmethod
    def generate_traditional_vs_llm_comparison(
        metrics: Dict[str, Any],
        baseline_fpr: float = 0.285,  # Typical legacy signature IDS FPR ~ 28.5%
        baseline_precision: float = 0.652,
        baseline_recall: float = 0.880,
        baseline_f1: float = 0.749
    ) -> List[TraditionalComparisonItem]:
        """Compares calculated LLM metrics against traditional rule-based IDS baseline."""
        llm_p = metrics.get("precision_score", 0.0)
        llm_r = metrics.get("recall_score", 0.0)
        llm_f1 = metrics.get("f1_score", 0.0)
        llm_fpr = metrics.get("false_positive_rate", 0.0)
        total = metrics.get("total_samples", 0)

        trad_fp_est = int(total * baseline_fpr)
        llm_fp_actual = metrics.get("false_positive", 0)
        fp_reduction = f"-{round(((trad_fp_est - llm_fp_actual) / max(trad_fp_est, 1)) * 100, 1)}%" if trad_fp_est >= llm_fp_actual else f"+{round(((llm_fp_actual - trad_fp_est) / max(trad_fp_est, 1)) * 100, 1)}%"

        diff_p = f"+{round((llm_p - baseline_precision) * 100, 1)}%" if llm_p >= baseline_precision else f"{round((llm_p - baseline_precision) * 100, 1)}%"
        diff_r = f"+{round((llm_r - baseline_recall) * 100, 1)}%" if llm_r >= baseline_recall else f"{round((llm_r - baseline_recall) * 100, 1)}%"
        diff_f1 = f"+{round((llm_f1 - baseline_f1) * 100, 1)}%" if llm_f1 >= baseline_f1 else f"{round((llm_f1 - baseline_f1) * 100, 1)}%"
        diff_fpr = f"-{round((baseline_fpr - llm_fpr) * 100, 1)}%" if baseline_fpr >= llm_fpr else f"+{round((llm_fpr - baseline_fpr) * 100, 1)}%"

        return [
            TraditionalComparisonItem(
                metric_name="Precision",
                traditional_value=f"{round(baseline_precision * 100, 1)}%",
                llm_value=f"{round(llm_p * 100, 1)}%",
                difference=diff_p,
                description="Proportion of flagged alerts that were genuine attacks."
            ),
            TraditionalComparisonItem(
                metric_name="Recall (Detection Rate)",
                traditional_value=f"{round(baseline_recall * 100, 1)}%",
                llm_value=f"{round(llm_r * 100, 1)}%",
                difference=diff_r,
                description="Proportion of actual malicious attacks successfully identified."
            ),
            TraditionalComparisonItem(
                metric_name="F1 Score",
                traditional_value=f"{round(baseline_f1 * 100, 1)}%",
                llm_value=f"{round(llm_f1 * 100, 1)}%",
                difference=diff_f1,
                description="Harmonic mean balancing precision and recall."
            ),
            TraditionalComparisonItem(
                metric_name="False Positive Rate (FPR)",
                traditional_value=f"{round(baseline_fpr * 100, 1)}%",
                llm_value=f"{round(llm_fpr * 100, 1)}%",
                difference=diff_fpr,
                description="Proportion of benign events erroneously flagged as attacks."
            ),
            TraditionalComparisonItem(
                metric_name="Alerts Requiring Triage",
                traditional_value=f"{trad_fp_est + metrics.get('true_positive', 0)} alerts",
                llm_value=f"{llm_fp_actual + metrics.get('true_positive', 0)} alerts",
                difference=fp_reduction,
                description="Total volume of escalated alerts presented to SOC analysts."
            )
        ]
