import requests
import json
import re
def generate_quiz_from_prompt(topic, count=5):

    prompt = f"""
    Generate {count} MCQ question on {topic}.
    Return JSON ONLY in this format:
    {{
      "question": "",
      "options": ["A", "B", "C", "D"],
      "correct_index": ""
    }}
    """

    response = requests.post(
        "http://127.0.0.1:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )

# 🔥 extract response text
    data2 = response.json().get("response")

    print("RAW TEXT FROM MODEL:", data2)
    raw_text = data2
    data = clean_and_parse_questions(raw_text)
    print("RAW MODEL:", data)


    # Convert string to JSON safely
    try:
        return data
    except:
        return {
            "question": "Fallback: What is Java?",
            "options": ["Language", "OS", "Browser", "Hardware"],
            "correct_index": "Language"
        }


def clean_and_parse_questions(raw_text):
    match = re.search(r'\[.*\]', raw_text, re.DOTALL)
    if not match:
        raise Exception("Invalid AI response")

    json_text = match.group(0)

    # ✅ remove A., B., C., D. from options
    json_text = re.sub(r'"[A-D]\.\s*', '"', json_text)

    # ✅ convert correct_index string to number
    json_text = re.sub(r'"correct_index":\s*"(\d+)"', r'"correct_index": \1', json_text)

    # ✅ load JSON
    questions = json.loads(json_text)

    return questions







# # services/gemini_ai.py

# from google import genai
# import os
# import json

# api_key = os.getenv("GEMINI_API_KEY")

# if not api_key:
#     raise ValueError("GEMINI_API_KEY is not set in environment variables")

# # ✅ correct way for new SDK
# client = genai.Client(api_key=api_key)

# def generate_quiz_from_prompt(prompt, count=5):
#     ai_prompt = f"""
# Generate {count} quiz questions.

# Each question must contain:
# - question
# - 4 options
# - correct_index (0 based)

# Return ONLY valid JSON array.
# """

#     response = client.models.generate_content(
#         model="gemini-2.0-flash",   # ✅ correct model for new SDK
#         contents=ai_prompt + "\n" + prompt
#     )

#     text = response.text.strip()

#     # remove ```json if Gemini adds it
#     if text.startswith("```"):
#         text = text.replace("```json", "").replace("```", "").strip()

#     return json.loads(text)
