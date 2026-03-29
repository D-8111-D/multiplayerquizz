import React from "react";
import { useAuth } from "../context/UseAuth";
import { useNavigate } from "react-router-dom";

interface Props {
  isJoining: boolean;
  openJoin: () => void;
  goHome: () => void;
  goDashboard: () => void;
  goLogin: () => void;
}

const Navbar: React.FC<Props> = ({
  isJoining,
  openJoin,
  goHome,
  goDashboard,
  goLogin,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    goHome(); // redirect to home page
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <h1
          onClick={goHome}
          className="text-2xl font-bold cursor-pointer text-indigo-400"
        >
          QuizStream
        </h1>

        <div className="flex gap-4 items-center">
          {
            <button
              onClick={openJoin}
              className="hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              Enter Code
            </button>
          }

          {user ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="hover:bg-green-700 px-4 py-2 rounded-lg"
              >
                Dashboard
              </button>

              <button
                onClick={() => {
                  handleLogout();
                  navigate("/");
                }}
                className="hover:bg-red-600 px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={goLogin}
              className="border border-gray-500 px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
