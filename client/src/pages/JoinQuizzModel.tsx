import React, { useState } from "react";

interface Props {
  onJoin: (name: string, code: string) => void;
  close: () => void;
}

const JoinQuizModal: React.FC<Props> = ({ onJoin, close }) => {
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      {/* Modal Card */}
      <div className="bg-white w-[400px] rounded-2xl shadow-2xl p-8 animate-fadeIn">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-600">
          Join Quiz Session
        </h2>

        {/* Name Input */}
        <div className="mb-4">
          <label className=" text-sm font-semibold text-gray-600">
            Your Name
          </label>

          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full mt-1 p-3 bg-white border rounded-lg border-gray-500 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Code Input */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-600">
            Room Code
          </label>

          <input
            type="text"
            placeholder="Enter quiz code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="w-full mt-1 p-3 bg-white border rounded-lg border-gray-500 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between gap-4">
          <button
            onClick={close}
            className="flex-1 bg-gray-200 py-3 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onJoin(userName, roomCode);
            }}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Join Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinQuizModal;
