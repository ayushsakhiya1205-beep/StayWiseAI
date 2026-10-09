import os
import joblib
import json

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
METADATA_FILE = os.path.join(MODEL_DIR, "model_metadata.json")

os.makedirs(MODEL_DIR, exist_ok=True)

def save_model_artifact(model, preprocessor, metadata):
    """Saves serialized model, preprocessor, and metadata."""
    version = metadata.get("version", "v1.0.0")
    model_path = os.path.join(MODEL_DIR, f"staywise_model_{version}.pkl")
    active_path = os.path.join(MODEL_DIR, "active_model.pkl")
    staywise_path = os.path.join(MODEL_DIR, "staywise_model.pkl")

    preproc_path = os.path.join(MODEL_DIR, f"staywise_preprocessor_{version}.pkl")
    active_preproc_path = os.path.join(MODEL_DIR, "active_preprocessor.pkl")
    staywise_preproc_path = os.path.join(MODEL_DIR, "staywise_preprocessor.pkl")

    joblib.dump(model, model_path)
    joblib.dump(model, active_path)
    joblib.dump(model, staywise_path)

    if preprocessor is not None:
        joblib.dump(preprocessor, preproc_path)
        joblib.dump(preprocessor, active_preproc_path)
        joblib.dump(preprocessor, staywise_preproc_path)

    with open(METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)

    return model_path

def load_active_model():
    """Loads currently active trained model binary and metadata."""
    active_path = os.path.join(MODEL_DIR, "active_model.pkl")
    if not os.path.exists(active_path):
        active_path = os.path.join(MODEL_DIR, "staywise_model.pkl")

    if os.path.exists(active_path):
        try:
            model = joblib.load(active_path)
            metadata = {}
            if os.path.exists(METADATA_FILE):
                with open(METADATA_FILE, "r") as f:
                    metadata = json.load(f)
            return model, metadata
        except Exception as e:
            print(f"[Model Manager Warning] Could not load active model: {e}")

    return None, None

def load_active_model_and_preprocessor():
    """Loads active model, active preprocessor, and metadata."""
    model, metadata = load_active_model()
    preprocessor = None

    preproc_path = os.path.join(MODEL_DIR, "active_preprocessor.pkl")
    if not os.path.exists(preproc_path):
        preproc_path = os.path.join(MODEL_DIR, "staywise_preprocessor.pkl")

    if os.path.exists(preproc_path):
        try:
            preprocessor = joblib.load(preproc_path)
        except Exception as e:
            print(f"[Model Manager Warning] Could not load preprocessor: {e}")

    return model, preprocessor, metadata
