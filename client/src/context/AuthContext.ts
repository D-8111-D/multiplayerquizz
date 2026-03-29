import { createContext } from "react";

export interface User {
  name: string;
  password: string;
  token: string;
}

export interface DecodedToken {
  exp: number;
  user_id: string;
  user_email: string;
}

export interface AuthContextType {
  user: User | null;
  login: (name: string, password: string, token: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
