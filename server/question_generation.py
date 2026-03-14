from bson.objectid import ObjectId
from datetime import datetime
from db import mongo
from question import serialize_question


# -------------------------------
# 🔹 Validation
# -------------------------------
def validate_question(data):
    if not data.get("question"):
        return "Question is required"

    if not isinstance(data.get("options"), list) or len(data["options"]) < 4:
        return "At least42 options are required"

    if not isinstance(data.get("correct_index"), int):
        return "correct_index must be integer"

    if data["correct_index"] < 0 or data["correct_index"] >= len(data["options"]):
        return "correct_index out of range"

    return None


# -------------------------------
# 🔹 CREATE
# -------------------------------
def create_question(data):
    error = validate_question(data)
    if error:
        return {"error": error}, 400

    question = {
        "question": data["question"],
        "options": data["options"],
        "correct_index": data["correct_index"],
        "created_by": data["created_by"],
        "created_by_role": data["created_by_role"],
        "created_by_id": data["created_by_id"],
        "media": data.get("media"),
        "createdAt": datetime.utcnow()
    }

    result = mongo.db.questions.insert_one(question)

    return {
        "message": "Question created",
        "id": str(result.inserted_id)
    }, 201


# -------------------------------
# 🔹 READ ALL
# -------------------------------
def get_all_questions():
    questions = mongo.db.questions.find()
    return [serialize_question(q) for q in questions]


# -------------------------------
# 🔹 READ ONE
# -------------------------------
def get_question_by_id(qid):
    q = mongo.db.questions.find_one({"_id": ObjectId(qid)})

    if not q:
        return {"error": "Not found"}, 404

    return serialize_question(q), 200


# -------------------------------
# 🔹 UPDATE
# -------------------------------
def update_question(qid, data):
    error = validate_question(data)
    if error:
        return {"error": error}, 400

    updated = {
        "question": data["question"],
        "options": data["options"],
        "correct_index": data["correct_index"],
        "media": data.get("media")
    }

    result = mongo.db.questions.update_one(
        {"_id": ObjectId(qid)},
        {"$set": updated}
    )

    if result.matched_count == 0:
        return {"error": "Question not found"}, 404

    return {"message": "Updated successfully"}, 200


# -------------------------------
# 🔹 DELETE
# -------------------------------
def delete_question(qid):
    result = mongo.db.questions.delete_one({"_id": ObjectId(qid)})

    if result.deleted_count == 0:
        return {"error": "Question not found"}, 404

    return {"message": "Deleted successfully"}, 200







# from flask import Blueprint, request, jsonify
# from bson import ObjectId
# from db import get_questions_collection
# from question import serialize_question, create_question_doc

# question_bp = Blueprint("question_bp", __name__)

# # 🔹 CREATE question
# @question_bp.route("/api/questions", methods=["POST"])
# def create_question():
#     collection = get_questions_collection()
#     data = request.json

#     payload = create_question_doc(data)
#     result = collection.insert_one(payload)

#     return jsonify({
#         "message": "Question created",
#         "id": str(result.inserted_id)
#     }), 201


# # 🔹 GET all questions (with optional filtering)
# @question_bp.route("/api/questions", methods=["GET"])
# def get_questions():
#     collection = get_questions_collection()

#     role = request.args.get("role")
#     user_id = request.args.get("user_id")

#     query = {}

#     if role:
#         query["role"] = role
#     if user_id:
#         query["userId"] = user_id

#     questions = collection.find(query)

#     return jsonify([serialize_question(q) for q in questions])


# # 🔹 GET single question
# @question_bp.route("/api/questions/<id>", methods=["GET"])
# def get_question(id):
#     collection = get_questions_collection()

#     question = collection.find_one({"_id": ObjectId(id)})

#     if not question:
#         return jsonify({"error": "Question not found"}), 404

#     return jsonify(serialize_question(question))


# # 🔹 UPDATE question
# @question_bp.route("/api/questions/<id>", methods=["PUT"])
# def update_question(id):
#     collection = get_questions_collection()
#     data = request.json

#     collection.update_one(
#         {"_id": ObjectId(id)},
#         {"$set": {
#             "question": data.get("question"),
#             "options": data.get("options"),
#             "answer": data.get("answer"),
#         }}
#     )

#     return jsonify({"message": "Question updated"})


# # 🔹 DELETE question
# @question_bp.route("/api/questions/<id>", methods=["DELETE"])
# def delete_question(id):
#     collection = get_questions_collection()

#     collection.delete_one({"_id": ObjectId(id)})

#     return jsonify({"message": "Question deleted"})
