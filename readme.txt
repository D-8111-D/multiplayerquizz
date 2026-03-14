command for backend
pip install flask flask-socketio eventlet flask-cors
pip install -r requirements.txt

C:\Users\USER\Documents\Deepshikha\multiplayerquizz>cd server 

C:\Users\USER\Documents\Deepshikha\multiplayerquizz\server>python -m venv venv

C:\Users\USER\Documents\Deepshikha\multiplayerquizz\server>
C:\Users\USER\Documents\Deepshikha\multiplayerquizz\server>venv\Scripts\activate

(venv) C:\Users\USER\Documents\Deepshikha\multiplayerquizz\server>python app.py

command to run fronend
C:\Users\USER\Documents\Deepshikha\multiplayerquizz>cd client 
npm install
npm run dev







# import flask
# from flask_socketio import SocketIO, emit
# import eventlet

# # --- Application Setup ---
# app = flask.Flask(__name__)
# app.config['SECRET_KEY'] = 'your_secret_quiz_key' 
# # CORS is essential for connecting the React app (typically port 5173 or 3000) 
# # to the server (port 5000). Adjust the origin if your React port changes.
# socketio = SocketIO(app, async_mode='eventlet', cors_allowed_origins="http://localhost:5173")

# # --- Game State Management ---
# game_state = {
#     'players': {},      # {sid: {'username': 'name', 'score': 0}}
#     'questions': [
#         {'q': 'What is the capital of France?', 'options': ['Berlin', 'Madrid', 'Paris', 'Rome'], 'a': 'Paris'},
#         {'q': 'Python is a type of what?', 'options': ['Snake', 'Fruit', 'Programming Language', 'Tree'], 'a': 'Programming Language'},
#         {'q': 'What does HTML stand for?', 'options': ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'], 'a': 'Hyper Text Markup Language'}
#     ],
#     'current_question_index': -1,
#     'quiz_active': False
# }

# def broadcast_game_state():
#     """Sends the current players and scores to all clients."""
#     scores = [{'username': p['username'], 'score': p['score']} for p in game_state['players'].values()]
#     scores.sort(key=lambda x: x['score'], reverse=True)
    
#     emit('update_leaderboard', {'players': scores}, broadcast=True)

# def broadcast_question():
#     """Sends the current question (without the answer) to all clients."""
#     q_index = game_state['current_question_index']
#     if q_index >= 0 and q_index < len(game_state['questions']):
#         current_q = game_state['questions'][q_index]
#         safe_q_data = {
#             'q_num': q_index + 1,
#             'question': current_q['q'],
#             'options': current_q['options']
#         }
#         emit('new_question', safe_q_data, broadcast=True)
#     else:
#         # Quiz is over
#         emit('quiz_end', {'message': 'The quiz is over!'}, broadcast=True)
#         game_state['quiz_active'] = False

# # --- SocketIO Event Handlers ---

# @socketio.on('disconnect')
# def handle_disconnect():
#     """Handles client disconnections."""
#     sid = flask.request.sid
#     if sid in game_state['players']:
#         del game_state['players'][sid]
#         broadcast_game_state()

# @socketio.on('join_game')
# def handle_join_game(data):
#     """Player joins the game with a username."""
#     sid = flask.request.sid
#     username = data.get('username', f'Guest-{sid[:4]}')
    
#     if any(player['username'] == username for player in game_state['players'].values()):
#         emit('join_status', {'success': False, 'message': 'Username taken. Try another.'})
#         return

#     game_state['players'][sid] = {
#         'username': username,
#         'score': 0,
#         'answered': False
#     }
    
#     emit('join_status', {'success': True, 'username': username})
#     broadcast_game_state()
#     if game_state['quiz_active'] and game_state['current_question_index'] != -1:
#          broadcast_question()
    
# @socketio.on('start_quiz')
# def handle_start_quiz():
#     """Host starts the quiz."""
#     if not game_state['players']:
#         emit('server_message', {'message': 'Cannot start quiz. No players joined.'}, broadcast=True)
#         return
        
#     for player in game_state['players'].values():
#         player['score'] = 0
#         player['answered'] = False
        
#     game_state['current_question_index'] = 0
#     game_state['quiz_active'] = True
    
#     broadcast_game_state()
#     broadcast_question()
    
# @socketio.on('submit_answer')
# def handle_submit_answer(data):
#     """Player submits an answer."""
#     sid = flask.request.sid
#     answer = data.get('answer')
    
#     if not game_state['quiz_active'] or sid not in game_state['players'] or game_state['players'][sid]['answered']:
#         return 

#     player = game_state['players'][sid]
#     current_q = game_state['questions'][game_state['current_question_index']]
    
#     player['answered'] = True
    
