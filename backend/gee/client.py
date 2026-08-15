import json
import logging
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

logger = logging.getLogger(__name__)

_ee_initialized = False
_is_simulation_mode = False

def initialize_earth_engine() -> bool:
    """
    Initializes Google Earth Engine using Service Account credentials from environment variables.
    Never reads from raw disk paths in production.
    If no valid credentials exist in dev/demo mode, enables deterministic simulation mode.
    """
    global _ee_initialized, _is_simulation_mode
    if _ee_initialized:
        return not _is_simulation_mode

    try:
        import ee
    except ImportError:
        logger.warning("earthengine-api not installed. Running in simulation mode.")
        _is_simulation_mode = True
        _ee_initialized = True
        return False

    service_account_json = os.environ.get("GEE_SERVICE_ACCOUNT_JSON")
    ee_account = os.environ.get("EE_ACCOUNT")
    ee_key = os.environ.get("EE_PRIVATE_KEY")

    try:
        if service_account_json:
            sa_info = json.loads(service_account_json)
            credentials = ee.ServiceAccountCredentials(
                email=sa_info["client_email"],
                key_data=sa_info["private_key"]
            )
            project = sa_info.get("project_id") or os.environ.get("EE_PROJECT_ID")
            if project:
                ee.Initialize(credentials, project=project)
            else:
                ee.Initialize(credentials)
            logger.info("Earth Engine initialized with GEE_SERVICE_ACCOUNT_JSON.")
            _ee_initialized = True
            _is_simulation_mode = False
            return True
        elif ee_account and ee_key:
            credentials = ee.ServiceAccountCredentials(
                email=ee_account,
                key_data=ee_key
            )
            project = os.environ.get("EE_PROJECT_ID")
            if project:
                ee.Initialize(credentials, project=project)
            else:
                ee.Initialize(credentials)
            logger.info("Earth Engine initialized with EE_ACCOUNT / EE_PRIVATE_KEY.")
            _ee_initialized = True
            _is_simulation_mode = False
            return True
        else:
            # Check default auth (e.g. gcloud application-default credentials)
            try:
                ee.Initialize()
                logger.info("Earth Engine initialized with default credentials.")
                _ee_initialized = True
                _is_simulation_mode = False
                return True
            except Exception:
                logger.warning(
                    "GEE credentials not provided in environment. "
                    "Operating in high-fidelity deterministic simulation mode for demo/testing."
                )
                _is_simulation_mode = True
                _ee_initialized = True
                return False
    except Exception as e:
        logger.error(f"Failed to initialize Earth Engine: {e}. Falling back to simulation mode.")
        _is_simulation_mode = True
        _ee_initialized = True
        return False

def is_simulation_mode() -> bool:
    """Returns whether Earth Engine operations are in simulation fallback mode."""
    global _ee_initialized
    if not _ee_initialized:
        initialize_earth_engine()
    return _is_simulation_mode
