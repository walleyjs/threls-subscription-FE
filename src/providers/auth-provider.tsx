"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { config } from "@/config";
import { apiService } from "@/services/api-service";

type User = {
  _id: string;
  role: string;
};

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthContextType = {
  user: User | null;
  tokens: Tokens | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    firstName: string,
    lastName: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem(config.auth.userStorageKey);
    const storedTokens = localStorage.getItem(config.auth.tokenStorageKey);

    if (storedUser && storedTokens) {
      setUser(JSON.parse(storedUser));
      setTokens(JSON.parse(storedTokens));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${config.api.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.statusCode !== "10000") {
        throw new Error(data.message || "Login failed");
      }

      const { user, tokens } = data.data;

      setUser(user);
      setTokens(tokens);

      localStorage.setItem(config.auth.userStorageKey, JSON.stringify(user));
      localStorage.setItem(config.auth.tokenStorageKey, JSON.stringify(tokens));

      toast({
        title: "Success",
        description: "You have successfully logged in",
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    firstName: string,
    lastName: string,
    password: string
  ) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${config.api.baseUrl}/signup/basic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, firstName, lastName, password }),
      });

      const data = await response.json();

      if (data.statusCode !== "10000") {
        throw new Error(data.message || "Registration failed");
      }

      const { user, tokens } = data.data;
      setUser(user);
      setTokens(tokens);

      localStorage.setItem(config.auth.userStorageKey, JSON.stringify(user));
      localStorage.setItem(config.auth.tokenStorageKey, JSON.stringify(tokens));

      toast({
        title: "Success",
        description: "You have successfully registered and logged in",
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await apiService.logout();
    setUser(null);
    setTokens(null);
    localStorage.removeItem(config.auth.userStorageKey);
    localStorage.removeItem(config.auth.tokenStorageKey);

    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, tokens, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
