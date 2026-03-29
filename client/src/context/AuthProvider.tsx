import React, { useEffect, useState } from "react";
import { AuthContext, type DecodedToken, type User } from "./AuthContext";
import { jwtDecode } from "jwt-decode";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("quiz_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: DecodedToken = jwtDecode(token);

      const currentTime = Date.now() / 1000; // convert to seconds

      return decoded.exp < currentTime;
    } catch (err) {
      return true;
    }
  };
  const login = (name: string, password: string, token: string) => {
    if (token) {
      if (isTokenExpired(token)) {
        logout(); // 🚪 auto logout
      } else {
        const userData = { name, password, token };
        setUser(userData);
        localStorage.setItem("quiz_user", JSON.stringify(userData));
        return true;
      }
    }

    // if (name === "host" && password === "1234") {
    //   const userData = { name };

    //   setUser(userData);
    //   localStorage.setItem("quiz_user", JSON.stringify(userData));

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("quiz_user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
