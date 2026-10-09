import os
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from training.train import run_training_pipeline

def train_ml_pipeline(logs_data=None):
    """
    Executes complete training & model comparison pipeline (RandomForest vs GradientBoosting).
    """
    try:
        metadata = run_training_pipeline()
        return {
            "success": True,
            "version": metadata["version"],
            "algorithm": metadata["algorithm"],
            "sampleCount": metadata["sampleCount"],
            "precisionAtK": metadata["precisionAtK"],
            "ndcgAtK": metadata["ndcgAtK"],
            "precisionAt10": metadata["precisionAt10"],
            "ndcgAt10": metadata["ndcgAt10"],
            "r2Score": metadata["r2Score"],
            "mse": metadata["mse"]
        }
    except Exception as e:
        print(f"[Training Exception] Error during pipeline execution: {e}")
        return {
            "success": False,
            "message": str(e)
        }

if __name__ == "__main__":
    train_ml_pipeline()
