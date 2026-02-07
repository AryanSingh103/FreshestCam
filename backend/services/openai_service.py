import json
import os
import re
from io import BytesIO
from pathlib import Path
import base64

from openai import OpenAI
from dotenv import load_dotenv
from PIL import Image

# Load .env from backend directory
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Configure OpenAI API
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("⚠️ OPENAI_API_KEY not configured - OpenAI features will not work")
    client = None
else:
    client = OpenAI(api_key=api_key)


def encode_image_base64(image_bytes):
    """Convert image bytes to base64 string for OpenAI API"""
    return base64.b64encode(image_bytes).decode('utf-8')


def get_fruit_name(image_bytes):
    """
    Get the name of the fruit from the image using OpenAI Vision API.

    Args:
        image_bytes: Raw image bytes

    Returns:
        dict: {"fruit_name": "apple"} or {"error": "..."}
    """
    if not client:
        return {"error": "OpenAI API not configured"}
    
    try:
        print("🍎 Getting fruit name from OpenAI...")
        
        # Convert image to base64
        base64_image = encode_image_base64(image_bytes)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Identify the fruit in this image. Return ONLY the fruit name in lowercase, nothing else. Examples: apple, banana, mango, strawberry, orange, etc. If you cannot identify a fruit, return 'unknown'."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=50
        )

        text = response.choices[0].message.content.strip().lower()
        print(f"Fruit name response: {text}")

        # Clean up the response - remove extra whitespace and convert to lowercase
        fruit_name = re.sub(r"[^a-z\s]", "", text)
        fruit_name = fruit_name.split()[0] if fruit_name.split() else "unknown"

        print(f"✓ Fruit identified: {fruit_name}")
        return {"fruit_name": fruit_name}

    except Exception as e:
        print(f"❌ Error in get_fruit_name: {e}")
        import traceback
        traceback.print_exc()
        return {"fruit_name": "unknown"}


def analyze_ripeness_with_openai(image_bytes):
    """
    Analyze fruit ripeness using OpenAI Vision API.

    Args:
        image_bytes: Raw image bytes

    Returns:
        dict: {"fruit_name": "apple", "ripeness": "ripe", "confidence": 85.0}
              or {"error": "..."}
    """
    if not client:
        return {"error": "OpenAI API not configured"}
    
    try:
        print("🔍 Starting OpenAI ripeness analysis...")
        
        base64_image = encode_image_base64(image_bytes)

        prompt = """Analyze this fruit image and determine:
1. The fruit name (e.g., apple, banana, mango, strawberry)
2. Its ripeness stage: must be one of these exact values: "unripe", "ripe", or "overripe"

Criteria:
- unripe: green, hard, not ready to eat
- ripe: perfect for eating, good color, firm
- overripe: brown spots, very soft, past prime

Respond in EXACTLY this JSON format with no additional text:
{
  "fruit_name": "name of fruit in lowercase",
  "ripeness": "unripe/ripe/overripe",
  "confidence": 85.0
}"""

        print("📤 Sending to OpenAI API...")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=200
        )

        text = response.choices[0].message.content.strip()
        print(f"📝 Response text: {text}")

        # Remove markdown code blocks if present
        text = re.sub(r"```json\s*", "", text)
        text = re.sub(r"```\s*", "", text)

        try:
            result = json.loads(text)
            print(f"✓ JSON parsed successfully: {result}")

            # Validate and clean the response
            fruit_name = result.get("fruit_name", "unknown").lower()
            ripeness = result.get("ripeness", "unknown").lower()
            confidence = float(result.get("confidence", 75.0))

            # Ensure ripeness is one of the valid values
            if ripeness not in ["unripe", "ripe", "overripe"]:
                ripeness = "ripe"  # Default to ripe if unclear

            final_result = {
                "fruit_name": fruit_name,
                "ripeness": ripeness,
                "confidence": round(confidence, 2),
                "source": "openai",
            }
            print(f"✅ Final result: {final_result}")
            return final_result

        except json.JSONDecodeError as je:
            print(f"⚠️ JSON decode failed: {je}")
            # If JSON parsing fails, try to extract info manually
            text_lower = text.lower()

            # Extract ripeness
            ripeness = "unknown"
            if "unripe" in text_lower:
                ripeness = "unripe"
            elif "overripe" in text_lower:
                ripeness = "overripe"
            elif "ripe" in text_lower:
                ripeness = "ripe"

            # Try to extract fruit name
            fruit_name = "unknown"
            common_fruits = [
                "apple", "banana", "mango", "strawberry", "orange",
                "grape", "pear", "peach", "plum", "cherry",
            ]
            for fruit in common_fruits:
                if fruit in text_lower:
                    fruit_name = fruit
                    break

            return {
                "fruit_name": fruit_name,
                "ripeness": ripeness,
                "confidence": 70.0,
                "source": "openai",
            }

    except Exception as e:
        print(f"❌ Error in analyze_ripeness_with_openai: {e}")
        return {"error": str(e)}


