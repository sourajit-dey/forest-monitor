import os
import logging
import numpy as np
import onnxruntime as ort

logger = logging.getLogger(__name__)

# Load models once at startup to avoid per-request latency
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RISK_MODEL_PATH = os.path.join(BASE_DIR, 'risk_model.onnx')
CHANGE_CLASSIFIER_PATH = os.path.join(BASE_DIR, 'change_classifier.onnx')

risk_session = None
classifier_session = None

try:
    if os.path.exists(RISK_MODEL_PATH):
        risk_session = ort.InferenceSession(RISK_MODEL_PATH)
        logger.info(f"Loaded {RISK_MODEL_PATH}")
    if os.path.exists(CHANGE_CLASSIFIER_PATH):
        classifier_session = ort.InferenceSession(CHANGE_CLASSIFIER_PATH)
        logger.info(f"Loaded {CHANGE_CLASSIFIER_PATH}")
except Exception as e:
    logger.error(f"Failed to load ONNX models: {e}")

def predict_risk(features):
    """
    Run the risk prediction model on live GEE features.
    features dict expected:
        'ndvi_sequence': list of 36 floats
        'static_features': list of 3 floats [slope, dist_clear, dist_settle]
    Returns:
        dict with 'predicted_class' and 'confidence'
    """
    if not risk_session:
        return {"predicted_class": "Model Not Loaded", "confidence": 0.0}
        
    try:
        # Prepare inputs as float32 numpy arrays with batch dimension
        ndvi_seq = np.array(features['ndvi_sequence'], dtype=np.float32).reshape(1, 36)
        static_feats = np.array(features['static_features'], dtype=np.float32).reshape(1, 3)
        
        inputs = {
            'ndvi_sequence': ndvi_seq,
            'static_features': static_feats
        }
        
        # Run inference
        outputs = risk_session.run(None, inputs)
        risk_score = float(outputs[0][0])
        
        # Map score to class
        # thresholding could be adjusted; e.g. > 0.5 is High Risk
        if risk_score > 0.7:
            predicted_class = "High Risk"
        elif risk_score > 0.4:
            predicted_class = "Medium Risk"
        else:
            predicted_class = "Low Risk"
            
        return {
            "predicted_class": predicted_class,
            "confidence": round(risk_score, 3)
        }
    except Exception as e:
        logger.error(f"Inference error: {e}")
        return {"predicted_class": "Error", "confidence": 0.0}

def classify_change(area_ha, ndvi_before, ndvi_after, ndvi_change):
    """
    Fallback tabular classifier using change_classifier.onnx.
    """
    if not classifier_session:
        return "Unknown"
        
    try:
        features = np.array([area_ha, ndvi_before, ndvi_after, ndvi_change], dtype=np.float32).reshape(1, 4)
        inputs = {'input': features}
        outputs = classifier_session.run(None, inputs)
        # outputs[0] is label, outputs[1] is probabilities map
        return outputs[0][0]
    except Exception as e:
        logger.error(f"Classifier error: {e}")
        return "Error"
