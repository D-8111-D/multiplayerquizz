# routes/quiz_ai.py
from flask import Blueprint, request, jsonify
from db import mongo
from question import serialize_question, create_question_doc
from gemini import generate_quiz_from_prompt


quiz_ai = Blueprint("questions", __name__)

@quiz_ai.route("/questions/ai/generate", methods=["POST"])
def generate_questions():
    data = request.json
    prompt = data["prompt"]
    count = data.get("count", 5)

    questions = generate_quiz_from_prompt(prompt, count)
    print("RAW MODEllLsss:", data)
    saved = []
    for q in questions:
        doc = {
        "question": q["question"],
        "options": q["options"],
        "correct_index": q["correct_index"], 
        }
        # mongo.db.questions.insert_one(doc)
        saved.append(doc)

    return jsonify(saved)
