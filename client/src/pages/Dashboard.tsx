import React, { useState } from "react";
import QuestionListPanel from "../components/QuestionListPanel";
import type { Question } from "../data-access/model/types";
import AdminPanel from "../components/AdminPanel";
import AiQuestionGenerator from "../components/AIQuestionGenerator";
import { Navigate, useNavigate } from "react-router-dom";
interface Props {
  createSession: () => void;
}

const Dashboard: React.FC<Props> = ({ createSession }) => {
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  type ViewType = "admin" | "ai" | null;
  const [view, setView] = useState<ViewType>(null);

  const isLoggedIn = !!localStorage.getItem("quiz_user");
  const navigate = useNavigate();
  const handleGenerateClick = () => {
    if (!isLoggedIn) {
      setShowAuth(true);
    } else {
      setShowDialog(true);
    }
  };

  return (
    <div className="h-[calc(100vh_-_75px)] bg-gradient-to-r from-[#1007a1] to-[#280349] p-4 gap-10">
      {/* <h1 className="text-3xl font-bold mb-8 text-white">Host Dashboard</h1> */}

      <div className="h-[80px] grid md:grid-rows-1 gap-8">
        <div className="bg-gradient-to-br from-purple-500/80 to-indigo-600/80 p-10 rounded-xl shadow flex flex-row justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Create Quiz Session
          </h2>

          <button
            onClick={() => {
              createSession();
              navigate("/session");
            }}
            className="bg-green-600 px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Create Session
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500/80 to-indigo-600/80 p-4 rounded-xl flex flex-col justify-center shadow mt-14 h-[calc(100%-80px)]">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold text-gray-800">All Questions</h2>
            <button onClick={() => handleGenerateClick()}>
              Generate Questions
            </button>
          </div>
          {showDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
              <div className="relative bg-white p-6 rounded-xl w-[550px] pt-9 flex gap-2 justify-between">
                <p
                  onClick={showDialog ? () => setShowDialog(false) : undefined}
                  className="absolute top-1 right-3 text-gray-800 hover:text-gray-900 cursor-pointer text-2xl font-bold"
                >
                  x
                </p>
                <button
                  className="flex items-center justify-center text-white w-[250px]"
                  onClick={() => {
                    setView("admin");
                    setShowDialog(false);
                    navigate("/admin/questions");
                  }}
                >
                  Manual Question Generator
                </button>

                <button
                  className="flex items-center justify-center text-white w-[250px]"
                  onClick={() => {
                    setView("ai");
                    setShowDialog(false);
                    navigate("/admin/ai-generator");
                  }}
                >
                  AI Question Generator
                </button>
              </div>
            </div>
          )}

          {isLoggedIn && (
            <QuestionListPanel
              onSelectionChange={(q) => setSelectedQuestions(q)}
              isActionable={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
