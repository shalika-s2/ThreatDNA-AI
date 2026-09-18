import logging
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.experiment import Experiment, ExperimentResult
from app.models.dataset import Dataset
from app.models.metric import Metric
from app.services.dataset_service import DatasetService
from app.services.llm_service import LLMService
from app.services.metrics_service import MetricsService, normalize_label

logger = logging.getLogger(__name__)

class ExperimentService:
    @staticmethod
    async def run_experiment_pipeline(
        experiment_id: int,
        db: Session
    ) -> Dict[str, Any]:
        experiment = db.query(Experiment).filter(Experiment.id == experiment_id).first()
        if not experiment:
            raise ValueError("Experiment not found.")

        dataset = db.query(Dataset).filter(Dataset.id == experiment.dataset_id).first()
        if not dataset:
            experiment.status = "FAILED"
            experiment.error_message = "Associated dataset not found."
            db.commit()
            raise ValueError("Dataset not found.")

        experiment.status = "RUNNING"
        experiment.started_at = datetime.now()
        experiment.error_message = None
        db.commit()

        try:
            # 1. Load dataset sample
            samples = DatasetService.load_sample_for_experiment(
                file_path=dataset.file_path,
                ground_truth_col=dataset.ground_truth_column,
                sample_size=experiment.sample_size or 20
            )

            # Clear previous results if re-running
            db.query(ExperimentResult).filter(ExperimentResult.experiment_id == experiment.id).delete()
            db.query(Metric).filter(Metric.experiment_id == experiment.id).delete()
            db.commit()

            llm_service = LLMService(
                provider=experiment.provider,
                model=experiment.model
            )

            ground_truths = []
            predictions = []

            for idx, row in enumerate(samples):
                gt_val = str(row.get(dataset.ground_truth_column, "benign"))
                norm_gt = normalize_label(gt_val)
                ground_truths.append(norm_gt)

                # Construct log from row values
                raw_log = row.get("raw_payload") or row.get("raw_log") or str(row)
                src_ip = str(row.get("source_ip", "192.168.1.100"))
                dst_ip = str(row.get("destination_ip", "10.0.0.5"))
                src_port = str(row.get("source_port", "0"))
                dst_port = str(row.get("destination_port", "80"))
                protocol = str(row.get("protocol", "TCP"))
                attack_type = str(row.get("attack_type", "Generic"))
                signature = str(row.get("signature", "IDS Detection Pattern"))

                # Run analysis
                analysis_res = await llm_service.analyze_alert(
                    raw_log=raw_log,
                    source_ip=src_ip,
                    destination_ip=dst_ip,
                    source_port=src_port,
                    destination_port=dst_port,
                    protocol=protocol,
                    attack_type=attack_type,
                    signature=signature
                )

                norm_pred = normalize_label(analysis_res.classification)
                predictions.append(norm_pred)
                is_correct = (norm_gt == norm_pred)

                # Save record result
                exp_res = ExperimentResult(
                    experiment_id=experiment.id,
                    record_id=idx + 1,
                    ground_truth=norm_gt,
                    prediction=norm_pred,
                    confidence=analysis_res.confidence,
                    severity=analysis_res.severity.upper(),
                    priority=analysis_res.priority,
                    fp_likelihood=analysis_res.false_positive_likelihood,
                    is_correct=is_correct
                )
                db.add(exp_res)

            # 2. Compute academic research metrics
            computed_metrics = MetricsService.compute_metrics(ground_truths, predictions)

            # Save Metric
            metric_record = Metric(
                experiment_id=experiment.id,
                true_positive=computed_metrics["true_positive"],
                true_negative=computed_metrics["true_negative"],
                false_positive=computed_metrics["false_positive"],
                false_negative=computed_metrics["false_negative"],
                precision_score=computed_metrics["precision_score"],
                recall_score=computed_metrics["recall_score"],
                f1_score=computed_metrics["f1_score"],
                false_positive_rate=computed_metrics["false_positive_rate"],
                accuracy_score=computed_metrics["accuracy_score"],
                total_samples=computed_metrics["total_samples"]
            )
            db.add(metric_record)

            experiment.status = "COMPLETED"
            experiment.total_records = len(samples)
            experiment.completed_at = datetime.now()
            db.commit()

            return {
                "status": "COMPLETED",
                "experiment_id": experiment.id,
                "metrics": computed_metrics
            }

        except Exception as e:
            logger.error(f"Experiment {experiment_id} execution failed: {str(e)}", exc_info=True)
            experiment.status = "FAILED"
            experiment.error_message = str(e)
            experiment.completed_at = datetime.now()
            db.commit()
            raise e
