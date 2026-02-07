import os
from io import BytesIO

import numpy as np
from dotenv import load_dotenv
from inference_sdk import InferenceHTTPClient
from PIL import Image
from services.openai_service import analyze_ripeness_with_openai, get_fruit_name

load_dotenv()

# Initialize Roboflow client only if API key is available
CLIENT = None
roboflow_url = os.getenv("ROBOFLOW_URL")
roboflow_key = os.getenv("ROBOFLOW_API_KEY")

if roboflow_url and roboflow_key:
    try:
        CLIENT = InferenceHTTPClient(
            api_url=roboflow_url,
            api_key=roboflow_key,
        )
        print("✓ Roboflow CV client initialized")
    except Exception as e:
        print(f"⚠️ Failed to initialize Roboflow client: {e}")
        CLIENT = None
else:
    print("⚠️ Roboflow API key not configured - will use OpenAI for all predictions")


def analyze_image(image_bytes):
    """
    Analyze fruit image using CV model for ripeness detection.
    Always uses OpenAI for fruit name.
    Falls back to OpenAI for ripeness if CV model fails or is not available.
    """
    # ALWAYS get fruit name from OpenAI (more reliable)
    fruit_info = get_fruit_name(image_bytes)
    fruit_name = fruit_info.get("fruit_name", "unknown")

    # If Roboflow client is not available, use OpenAI directly
    if CLIENT is None:
        print("⚠️ Roboflow not available, using OpenAI for ripeness detection...")
        openai_result = analyze_ripeness_with_openai(image_bytes)

        if "error" not in openai_result:
            return {
                "fruit_name": fruit_name,
                "ripeness": openai_result.get("ripeness", "unknown"),
                "confidence": openai_result.get("confidence", 70.0),
                "source": "openai_primary",
            }
        else:
            return {"error": "OpenAI analysis failed"}

    try:
        image_stream = BytesIO(image_bytes)
        image = Image.open(image_stream).convert("RGB")
        image = image.resize((640, 640))

        result = CLIENT.infer(image, model_id="fruit-ripeness-unjex/2")

        preds = result.get("predictions", [])

        # If CV model has no predictions, use OpenAI as fallback
        if not preds:
            print("⚠️ No predictions from CV model, falling back to OpenAI...")
            openai_result = analyze_ripeness_with_openai(image_bytes)

            if "error" not in openai_result:
                return {
                    "fruit_name": fruit_name,  # Use OpenAI's fruit name
                    "ripeness": openai_result.get("ripeness", "unknown"),
                    "confidence": openai_result.get("confidence", 70.0),
                    "source": "openai_fallback",
                }
            else:
                return {
                    "error": "No predictions found from CV model and OpenAI fallback failed"
                }

        # CV model has predictions - use them for ripeness
        top_pred = max(preds, key=lambda x: x.get("confidence", 0))
        raw_class = top_pred.get("class", "unknown")
        stage = raw_class.split()[-1] if raw_class != "unknown" else "unknown"

        return {
            "fruit_name": fruit_name,  # Always from OpenAI
            "ripeness": stage,
            "confidence": round(top_pred.get("confidence", 0) * 100, 2),
            "source": "cv_model",
        }

    except Exception as e:
        print(f"❌ Error in CV model, falling back to OpenAI: {e}")
        # If CV model fails entirely, use OpenAI
        openai_result = analyze_ripeness_with_openai(image_bytes)

        if "error" not in openai_result:
            return {
                "fruit_name": fruit_name,  # Use OpenAI's fruit name
                "ripeness": openai_result.get("ripeness", "unknown"),
                "confidence": openai_result.get("confidence", 70.0),
                "source": "openai_fallback",
            }
        else:
            return {"error": f"CV model error and OpenAI fallback failed: {str(e)}"}


if __name__ == "__main__":
    with open("../images/ripe_mango.jpg", "rb") as image_file:
        image_bytes = image_file.read()
    output = analyze_image(image_bytes)
    print(output)
