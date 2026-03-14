import eventlet
eventlet.monkey_patch()
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, join_room, leave_room, emit
import time
import random
from flask_cors import CORS
from quizz_ai import quiz_ai
from db import mongo
from question_route  import question_bp, get_all
# Use eventlet as the WSGI server


app = Flask(__name__)

app.config["MONGO_URI"] = "mongodb://127.0.0.1:27017/quizdb"
app.config['SECRET_KEY'] = 'e8f43ac7ef9d33c24d8b87fc67c91e34fd23b9b18e2a9d4c76aaf1829c1ef84b'
# Allow all origins for development (CORS)
# socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, allow_headers=["Content-Type"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], supports_credentials=True)
mongo.init_app(app)
# app.register_blueprint(quiz_ai)
app.register_blueprint(question_bp, url_prefix="/api")

@app.route("/")
def home():
    return {"message": "Quiz API running 🚀"}

@app.after_request
def after_request(response):
    return response
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173", async_mode="eventlet")
# --- CONFIGURATION ---
MAX_TIME_PER_QUESTION = 20  # Seconds
MAX_SCORE = 1000
MIN_SCORE = 500

# DEFAULT_QUESTIONS = [
#     {"q": "What is the capital of Japan?", "options": ["Beijing", "Seoul", "Tokyo", "Bangkok"], "a": "Tokyo"},
#     {"q": "Which planet is known as the Red Planet?", "options": ["Venus", "Mars", "Jupiter", "Saturn"], "a": "Mars"},
#     {"q": "What is 7 multiplied by 8?", "options": ["54", "56", "64", "48"], "a": "56"},
#     {"q": "What is the primary language for web styling?", "options": ["Python", "JavaScript", "HTML", "CSS"], "a": "CSS"},
#     {"q": "The speed of light in a vacuum is approximately?", "options": ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "30,000 km/s"], "a": "300,000 km/s"},
# ]

# --- IN-MEMORY GLOBAL STATE ---
rooms = {}  # Stores all room objects
players_in_room = {} # room_code: {player_id: player_data}

# --- UTILITIES ---



def generate_room_code():
    """Generates a unique 4-character uppercase room code."""
    # print(f"Room {room_code} created.")
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    while True:
        code = ''.join(random.choices(chars, k=4))
        if code not in rooms:
            return code

def calculate_score(time_taken_seconds):
    """Calculates score based on speed, max 1000, min 500."""
    if time_taken_seconds > MAX_TIME_PER_QUESTION or time_taken_seconds < 0:
        return MIN_SCORE

    # Score decreases linearly from MAX_SCORE to MIN_SCORE over MAX_TIME_PER_QUESTION
    time_ratio = time_taken_seconds / MAX_TIME_PER_QUESTION
    score = int(MAX_SCORE - (time_ratio * (MAX_SCORE - MIN_SCORE)))
    return max(MIN_SCORE, score)

def broadcast_room_state(room_code):
    """Sends the current room data to all clients in the room."""
    if room_code in rooms:
        emit('room_update', rooms[room_code], room=room_code)
        
def broadcast_players_state(room_code):
    """Sends the current player list and scores to all clients in the room."""
    if room_code in players_in_room:
        player_list = list(players_in_room[room_code].values())
        
        # Sort by score descending, then join time ascending for tie-breaking
        player_list.sort(key=lambda p: (p['score'], -p['joined_at']), reverse=True)
        
        emit('players_update', player_list, room=room_code)

# --- SOCKET.IO EVENT HANDLERS ---

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")
    # Find the room the player was in and clean up
    for room_code, players in players_in_room.items():
        if request.sid in players:
            player_name = players[request.sid]['name']
            del players[request.sid]
            print(f"Player {player_name} left room {room_code}")
            
            # If host disconnects, end the room
            # if room_code in rooms and rooms[room_code]['host_sid'] == request.sid:
            #     rooms[room_code]['status'] = 'ENDED'
            #     print(f"Host disconnected, room {room_code} ended.")

            if room_code in rooms and rooms[room_code]['host_sid'] == request.sid:
                print(f"Host disconnected, room {room_code} kept alive (DEV)")
                
            broadcast_players_state(room_code)
            broadcast_room_state(room_code)
            
            # Remove room if empty
            # if not players and room_code in rooms:
            #      del rooms[room_code]
            #      print(f"Room {room_code} cleaned up.")
            break