#     if answer == current_q['a']:
#         player['score'] += 1
#         is_correct = True
#     else:
#         is_correct = False
        
#     emit('answer_feedback', {'correct': is_correct, 'your_answer': answer, 'correct_answer': current_q['a']})
#     broadcast_game_state()

# @socketio.on('next_question')
# def handle_next_question():
#     """Host moves to the next question."""
#     if not game_state['quiz_active']:
#         emit('server_message', {'message': 'Quiz is not active.'}, broadcast=True)
#         return
        
#     game_state['current_question_index'] += 1
    
#     if game_state['current_question_index'] < len(game_state['questions']):
#         for player in game_state['players'].values():
#             player['answered'] = False
#         broadcast_question()
#     else:
#         game_state['quiz_active'] = False
#         game_state['current_question_index'] = -1
#         emit('quiz_end', {'message': 'The quiz is complete!'}, broadcast=True)


# # --- Run Server ---
# @app.route('/')
# def index():
#     return "Python SocketIO Server Running on port 5000. Connect React Client to port 5173."

# if __name__ == '__main__':
#     print("Starting Flask-SocketIO Server on http://localhost:5000")
#     eventlet.wsgi.server(eventlet.listen(('', 5000)), app)



// import React, { useState, useEffect, useCallback } from 'react';
// import io from 'socket.io-client';
// import type { PlayerScore, QuestionData, AnswerFeedback, JoinStatus } from '../types'; 

// // Connect to the Socket.IO server running on port 5000
// const socket = io('http://localhost:5000');

// const QuizApp: React.FC = () => {
  
//   // Use explicit types for state variables
//   const [username, setUsername] = useState<string>('');
//   const [isJoined, setIsJoined] = useState<boolean>(false);
//   const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
//   const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
//   const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
//   const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
//   const [serverMessage, setServerMessage] = useState<string>('');


//   // --- Socket Event Handlers ---
//   const handleJoinStatus = useCallback((data: JoinStatus) => {
//     setServerMessage(data.message || '');
//     if (data.success) {
//       setIsJoined(true);
//       setUsername(data.username || '');
//     }
//   }, []);

//   const handleUpdateLeaderboard = useCallback((data: { players: PlayerScore[] }) => {
//     setLeaderboard(data.players);
//   }, []);

//   const handleNewQuestion = useCallback((data: QuestionData) => {
//     setCurrentQuestion(data);
//     setFeedback(null);
//     setAnswerSubmitted(false);
//     setServerMessage('');
//   }, []);

//   const handleAnswerFeedback = useCallback((data: AnswerFeedback) => {
//     setFeedback(data);
//   }, []);

//   const handleQuizEnd = useCallback((data: { message: string }) => {
//     setCurrentQuestion(null);
//     setFeedback({ ...feedback, message: data.message }); // Preserve old feedback, add end message
//   }, [feedback]);
  
//   const handleServerMessage = useCallback((data: { message: string }) => {
//     setServerMessage(`Server Alert: ${data.message}`);
//   }, []);


//   // --- Connection and Listeners Setup ---
//   useEffect(() => {
//     socket.on('connect', () => console.log('Client Connected!'));
    
//     socket.on('join_status', handleJoinStatus);
//     socket.on('update_leaderboard', handleUpdateLeaderboard);
//     socket.on('new_question', handleNewQuestion);
//     socket.on('answer_feedback', handleAnswerFeedback);
//     socket.on('quiz_end', handleQuizEnd);
//     socket.on('server_message', handleServerMessage);

//     return () => {
//       socket.off('join_status', handleJoinStatus);
//       socket.off('update_leaderboard', handleUpdateLeaderboard);
//       socket.off('new_question', handleNewQuestion);
//       socket.off('answer_feedback', handleAnswerFeedback);
//       socket.off('quiz_end', handleQuizEnd);
//       socket.off('server_message', handleServerMessage);
//     };
//   }, [handleJoinStatus, handleUpdateLeaderboard, handleNewQuestion, handleAnswerFeedback, handleQuizEnd]);

//   // --- Actions (Emitting to Server) ---

//   const joinGame = () => {
//     if (username.trim()) {
//       socket.emit('join_game', { username: username.trim() });
//     } else {
//       setServerMessage('Please enter a valid username.');
//     }
//   };

//   const submitAnswer = (optionText: string) => {
//     if (answerSubmitted || !currentQuestion) return;
//     setAnswerSubmitted(true);
//     socket.emit('submit_answer', { answer: optionText });
//   };
  
//   // --- Host Controls (Emitting to Server) ---
//   const startGame = () => socket.emit('start_quiz');
//   const nextQuestion = () => socket.emit('next_question');

//   // --- Rendering Functions ---

