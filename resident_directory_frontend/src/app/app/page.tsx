"use client";

import React from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";

export default function AppHomePage() {
  const { user, role } = useAuth();

  return (
    <RequireAuth>
      <AppShell title="Home">
        <section className="card">
          <div className="card-body" style={{ display: "grid", gap: 10 }}>
            <div className="title">Welcome back, {user?.displayName}</div>
            <p className="subtitle">
              Role: <span className="badge">{role}</span>
            </p>
            <div className="subtitle">
              Use the sidebar to browse residents, read announcements, and manage contact requests.
            </div>
          </div>
        </section>
      </AppShell>
    </RequireAuth>
  );
}
