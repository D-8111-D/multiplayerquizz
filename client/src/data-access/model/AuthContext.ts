import { createContext } from "react";

export interface User {
  name: string;
}

export interface AuthContextType {
  user: User | null;
  login: (name: string, password: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
