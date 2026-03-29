import { useEffect, useState } from "react";
import "./App.css";
import AiQuestionGenerator from "./components/AIQuestionGenerator";
import { Route, Routes } from "react-router-dom";
import QuizzApp from "./pages/QuizzApp";
import AdminPanel from "./components/AdminPanel";
import JoinQuizModal from "./pages/JoinQuizzModel";
import Navbar from "./pages/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateSession from "./pages/CreateSession";
import Lobby from "./pages/Lobby";
import { useNavigate } from "react-router-dom";
import type { Question } from "./data-access/model/types";
import type { Socket } from "socket.io-client";

type Page = "HOME" | "LOGIN" | "DASHBOARD" | "CREATE" | "LOBBY";
const App: React.FC = () => {
  const [count, setCount] = useState(0);

  const [page, setPage] = useState<Page>("HOME");
  const [showJoin, setShowJoin] = useState(false);
  const [isJoining, setIsJoining] = useState(true);
  const [roomCode, setRoomCode] = useState("");
  const [joinData, setJoinData] = useState<any>(null);

  const startRoom = (questions: Question[]) => {
    const code = Math.random().toString(36).substring(2, 6);
    setRoomCode(code);
    setPage("LOBBY");
  };

  const navigate = useNavigate();
  useEffect(() => {
    setIsJoining(page !== "LOBBY" && page !== "CREATE");
  }, [page]);

  return (
    <div className="h-screen bg-gradient-to-r from-[#1007a1] to-[#280349] text-white">
      <Navbar
        isJoining={isJoining}
        openJoin={() => setShowJoin(true)}
        goHome={() => {
          setPage("HOME");
          setIsJoining(true);
        }}
        goDashboard={() => {
          setPage("DASHBOARD");
          setIsJoining(true);
        }}
        goLogin={() => setPage("LOGIN")}
      />

      {/* {page === "HOME" && (
        <Home
          openJoin={() => setShowJoin(true)}
          goLogin={() => setPage("LOGIN")}
        />
      )}

      

      {page === "DASHBOARD" && (
        <Dashboard createSession={() => setPage("CREATE")} />
      )} */}

      {page === "LOGIN" && (
        <Login
          goDashboard={() => setPage("DASHBOARD")}
          close={() => setPage("HOME")}
        />
      )}
      {/* {page === "CREATE" && <CreateSession joinData={joinData} />} */}

      {/* {page === "LOBBY" && (
        <Lobby
          roomCode={roomCode}
          startGame={() => console.log("start game")}
        />
      )} */}

      {showJoin && (
        <JoinQuizModal
          close={() => {
            setShowJoin(false);
          }}
          onJoin={(userName, roomCode) => {
            setJoinData({ userName, roomCode });
            setShowJoin(false);
            setPage("CREATE");
            navigate("/session");
          }}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <Home
              openJoin={() => setShowJoin(true)}
              goLogin={() => setPage("LOGIN")}
            />
          }
        />
        <Route
          path="/dashboard"
          element={<Dashboard createSession={() => setPage("CREATE")} />}
        />
        <Route
          path="/session"
          element={<CreateSession joinData={joinData} />}
        />
        <Route path="/admin/ai-generator" element={<AiQuestionGenerator />} />
        <Route path="/admin/questions" element={<AdminPanel />} />
      </Routes>
    </div>
  );
};

export default App;
