from datetime import datetime
from bson import ObjectId

def serialize_question(q):
    return {
        "_id": str(q["_id"]),
        "question": q["question"],
        "options": q["options"],
        "correct_index": q["correct_index"],
        "created_by": q["created_by"],
        "created_by_role": q["created_by_role"],
        "created_by_id": q["created_by_id"],
         "created_by": q.get("created_by", None) 
    }

def create_question_doc(data):
    return {
        "question": data["question"],
        "options": data["options"],
        "correct_index": data["correct_index"],
        "created_by": data["created_by"],
        "created_by_role": data["created_by_role"],
        "created_by_id": data["created_by_id"],
        "created_at": datetime.utcnow()
    }
