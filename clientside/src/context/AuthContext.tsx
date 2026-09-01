"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { authService, LoginPayload, RegisterPayload } from "../services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateUserContext: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session from localStorage
    try {
      const savedToken = localStorage.getItem("shopx_token");
      const savedUser = localStorage.getItem("shopx_user");
      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await authService.login(payload);
      if (res.data && res.data.accessToken) {
        const { accessToken, user: loggedUser } = res.data;
        setToken(accessToken);
        setUser(loggedUser);
        localStorage.setItem("shopx_token", accessToken);
        localStorage.setItem("shopx_user", JSON.stringify(loggedUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await authService.register(payload);
      const regData: any = res.data || res;
      const returnedToken = regData?.accessToken || regData?.token;
      const returnedUser = regData?.user || (regData?._id ? regData : null);

      if (returnedToken && returnedUser) {
        setToken(returnedToken);
        setUser(returnedUser);
        localStorage.setItem("shopx_token", returnedToken);
        localStorage.setItem("shopx_user", JSON.stringify(returnedUser));
      } else {
        // Fallback: Auto-login via login API
        await login({
          username: payload.email,
          password: payload.password
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("shopx_token");
    localStorage.removeItem("shopx_user");
  };

  const updateUserContext = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("shopx_user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserContext
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
