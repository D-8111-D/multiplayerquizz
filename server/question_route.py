from flask import Blueprint, request, jsonify
from question_generation import *
from gemini import generate_quiz_from_prompt

question_bp = Blueprint("questions", __name__)

@question_bp.route("/questions", methods=["POST"])
def create():
    res, status = create_question(request.json)
    return jsonify(res), status


@question_bp.route("/questions/ai/generate", methods=["POST"])
def generate_questions():
    data = request.json
    prompt = data["prompt"]
    count = data.get("count", 5)

    questions = generate_quiz_from_prompt(prompt, count)
    print("resda",questions)
    saved = []
    for q in questions:
        doc = {
        "question": q["question"],
        "options": q["options"],
        "correct_index": q["correct_index"], 
        "created_by": data["created_by"],
        "created_by_role": data["created_by_role"],
        "created_by_id": data["created_by_id"],
        "media": data.get("media"),
        "createdAt": datetime.utcnow()
        }

        result = mongo.db.questions.insert_one(doc)
        print("result", result)
        saved.append(doc)

    print("result", saved)
    return {
        "message": "Question created",
        "data": saved
    }, 201


@question_bp.route("/questions", methods=["GET"])
def get_all():
    return get_all_questions()


@question_bp.route("/questions/<id>", methods=["GET"])
def get_one(id):
    res, status = get_question_by_id(id)
    return jsonify(res), status


@question_bp.route("/questions/<id>", methods=["PUT"])
def update(id):
    res, status = update_question(id, request.json)
    return jsonify(res), status


@question_bp.route("/questions/<id>", methods=["DELETE"])
def delete(id):
    res, status = delete_question(id)
    return jsonify(res), status
