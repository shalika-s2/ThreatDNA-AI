import os
import json
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import UploadFile, HTTPException
from app.core.config import settings

class DatasetService:
    @staticmethod
    def read_dataset_file(file_path: str, nrows: Optional[int] = None) -> pd.DataFrame:
        """
        Reads any dataset file (CSV, JSON, JSONL, Excel, Parquet, TSV, TXT, LOG)
        into a clean pandas DataFrame.
        """
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Dataset file not found on disk.")

        ext = file_path.rsplit(".", 1)[-1].lower() if "." in file_path else ""

        try:
            if ext in ["xlsx", "xls"]:
                df = pd.read_excel(file_path, nrows=nrows)
            elif ext == "parquet":
                df = pd.read_parquet(file_path)
                if nrows is not None and len(df) > nrows:
                    df = df.head(nrows)
            elif ext in ["json", "jsonl"]:
                try:
                    # Attempt standard JSON read
                    df = pd.read_json(file_path, nrows=nrows)
                except Exception:
                    try:
                        # Attempt lines=True JSONL
                        df = pd.read_json(file_path, lines=True, nrows=nrows)
                    except Exception:
                        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                            raw = json.load(f)
                        if isinstance(raw, list):
                            df = pd.json_normalize(raw)
                            if nrows is not None:
                                df = df.head(nrows)
                        elif isinstance(raw, dict):
                            # Try common data keys or convert dict
                            data_key = next((k for k in ["data", "records", "items", "results"] if k in raw and isinstance(raw[k], list)), None)
                            if data_key:
                                df = pd.json_normalize(raw[data_key])
                            else:
                                df = pd.json_normalize([raw])
                            if nrows is not None:
                                df = df.head(nrows)
                        else:
                            raise ValueError("Unsupported JSON structure")
            elif ext in ["tsv", "tab"]:
                df = pd.read_csv(file_path, sep="\t", nrows=nrows, on_bad_lines="skip")
            else:
                # Default CSV / TXT / LOG / DAT with automatic separator detection fallback
                try:
                    df = pd.read_csv(file_path, nrows=nrows, on_bad_lines="skip")
                except Exception:
                    try:
                        df = pd.read_csv(file_path, sep=None, engine="python", nrows=nrows, on_bad_lines="skip")
                    except Exception:
                        # Fallback for plain unstructured text logs: single raw_log column
                        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                            lines = [line.strip() for line in f if line.strip()]
                        if nrows is not None:
                            lines = lines[:nrows]
                        df = pd.DataFrame({"raw_log": lines, "label": ["benign"] * len(lines)})

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse dataset file ({ext.upper()}): {str(e)}")

        # Ensure column names are strings and not empty
        df.columns = [str(c).strip() if str(c).strip() else f"column_{i}" for i, c in enumerate(df.columns)]
        return df

    @classmethod
    def save_and_inspect_dataset(cls, file: UploadFile, custom_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Saves uploaded file of any supported format and inspects its schema & row count.
        """
        if not file.filename:
            raise HTTPException(status_code=400, detail="Uploaded file must have a valid filename.")

        os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOADS_DIR, file.filename)

        # Save file to disk
        with open(file_path, "wb") as f:
            f.write(file.file.read())

        try:
            df = cls.read_dataset_file(file_path, nrows=5000)
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise e

        columns = list(df.columns)
        row_count = len(df)
        column_count = len(columns)

        if column_count == 0:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=400, detail="The uploaded dataset does not contain any valid columns.")

        # Infer ground-truth column
        candidate_labels = [
            "label", "ground_truth", "class", "target", "attack", "is_attack", 
            "malicious", "attack_type", "threat_level", "classification", "category"
        ]
        ground_truth_col = None
        for col in columns:
            if col.strip().lower() in candidate_labels:
                ground_truth_col = col
                break

        if not ground_truth_col:
            ground_truth_col = columns[-1]  # Default to last column

        base_name = file.filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").title()

        return {
            "name": custom_name or base_name,
            "filename": file.filename,
            "file_path": file_path,
            "row_count": row_count,
            "column_count": column_count,
            "columns": columns,
            "ground_truth_column": ground_truth_col
        }

    # Backward compatibility alias
    @classmethod
    def save_and_inspect_csv(cls, file: UploadFile, custom_name: Optional[str] = None) -> Dict[str, Any]:
        return cls.save_and_inspect_dataset(file, custom_name)

    @classmethod
    def get_preview(cls, file_path: str, nrows: int = 15) -> Dict[str, Any]:
        df = cls.read_dataset_file(file_path, nrows=nrows)
        # Fill NaN with empty string for clean JSON serialization
        df = df.fillna("")

        return {
            "columns": list(df.columns),
            "sample_rows": df.to_dict(orient="records"),
            "total_rows": len(df)
        }

    @classmethod
    def load_sample_for_experiment(cls, file_path: str, ground_truth_col: str, sample_size: int = 20) -> List[Dict[str, Any]]:
        df = cls.read_dataset_file(file_path)

        if ground_truth_col not in df.columns:
            # Fallback to last column if column name mismatched
            ground_truth_col = df.columns[-1]

        if sample_size > 0 and len(df) > sample_size:
            sample_df = df.sample(n=sample_size, random_state=42)
        else:
            sample_df = df

        sample_df = sample_df.fillna("")
        return sample_df.to_dict(orient="records")
