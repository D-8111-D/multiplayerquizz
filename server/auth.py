from flask import Blueprint, request, jsonify
from db import mongo
from flask_bcrypt import Bcrypt
import jwt, datetime
from flask import current_app

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

# REGISTER
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json

    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    mongo.db.users.insert_one({
        "email": data['email'],
        "password": hashed_pw
    })
    user = mongo.db.users.find_one({"email": data['email']})

    if user and bcrypt.check_password_hash(user['password'], data['password']):
        token = jwt.encode({
            "user_id": str(user['_id']),
            "user_email": user['email'],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({"name": user['email'], "password": data['password'], "token": token})


# LOGIN
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = mongo.db.users.find_one({"email": data['email']})

    if user and bcrypt.check_password_hash(user['password'], data['password']):
        token = jwt.encode({
            "user_id": str(user['_id']),
            "user_email": user['email'],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({"name": user['email'], "password": data['password'], "token": token})

    return jsonify({"message": "Invalid credentials"}), 401