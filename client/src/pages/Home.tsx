import React from "react";

interface Props {
  openJoin: () => void;
  goLogin: () => void;
}

const Home: React.FC<Props> = () => {
  return (
    <div className="h-[calc(100vh_-_75px)] flex items-center justify-center bg-gradient-to-r from-[#1007a1] to-[#280349] text-white">
      <div className="text-center max-w-xl">
        <h1 className="text-5xl font-extrabold mb-6">
          Real-Time Quiz Platform
        </h1>

        <p className="mb-10 text-lg opacity-90">
          Create live quizzes and challenge players in real-time.
        </p>

        {/* <div className="flex justify-center gap-6">
          <button
            onClick={openJoin}
            className="bg-white text-indigo-700 px-8 py-4 rounded-xl font-semibold hover:scale-105 transition"
          >
            Join Quiz
          </button>

          <button
            onClick={goLogin}
            className="bg-black px-8 py-4 rounded-xl hover:bg-gray-900"
          >
            Host Quiz
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Home;
