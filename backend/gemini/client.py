import logging
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

logger = logging.getLogger(__name__)

def get_gemini_model():
    """
    Initializes and returns the Gemini generative model using GEMINI_API_KEY.
    Returns None if the API key is not configured or SDK fails.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not configured in environment.")
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        # gemini-flash-latest always points to the newest stable Flash model (fast, free-tier)
        model = genai.GenerativeModel("gemini-flash-latest")
        return model
    except Exception as e:
        logger.error(f"Error configuring Gemini client: {e}")
        return None
