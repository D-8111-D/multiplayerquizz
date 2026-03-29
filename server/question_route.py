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
    title = data.get("title", "Untitled Set")
    question_set_id = data.get("question_set_id", "default_set")
    count = data.get("count", 5)

    questions = generate_quiz_from_prompt(prompt, count)
    print("resda",questions)
    saved = []
    for q in questions:
        doc = {
        "question": q["question"],
        "options": q["options"],
        "correct_index": q["correct_index"] + 1,  # Convert to 1-based index
        "title": title,
        "question_set_id": question_set_id,
        "created_by": data["created_by"],
        "created_by_role": data["created_by_role"],
        "created_by_id": data["created_by_id"],
        "media": data.get("media"),
        "createdAt": datetime.utcnow()
        }
        print("doc", doc)
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

@question_bp.route("/questions/<set_id>", methods=["GET"])
def get_questions_by_set(set_id):
    return get_questions_by_setId(set_id)

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



# @question_bp.route('/register', methods=['POST'])
# def register():
#     data = request.json

#     hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')

#     mongo.db.users.insert_one({
#         "email": data['email'],
#         "password": hashed_pw
#     })

#     return jsonify({"message": "User registered successfully"})

# @question_bp.route('/login', methods=['POST'])
# def login():
#     data = request.json
#     user = mongo.db.users.find_one({"email": data['email']})

#     if user and bcrypt.check_password_hash(user['password'], data['password']):
#         token = jwt.encode({
#             "user_id": str(user['_id']),
#             "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
#         }, app.config['SECRET_KEY'], algorithm="HS256")

#         return jsonify({"token": token})

#     return jsonify({"message": "Invalid credentials"}), 401