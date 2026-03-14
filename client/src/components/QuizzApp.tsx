import React, { useState, useEffect, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import type {
  Player,
  Room,
  View,
  AnswerStatus,
  QuestionSocket,
  Question,
} from "../data-access/model/types"; // Import types from types.ts
import QuestionListPanel from "./QuestionListPanel";

const SERVER_URL = "http://localhost:5000";

// Tailwind configuration assumed to be available
const baseCardClass =
  "card p-6 rounded-xl shadow-xl border border-gray-700 bg-gray-900";
const buttonPrimaryClass =
  "w-full p-3 rounded-lg font-semibold shadow-md transition duration-150 ease-in-out transform active:scale-[0.98]";

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [view, setView] = useState<View>("HOME");
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>({
    qIndex: -1,
    status: "pending",
  });

  // --- SOCKET SETUP ---
  useEffect(() => {
    console.log("🔥 SOCKET CREATED");
    const newSocket = io(SERVER_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server with ID:", newSocket.id);
      setError(null);
    });

    newSocket.on("error_message", (message: string) => {
      setError(message);
    });

    newSocket.on(
      "room_created",
      (data: { roomCode: string; isHost: boolean }) => {
        setRoomCode(data.roomCode);
        setIsHost(data.isHost);
        setView("LOBBY");
      },
    );

    newSocket.on(
      "room_joined",
      (data: { roomCode: string; isHost: boolean }) => {
        setRoomCode(data.roomCode);
        setIsHost(data.isHost);
        setView("LOBBY");
      },
    );

    // --- REAL-TIME LISTENERS ---
    newSocket.on("room_update", (room: Room) => {
      setRoomData(room);
      if (room.status === "ENDED") {
        setView("RESULTS");
      } else if (room.status === "IN_GAME" && view !== "GAME") {
        setView("GAME");
      } else if (room.status === "LOBBY" && view !== "LOBBY" && roomCode) {
        setView("LOBBY");
      }
    });

    newSocket.on("players_update", (playersList: Player[]) => {
      setPlayers(playersList);
    });

    newSocket.on("answer_received", (data: AnswerStatus) => {
      setAnswerStatus({ qIndex: data.qIndex, status: "received" });
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setError("Lost connection to the server. Please refresh.");
    });

    return () => {
      console.log("🔥 SOCKET DESTROYED");
      newSocket.disconnect();
    };
  }, []);
  // [view, roomCode]); // Dependency on view/roomCode to re-establish state transitions

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (
      !roomData ||
      roomData.status !== "IN_GAME" ||
      roomData.current_question_start_time === null
    ) {
      setQuestionTimer(roomData?.max_time || 0);
      return;
    }

    const maxTimeMs = roomData.max_time * 1000;
    const startTimeMs = roomData.current_question_start_time * 1000;

    const updateTimer = () => {
      const elapsed = Date.now() - startTimeMs;
      const remaining = maxTimeMs - elapsed;

      if (remaining <= 0) {
        setQuestionTimer(0);
        return;
      }

      setQuestionTimer(Math.ceil(remaining / 1000));
    };

    // Initialize and set interval
    updateTimer();
    const interval = setInterval(updateTimer, 500);

    return () => clearInterval(interval);
  }, [roomData]);

  // --- ACTIONS ---
  const handleCreateRoom = () => {
    if (!socket || !userName) {
      setError("Enter your name.");
      return;
    }
    if (selectedQuestions.length === 0) {
      setError("Select at least one question.");
      return;
    }
    socket.emit("create_room", { userName, questions: selectedQuestions });
    // setView('HOST_SETUP');
    // setRoomCode(roomCode);
  };

  const handleJoinRoom = () => {
    if (!socket || !userName || roomCode.length !== 4) {
      setError("Enter name and 4-char code.");
      return;
    }
    socket.emit("join_room", { userName, roomCode: roomCode.toUpperCase() });
  };

  const handleStartQuiz = () => {
    if (!socket || !roomCode) return;
    socket.emit("start_quiz", { roomCode });
  };

  const handleNextQuestion = () => {
    if (!socket || !roomCode || !isHost) return;
    socket.emit("host_next_question", { roomCode });
    setAnswerStatus({ qIndex: -1, status: "pending" }); // Reset answer status for next question
  };

  const handleAnswer = (qIndex: number, answer: number) => {
    if (
      !socket ||
      !roomCode ||
      !roomData ||
      roomData.status !== "IN_GAME" ||
      answerStatus.status === "received"
    )
      return;

    // Optimistically set status to prevent double clicks
    setAnswerStatus({ qIndex: qIndex, status: "received" });

    socket.emit("submit_answer", { roomCode, qIndex, answer });
  };

  // --- UTILITIES ---
  const currentPlayer = useMemo(() => {
    return players.find((p) => p.id === socket?.id);
  }, [players, socket]);

  // --- RENDER HELPERS ---
  const renderHeader = () => (
    <header className="p-4 shadow-lg bg-gray-800 border-b border-gray-700 flex justify-between items-center rounded-lg mb-6">
      <h1 className="text-3xl font-bold text-green-400">Quiz Concert</h1>
      <div className="text-sm font-semibold text-right">
        {roomCode && (
          <span className="mr-2">
            ROOM: <span className="text-yellow-400">{roomCode}</span>
          </span>
        )}
        {userName && (
          <span>
            USER: <span className="text-blue-400">{userName}</span>
          </span>
        )}
        {isHost && <span className="ml-2 text-red-400 font-bold">(HOST)</span>}
        {socket?.id && (
          <span className="ml-2 text-xs text-gray-500 hidden md:inline">
            ID: {socket.id}
          </span>
        )}
      </div>
    </header>
  );

  const renderHomeView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <div className={`${baseCardClass} flex flex-col items-center`}>
        <h2 className="text-2xl font-bold mb-4 text-green-400">
          Host a New Quiz
        </h2>
        <input
          type="text"
          placeholder="Enter Host Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full p-3 mb-4 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-green-500 focus:border-green-500"
        />
        <button
          onClick={handleCreateRoom}
          className={`${buttonPrimaryClass} bg-green-600 hover:bg-green-700 text-white text-lg`}
        >
          Create Room
        </button>
      </div>
      <div className={`${baseCardClass} flex flex-col items-center`}>
        <h2 className="text-2xl font-bold mb-4 text-blue-400">
          Join a Quiz Room
        </h2>
        <input
          type="text"
          placeholder="Enter Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full p-3 mb-4 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Enter Room Code (e.g. ABCD)"
          maxLength={4}
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          className="w-full p-3 mb-4 rounded-md bg-gray-700 text-white border border-gray-600 uppercase text-center tracking-widest font-mono text-xl focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={handleJoinRoom}
          className={`${buttonPrimaryClass} bg-blue-600 hover:bg-blue-700 text-white text-lg`}
        >
          Join Room
        </button>
      </div>
    </div>
  );
  // const renderQuestionList = () => <QuestionListPanel />;
  // <QuestionListPanel />;
  const renderHostSetupView = () => (
    <div className={`${baseCardClass} max-w-xl mx-auto text-center`}>
      <h2 className="text-3xl font-bold mb-4 text-yellow-400">
        Setup Complete
      </h2>
      <p className="text-gray-300">
        Room creation request sent. Waiting for server confirmation...
      </p>
      <h1 className="text-3xl font-bold mb-4 text-pink-400">
        Room Code : {roomCode}
      </h1>
    </div>
  );

  const renderLobbyView = () => {
    if (!roomData) return null;

    const hostActions = isHost ? (
      <div className="mt-6 p-4 border border-green-600 bg-green-900/20 rounded-lg">
        <p className="text-green-400 font-semibold mb-2">Host Controls</p>
        <button
          onClick={handleStartQuiz}
          className={`${buttonPrimaryClass} ${
            players.length < 2
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          } text-white text-xl font-bold`}
          disabled={players.length < 2}
        >
          Start Quiz ({players.length} / 2 Min)
        </button>
      </div>
    ) : (
      <div className="mt-6 p-4 border border-blue-600 bg-blue-900/20 rounded-lg text-center">
        <p className="text-blue-400 font-semibold text-lg">
          Waiting for the host to start the game...
        </p>
      </div>
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className={`${baseCardClass} lg:col-span-2`}>
          <h2 className="text-3xl font-bold mb-4 text-yellow-400">
            Lobby: Room Code {roomCode}
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            Share the code with your friends!
          </p>
          {hostActions}
        </div>
        {renderLiveRoomBoard()}
      </div>
    );
  };

  const renderLiveRoomBoard = () => (
    <div className={`${baseCardClass} lg:col-span-1`}>
      <h2 className="text-2xl font-bold mb-4 text-blue-400">
        Live Room Board ({players.length} Players)
      </h2>
      <ul className="space-y-2">
        {players.map((p) => (
          <li
            key={p.id}
            className={`flex justify-between items-center p-3 rounded-lg ${
              p.id === socket?.id ? "bg-blue-700/50 font-bold" : "bg-gray-800"
            }`}
          >
            <span>{p.name}</span>
            <span className="text-sm text-gray-400">
              {p.id === roomData?.host_sid ? "(Host)" : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderGameView = () => {
    if (!roomData || roomData.current_question_index === -1) return null;

    const qIndex = roomData.current_question_index;
    const question: QuestionSocket = roomData.questions[qIndex];
    const maxTime = roomData.max_time;
    const player = currentPlayer;

    // Check player's answer for this question
    const playerAnswerData = player?.answers[qIndex];
    const hasAnswered = !!playerAnswerData;
    const isTimeUp = questionTimer <= 0;

    const isAnswerSubmitted =
      answerStatus.qIndex === qIndex && answerStatus.status === "received";

    // Time calculations for progress bar
    const startTimeMs = roomData.current_question_start_time
      ? roomData.current_question_start_time * 1000
      : Date.now();
    const elapsed = Math.min(maxTime * 1000, Date.now() - startTimeMs);
    const progressPercent = Math.max(
      0,
      100 - (elapsed / (maxTime * 1000)) * 100,
    );

    const renderQuestionContent = () => {
      let feedback = "";
      let feedbackClass = "bg-gray-700";

      // 1. Time Up or Player Answered: Show results/feedback
      if (!hasAnswered) {
        feedback = "Time Up! You did not submit an answer.";
        feedbackClass = "bg-red-800 border-red-500";
      }
      if (isTimeUp && hasAnswered) {
        if (playerAnswerData) {
          if (playerAnswerData.correct) {
            feedback = `✅ Correct! (+${
              playerAnswerData.score
            } pts in ${playerAnswerData.time_taken.toFixed(2)}s)`;
            feedbackClass = "bg-green-800 border-green-500";
          } else {
            feedback = "❌ Incorrect.";
            feedbackClass = "bg-red-800 border-red-500";
          }
        }

        return (
          <div className="mt-8">
            <div
              className={`p-4 rounded-lg text-center font-bold text-xl border-2 ${feedbackClass} mb-4`}
            >
              {feedback}
            </div>
            <p className="text-lg font-bold mt-4 text-yellow-400">
              The Correct Answer Was:
            </p>
            <div className="p-3 bg-gray-600 rounded-lg text-center font-bold text-xl">
              {question.options[question.correct_index]}
            </div>

            {/* Host controls to advance */}
            {isHost && isTimeUp && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleNextQuestion}
                  className={`${buttonPrimaryClass} bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold`}
                >
                  {qIndex + 1 < roomData.questions.length
                    ? "Move to Next Question"
                    : "End Quiz & Show Results"}
                </button>
              </div>
            )}
          </div>
        );
      }

      // 2. Waiting for Answer
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {question.question}
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(qIndex, index)}
              disabled={isAnswerSubmitted}
              className={`${
                isAnswerSubmitted
                  ? "bg-gray-600 cursor-wait"
                  : "bg-gray-700 hover:bg-gray-600"
              } p-4 rounded-lg text-lg font-semibold text-left transition duration-150 ease-in-out`}
            >
              {String.fromCharCode(65 + index)}. {option}
            </button>
          ))}
          {isAnswerSubmitted && (
            <div className="sm:col-span-2 text-center mt-4 text-green-400 font-bold">
              Answer submitted. Waiting for time to expire...
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className={`${baseCardClass} lg:col-span-2`}>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Question {qIndex + 1} of {roomData.questions.length}
          </h3>
          <h2 className="text-4xl font-extrabold mb-6 text-white">
            {question.question}
          </h2>

          {/* Timer and Progress Bar */}
          <div className="mb-6">
            <div className="text-center text-lg font-bold mb-2">
              {isTimeUp ? (
                <span className="text-red-400">TIME UP!</span>
              ) : (
                `Time Remaining: ${questionTimer}s`
              )}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className={`progress-bar h-4 rounded-full ${
                  isTimeUp ? "bg-red-500" : "bg-green-500"
                } transition-width duration-500`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {renderQuestionContent()}
        </div>
        {renderGameLeaderboard(qIndex, isTimeUp)}
      </div>
    );
  };

  const renderGameLeaderboard = (qIndex: number, isTimeUp: boolean) => {
    const sortedPlayers = [...players]; // Already sorted by the server

    const listItems = sortedPlayers.map((p, index) => {
      const answerData = p.answers[qIndex];
      let status = "";

      if (!isTimeUp) {
        // During Question Timer
        status = answerData
          ? `<span class="text-green-400">Answered (${answerData.time_taken.toFixed(
              1,
            )}s)</span>`
          : `<span class="text-gray-500">Thinking...</span>`;
      } else {
        // After Timer Ends (Show Results)
        if (answerData) {
          const result = answerData.correct ? "✅" : "🚫";
          const score = answerData.score > 0 ? ` (+${answerData.score})` : "";
          status = `${result}${score}`;
        } else {
          status = "🚫 (No Answer)";
        }
      }

      // Rank icon logic (only show after time up for final rankings)
      let rankIcon = "";
      if (isTimeUp) {
        if (index === 0) rankIcon = "🥇";
        else if (index === 1) rankIcon = "🥈";
        else if (index === 2) rankIcon = "🥉";
      }

      return (
        <li
          key={p.id}
          className={`flex justify-between items-center p-3 rounded-lg ${
            p.id === socket?.id ? "bg-blue-700/50 font-bold" : "bg-gray-800"
          }`}
        >
          <div className="flex items-center">
            <span className="w-6 text-xl mr-2">{rankIcon}</span>
            <span>{p.name}</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">{p.score} pts</div>
            <div
              className="text-sm text-gray-400"
              dangerouslySetInnerHTML={{ __html: status }}
            ></div>
          </div>
        </li>
      );
    });

    return (
      <div className={`${baseCardClass} lg:col-span-1`}>
        <h2 className="text-2xl font-bold mb-4 text-yellow-500">
          Live Leaderboard
        </h2>
        <ul className="space-y-2">{listItems}</ul>
      </div>
    );
  };

  const renderResultsView = () => {
    const finalLeaderboard = players.map((p, index) => {
      let rankIcon = "";
      let rankClass = "bg-gray-800";
      if (index === 0) {
        rankIcon = "🥇 WINNER!";
        rankClass = "bg-yellow-900/50 text-yellow-300";
      } else if (index === 1) {
        rankIcon = "🥈";
        rankClass = "bg-gray-600/50";
      } else if (index === 2) {
        rankIcon = "🥉";
        rankClass = "bg-orange-700/50";
      }

      return (
        <li
          key={p.id}
          className={`flex justify-between items-center p-4 rounded-lg mb-2 border border-gray-700 ${rankClass}`}
        >
          <div className="flex items-center">
            <span className="w-8 text-xl font-bold text-center mr-2">
              {index + 1}.
            </span>
            <span className="text-xl font-bold">{p.name}</span>
          </div>
          <div className="text-right">
            <div className="font-extrabold text-2xl">{p.score} pts</div>
            <span className="text-lg">{rankIcon}</span>
          </div>
        </li>
      );
    });

    return (
      <div className={`${baseCardClass} max-w-3xl mx-auto text-center`}>
        <h2 className="text-5xl font-extrabold mb-4 text-green-400">
          QUIZ CONCERT ENDED!
        </h2>
        <p className="text-2xl mb-8 text-yellow-400">Final Scores are in!</p>

        <h3 className="text-3xl font-bold mb-4 text-blue-400">
          Final Leaderboard
        </h3>
        <ul className="space-y-3 text-left">{finalLeaderboard}</ul>

        <button
          onClick={() => window.location.reload()}
          className="bg-gray-700 hover:bg-gray-600 text-white mt-8 p-3 rounded-lg font-semibold"
        >
          Start a New Quiz
        </button>
      </div>
    );
  };

  const renderMainContent = () => {
    switch (view) {
      case "HOME":
        return renderHomeView();
      case "HOST_SETUP":
        return renderHostSetupView();
      case "LOBBY":
        return renderLobbyView();
      case "GAME":
        return renderGameView();
      case "RESULTS":
        return renderResultsView();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8">
      <div className="container mx-auto">
        {renderHeader()}

        {error && (
          <div className="bg-red-900 border border-red-500 text-red-100 p-4 rounded-lg mb-6 text-center">
            Error: {error}
          </div>
        )}

        {renderMainContent()}
      </div>
      <QuestionListPanel onSelectionChange={(q) => setSelectedQuestions(q)} />
    </div>
  );
};

export default App;
