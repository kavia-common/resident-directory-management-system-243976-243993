"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Session, SessionSchema } from "@/lib/types";

type AuthState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; session: Session };

type AuthContextValue = {
  state: AuthState;
  token: string | null;
  role: Session["role"] | null;
  user: Session["user"] | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "rd_session_v1";

// PUBLIC_INTERFACE
export function AuthProvider({ children }: { children: React.ReactNode }) {
  /** Provides login/logout and current session state. */
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setState({ status: "anonymous" });
        return;
      }
      const parsed = SessionSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) {
        localStorage.removeItem(STORAGE_KEY);
        setState({ status: "anonymous" });
        return;
      }
      setState({ status: "authenticated", session: parsed.data });
    } catch {
      setState({ status: "anonymous" });
    }
  }, []);

  async function login(email: string, password: string) {
    setState({ status: "loading" });

    // NOTE: Backend OpenAPI is minimal; these endpoints are expected by the work-item.
    // If backend differs, adjust paths here to match.
    const session = await apiRequest<Session>({
      path: "/auth/login",
      method: "POST",
      body: { email, password },
      schema: SessionSchema,
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setState({ status: "authenticated", session });
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setState({ status: "anonymous" });
  }

  const value = useMemo<AuthContextValue>(() => {
    if (state.status === "authenticated") {
      return {
        state,
        token: state.session.token,
        role: state.session.role,
        user: state.session.user,
        login,
        logout,
      };
    }
    return {
      state,
      token: null,
      role: null,
      user: null,
      login,
      logout,
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access auth state and actions. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