def get_recipes_and_safety(image_bytes, fruit_name=None, ripeness=None):
    """
    Get recipe suggestions and food safety info using OpenAI.
    """
    if not client:
        return {"error": "OpenAI API not configured"}
    
    try:
        print("🍳 Getting recipes and safety info from OpenAI...")
        
        base64_image = encode_image_base64(image_bytes)
        
        context = ""
        if fruit_name and ripeness:
            context = f"\nThe fruit has been identified as: {fruit_name}\nCurrent ripeness: {ripeness}"

        prompt = f"""Analyze this fruit image and provide comprehensive information.{context}

Provide:
1. Fruit identification
2. Ripeness level: unripe, ripe, or overripe
3. Food safety: Is it safe to eat?
4. Days until discard: 0-14 days
5. Storage tips
6. 3 recipes optimized for this ripeness level

Respond in EXACTLY this JSON format:
{{
  "fruit_name": "banana",
  "ripeness": "overripe",
  "is_safe_to_eat": true,
  "days_until_discard": 2,
  "storage_tips": "Store overripe bananas in the freezer for smoothies.",
  "recipes": [
    {{
      "name": "Banana Bread",
      "difficulty": "easy",
      "prep_time": "15 minutes",
      "cook_time": "60 minutes",
      "why_this_ripeness": "Overripe bananas are perfect - sweeter and mash easily",
      "ingredients": ["3 overripe bananas, mashed", "1/3 cup butter", "1 cup sugar", "1 egg", "1 tsp vanilla", "1 tsp baking soda", "Pinch of salt", "1.5 cups flour"],
      "instructions": "1. Preheat oven to 350°F. 2. Mix butter and bananas. 3. Add sugar, egg, vanilla. 4. Mix in baking soda and salt. 5. Add flour. 6. Bake 60 minutes."
    }},
    {{
      "name": "Banana Smoothie",
      "difficulty": "very easy",
      "prep_time": "3 minutes",
      "cook_time": "0 minutes",
      "why_this_ripeness": "Very ripe bananas add natural sweetness",
      "ingredients": ["2 overripe bananas", "1 cup milk", "1/2 cup yogurt", "Ice cubes"],
      "instructions": "1. Add all to blender. 2. Blend until smooth. 3. Serve."
    }},
    {{
      "name": "Frozen Banana Bites",
      "difficulty": "very easy",
      "prep_time": "10 minutes",
      "cook_time": "0 minutes",
      "why_this_ripeness": "Saves overripe bananas from waste",
      "ingredients": ["2-3 overripe bananas", "Melted chocolate", "Toppings: nuts, coconut"],
      "instructions": "1. Slice bananas. 2. Dip in chocolate. 3. Add toppings. 4. Freeze 2 hours."
    }}
  ]
}}"""

        print("📤 Sending recipe request to OpenAI...")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=2000
        )

        text = response.choices[0].message.content.strip()
        print(f"📝 Recipe response length: {len(text)} chars")

        # Remove markdown code blocks
        text = re.sub(r"```json\s*", "", text)
        text = re.sub(r"```\s*", "", text)

        try:
            result = json.loads(text)
            print(f"✅ Recipe data parsed successfully")
            return result

        except json.JSONDecodeError as je:
            print(f"⚠️ Failed to parse recipe JSON: {je}")
            return {"error": "Failed to parse recipe response"}

    except Exception as e:
        print(f"❌ Error in get_recipes_and_safety: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}


def get_nutrition_and_impact(fruit_name, ripeness="ripe"):
    """
    Get nutritional information using OpenAI.
    """
    if not client:
        return {"error": "OpenAI API not configured"}
    
    try:
        print(f"📊 Getting nutrition info for {fruit_name} ({ripeness})...")

        prompt = f"""Provide nutritional information for a {ripeness} {fruit_name}.

Return in EXACT JSON format:
{{
  "fruit_name": "{fruit_name}",
  "serving_size": "1 medium (approx Xg)",
  "nutrition": {{
    "calories": 95,
    "carbs_g": 25,
    "fiber_g": 4,
    "sugar_g": 19,
    "protein_g": 1,
    "vitamin_c_percent": 17,
    "potassium_mg": 422
  }},
  "health_benefits": ["High in potassium", "Good vitamin B6 source"],
  "environmental_impact": {{
    "carbon_footprint_kg": 0.7,
    "water_usage_liters": 790,
    "sustainability_rating": "medium",
    "local_season": "Year-round (imported)"
  }},
  "waste_reduction_tip": "Use overripe in smoothies or freeze"
}}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800
        )

        text = response.choices[0].message.content.strip()
        text = re.sub(r"```json\s*", "", text)
        text = re.sub(r"```\s*", "", text)

        result = json.loads(text)
        print(f"✅ Nutrition data retrieved for {fruit_name}")
        return result

    except Exception as e:
        print(f"❌ Error in get_nutrition_and_impact: {e}")
        return {"error": str(e)}
