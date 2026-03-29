from datetime import datetime
from bson import ObjectId

def serialize_question(q):
    return {
        "_id": str(q["_id"]),
        "question": q["question"],
        "options": q["options"],
        "correct_index": q["correct_index"],
        "question_set_id": q["question_set_id"],
        "title": q["title"],
        "created_by": q["created_by"],
        "created_by_role": q["created_by_role"],
        "created_by_id": q["created_by_id"],
        "createdAt": q["createdAt"].isoformat(),
        "media": q.get("media", None) 
    }

def create_question_doc(data):
    return {
        "question": data["question"],
        "options": data["options"],
        "correct_index": data["correct_index"],
        "question_set_id": data["question_set_id"],
        "title": data["title"],
        "created_by": data["created_by"],
        "created_by_role": data["created_by_role"],
        "created_by_id": data["created_by_id"],
        "createdAt": datetime.utcnow()
    }
