"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ApiClientError } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/auth/token-storage";
import type { AuthContextValue, AuthResponse, LoginInput, RegisterInput, User } from "@/types";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const handleAuthSuccess = useCallback((response: AuthResponse) => {
    if (!response.token) {
      clearStoredToken();
      setToken(null);
      setUser(null);
      return;
    }

    setStoredToken(response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const loadCurrentUser = useCallback(async () => {
    let storedToken: string | null = null;

    try {
      storedToken = getStoredToken();
    } catch {
      storedToken = null;
    }

    if (!storedToken) {
      setUser(null);
      setToken(null);
      setError(null);
      setIsLoading(false);
      setHasCheckedAuth(true);
      return;
    }

    setIsLoading(true);
    setHasCheckedAuth(false);
    setToken(storedToken);

    try {
      const response = await authApi.me();
      setUser(response.user);
      setError(null);
    } catch (requestError) {
      clearStoredToken();
      setToken(null);
      setUser(null);
      setError(toErrorMessage(requestError));
    } finally {
      setIsLoading(false);
      setHasCheckedAuth(true);
    }
  }, []);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    void loadCurrentUser();
  }, [loadCurrentUser]);

  const login = useCallback(
    async (input: LoginInput) => {
      setError(null);
      const response = await authApi.login(input);

      if (!response.token) {
        throw new ApiClientError("Login did not return an authentication token.", 500);
      }

      handleAuthSuccess(response);
      setIsLoading(false);
      setHasCheckedAuth(true);
    },
    [handleAuthSuccess]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      setError(null);
      const response = await authApi.register(input);
      handleAuthSuccess(response);
      setIsLoading(false);
      setHasCheckedAuth(true);
      return response;
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(async () => {
    setError(null);

    try {
      if (getStoredToken()) {
        await authApi.logout();
      }
    } catch {
      // Local logout should still complete if the token is already invalid.
    } finally {
      clearStoredToken();
      setToken(null);
      setUser(null);
      setIsLoading(false);
      setHasCheckedAuth(true);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      hasCheckedAuth,
      error,
      login,
      register,
      logout,
      loadCurrentUser,
      clearError: () => setError(null)
    }),
    [error, hasCheckedAuth, isLoading, loadCurrentUser, login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}
