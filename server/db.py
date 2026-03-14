from flask_pymongo import PyMongo
from flask import Flask

mongo = PyMongo()

def init_db(app: Flask):
    app.config["MONGO_URI"] = "mongodb://127.0.0.1:27017/quizdb"
    mongo.init_app(app)

def get_questions_collection():
    return mongo.db.questions