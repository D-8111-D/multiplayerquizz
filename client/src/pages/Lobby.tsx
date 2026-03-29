import React from "react";

interface Props {
  roomCode: string;
  startGame: () => void;
}

const Lobby: React.FC<Props> = ({ roomCode, startGame }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
      <h1 className="text-4xl font-bold mb-6">Lobby</h1>

      <h2 className="text-2xl mb-10">
        Room Code: <span className="font-bold">{roomCode}</span>
      </h2>

      <button
        onClick={startGame}
        className="bg-black px-8 py-4 rounded-xl hover:bg-gray-900"
      >
        Start Quiz
      </button>
    </div>
  );
};

export default Lobby;