@socketio.on('create_room')
def on_create_room(data):
    """Host creates a new room."""
    # print(f"Room {room_code} created.")
    host_name = data.get('userName', 'Host')
    # print(f"Room {room_code} created.")
    room_code = generate_room_code()
    selected_questions = data.get('questions', [])
    print(f"Room {room_code} created.")
    
    rooms[room_code] = {
        'code': room_code,
        'host_sid': request.sid,
        'status': 'LOBBY', # LOBBY, IN_GAME, ENDED
        'current_question_index': -1,
        'current_question_start_time': None,
        'questions': selected_questions, # Use a copy if you want to modify it later
        'max_time': MAX_TIME_PER_QUESTION,
    }

    print(f"Room {room_code} created by {host_name} ({request.sid})")
    players_in_room[room_code] = {}
    
    # Host joins the room
    join_room(room_code)
    
    # Add host as a player
    players_in_room[room_code][request.sid] = {
        'id': request.sid,
        'name': host_name,
        'score': 0,
        'answers': {}, # {q_index: {answer, time_taken, correct, score}}
        'joined_at': time.time(),
    }
    
    emit('room_created', {'roomCode': room_code, 'isHost': True})
    broadcast_players_state(room_code)
    broadcast_room_state(room_code)
    print(f"Room {room_code} created by {host_name} ({request.sid})")


@socketio.on('join_room')
def on_join_room(data):
    """Player joins an existing room."""
    room_code = data.get('roomCode', '').upper()
    user_name = data.get('userName', 'Player')
    
    if room_code not in rooms:
        return emit('error_message', 'Room not found.')
    
    if rooms[room_code]['status'] != 'LOBBY':
        return emit('error_message', 'Game has already started or ended.')
        
    join_room(room_code)
    
    # Add player
    players_in_room[room_code][request.sid] = {
        'id': request.sid,
        'name': user_name,
        'score': 0,
        'answers': {},
        'joined_at': time.time(),
    }
    
    emit('room_joined', {'roomCode': room_code, 'isHost': (request.sid == rooms[room_code]['host_sid'])})
    broadcast_players_state(room_code)
    broadcast_room_state(room_code)
    print(f"Player {user_name} joined room {room_code}")


@socketio.on('start_quiz')
def on_start_quiz(data):
    """Host initiates the quiz."""
    room_code = data.get('roomCode', '')
    
    if room_code not in rooms or rooms[room_code]['host_sid'] != request.sid:
        return emit('error_message', 'Access denied. Only host can start the quiz.')

    if rooms[room_code]['status'] == 'LOBBY':
        rooms[room_code]['status'] = 'IN_GAME'
        rooms[room_code]['current_question_index'] = 0
        rooms[room_code]['current_question_start_time'] = time.time()
        
        print(f"Quiz {room_code} started. Q: 1")
        broadcast_room_state(room_code)
        
        # Start a server-side timer to force question advance if needed (omitted for brevity, host manages advance)
        # In a production environment, a thread would run here to check the timer and advance the room automatically.


@socketio.on('submit_answer')
def on_submit_answer(data):
    """Player submits an answer."""
    room_code = data.get('roomCode', '')
    q_index = data.get('qIndex')
    answer = data.get('answer')
    print(answer)
    
    if room_code not in rooms or request.sid not in players_in_room[room_code]:
        return

    room = rooms[room_code]
    player = players_in_room[room_code][request.sid]
    
    # Check if the player has already answered this question
    if q_index in player['answers']:
        return

    # Basic state validation
    if room['status'] != 'IN_GAME' or room['current_question_index'] != q_index:
        return

    # Calculate time taken
    time_taken = time.time() - room['current_question_start_time']
    
    # Check correctness and calculate score
    question = room['questions'][q_index]
    correct_index = question['correct_index']
    is_correct = (answer == correct_index)
    score_change = 0
    print("Answer received:", answer)
    print("Correct index:", correct_index)
    if is_correct and time_taken <= room['max_time']:
        score_change = calculate_score(time_taken)

    # Update player state
    player['answers'][q_index] = {
        'answer': answer,
        'time_taken': time_taken,
        'correct': is_correct,
        'score': score_change,
    }
    player['score'] += score_change
    
    
    # Notify only the player that their answer was received
    emit('answer_received', {'qIndex': q_index, 'status': 'received'})
    
    # Broadcast updated scores to everyone
    broadcast_players_state(room_code)
    print(f"Player {player['name']} answered Q{q_index}. Score change: {score_change}")


@socketio.on('host_next_question')
def on_host_next_question(data):
    """Host moves to the next question or ends the quiz."""
    room_code = data.get('roomCode', '')
    
    if room_code not in rooms or rooms[room_code]['host_sid'] != request.sid:
        return emit('error_message', 'Access denied. Only host can advance.')
        
    room = rooms[room_code]
    next_index = room['current_question_index'] + 1
    
    if next_index < len(room['questions']):
        # Move to next question
        room['current_question_index'] = next_index
        room['current_question_start_time'] = time.time()
        print(f"Room {room_code} advancing to Q{next_index + 1}")
    else:
        # End quiz
        room['status'] = 'ENDED'
        print(f"Room {room_code} finished.")

    broadcast_room_state(room_code)


if __name__ == '__main__':
    print("Starting Flask-SocketIO Server on http://localhost:5000")
    # Start the server using eventlet
    socketio.run(app, host="0.0.0.0", port=5000)
