"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Role, Session, SessionSchema } from "@/lib/types";

type AuthState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; session: Session };

type AuthContextValue = {
  state: AuthState;
  token: string | null;
  role: Role | null;
  user: Session["user"] | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "rd_session_v1";

function deriveRole(roles: unknown): Role {
  const list = Array.isArray(roles) ? roles.map(String) : [];
  return list.includes("admin") ? "admin" : "resident";
}

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

    /**
     * Backend:
     * - POST /auth/login expects OAuth2PasswordRequestForm (application/x-www-form-urlencoded)
     * - returns { access_token, token_type }
     */
    const body = new URLSearchParams();
    body.set("username", email);
    body.set("password", password);

    const tokenRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3001"}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );

    const tokenData = await tokenRes.json().catch(() => null);
    if (!tokenRes.ok) {
      const detail =
        tokenData && typeof tokenData === "object" && "detail" in tokenData
          ? String((tokenData as any).detail)
          : "Login failed";
      throw new Error(detail);
    }

    const accessToken = String(tokenData?.access_token || "");
    if (!accessToken) throw new Error("Login failed: missing access token");

    const me = await apiRequest<{ id: string; email: string; roles: string[] }>({
      path: "/auth/me",
      method: "GET",
      token: accessToken,
    });

    const role = deriveRole(me.roles);

    // Reasonable default: use email local-part as displayName until profile is loaded.
    const displayName = me.email?.split("@")[0] || me.email;

    const session: Session = {
      token: accessToken,
      role,
      user: { id: me.id, email: me.email, displayName },
    };

    // Validate before storing
    const validated = SessionSchema.parse(session);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    setState({ status: "authenticated", session: validated });
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