//   const renderJoinForm = () => (
//     <div className="join-form">
//       <h3>Join the Quiz</h3>
//       <input
//         type="text"
//         placeholder="Enter your username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//         disabled={isJoined}
//       />
//       <button onClick={joinGame} disabled={isJoined}>
//         {isJoined ? `Joined as ${username}` : 'Join Quiz'}
//       </button>
//       {serverMessage && <p className="server-message">{serverMessage}</p>}
//     </div>
//   );

//   const renderQuestionArea = () => {
//     if (!currentQuestion) {
//       return <h3>{feedback?.message || 'Waiting for the host to start the quiz...'}</h3>;
//     }

//     const getOptionClass = (option: string) => {
//       if (!feedback) return '';
      
//       const isMyAnswer = option === feedback.your_answer;
//       const isCorrectAnswer = option === feedback.correct_answer;

//       if (isMyAnswer) {
//         return feedback.correct ? 'correct-answer' : 'incorrect-answer';
//       }
//       if (answerSubmitted && isCorrectAnswer) {
//         return 'correct-answer';
//       }
//       return '';
//     };

//     return (
//       <div className="question-area">
//         <h3>Question {currentQuestion.q_num}</h3>
//         <p className="question-text">{currentQuestion.question}</p>
//         <div className="options-list">
//           {currentQuestion.options.map((option, index) => (
//             <button
//               key={index}
//               className={`option-btn ${getOptionClass(option)}`}
//               onClick={() => submitAnswer(option)}
//               disabled={answerSubmitted}
//             >
//               {option}
//             </button>
//           ))}
//         </div>
//         {feedback && (
//           <p className="feedback-message">
//             {feedback.correct ? "🎉 Correct!" : `❌ Incorrect. The answer was: ${feedback.correct_answer}`}
//           </p>
//         )}
//       </div>
//     );
//   };
  
//   const renderHostControls = () => (
//       <div className="host-controls">
//           <h4>Host Controls (For Demo)</h4>
//           <button onClick={startGame}>Start Quiz</button>
//           <button 
//               onClick={nextQuestion} 
//               disabled={currentQuestion === null && feedback?.message !== 'The quiz is over!'}
//           >
//               Next Question
//           </button>
//       </div>
//   );

//   const renderLeaderboard = () => (
//     <div className="leaderboard-container">
//       <h2>Live Leaderboard</h2>
//       <ol className="leaderboard">
//         {leaderboard.map((player, index) => (
//           <li key={player.username} className={player.username === username ? 'my-player' : ''}>
//             <span style={{ fontWeight: 'bold' }}>{player.username}</span>: {player.score} points
//           </li>
//         ))}
//       </ol>
//     </div>
//   );

//   return (
//     <div className="quiz-app">
//       <h1>Real-Time Quiz App</h1>
      
//       <div className="main-content">
//         <div className="quiz-column">
//             {renderJoinForm()}
//             {isJoined && renderHostControls()} 
//             {isJoined && renderQuestionArea()}
//         </div>
        
//         <div className="leaderboard-column">
//             {renderLeaderboard()}
//         </div>
//       </div>

//       <style jsx="true">{`
//         .quiz-app { display: flex; flex-direction: column; align-items: center; font-family: sans-serif; }
//         .main-content { display: flex; width: 90%; max-width: 1200px; justify-content: space-between; margin-top: 20px; border: 1px solid #ccc; padding: 20px; border-radius: 8px; }
//         .quiz-column { width: 60%; padding-right: 20px; border-right: 1px solid #eee; }
//         .leaderboard-column { width: 35%; padding-left: 20px; }
//         .option-btn {
//           display: block; width: 100%; padding: 10px; margin: 10px 0; 
//           cursor: pointer; border: 1px solid #ccc; background-color: white;
//           transition: background-color 0.3s; font-size: 16px; border-radius: 4px;
//         }
//         .option-btn:hover:not(:disabled) { background-color: #f0f0f0; }
//         .option-btn:disabled { cursor: not-allowed; opacity: 0.7; }
//         .correct-answer { background-color: #a8e6cf !important; border-color: #38c172; font-weight: bold; }
//         .incorrect-answer { background-color: #ff8a8a !important; border-color: #e3342f; font-weight: bold; }
//         .host-controls { margin-bottom: 20px; padding: 10px; border: 1px dashed #ccc; }
//         .host-controls button { margin-right: 10px; padding: 8px 15px; background-color: #ffc107; border: none; cursor: pointer; border-radius: 4px; }
//         .my-player { color: #007bff; background-color: #e9f5ff; padding: 5px; border-radius: 3px; }
//         .server-message { color: red; font-weight: bold; }
//       `}</style>
//     </div>
//   );
// }

// export default QuizApp;