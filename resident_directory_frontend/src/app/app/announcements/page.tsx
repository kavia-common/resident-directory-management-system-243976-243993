"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAnnouncements } from "@/features/announcements/api";
import { ApiError } from "@/lib/api";

export default function AnnouncementsPage() {
  const { token, role } = useAuth();

  const query = useQuery({
    queryKey: ["announcements"],
    queryFn: () => fetchAnnouncements({ token: token! }),
    enabled: Boolean(token),
  });

  return (
    <RequireAuth>
      <AppShell title="Announcements">
        <section className="card">
          <div className="card-body" style={{ display: "grid", gap: 12 }}>
            <div>
              <div className="title">Announcements</div>
              <div className="subtitle">
                Building-wide updates from admins. {role === "admin" ? "Manage these in Admin." : ""}
              </div>
            </div>

            {query.isLoading ? <div className="subtitle">Loading…</div> : null}

            {query.isError ? (
              <div className="card" style={{ borderColor: "rgba(239,68,68,0.4)" }} role="alert">
                <div className="card-body" style={{ color: "var(--danger)" }}>
                  {(query.error as ApiError).message || "Failed to load announcements."}
                </div>
              </div>
            ) : null}

            {query.data && query.data.length === 0 ? (
              <div className="subtitle">No announcements yet.</div>
            ) : null}

            {query.data ? (
              <div style={{ display: "grid", gap: 10 }}>
                {query.data.map((a) => (
                  <article key={a.id} className="card">
                    <div className="card-body" style={{ display: "grid", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div className="title">{a.title}</div>
                        <span className="badge badge-muted">{new Date(a.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ whiteSpace: "pre-wrap" }}>{a.body}</div>
                      <div className="subtitle">Posted by {a.createdBy || "Admin"}</div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </AppShell>
    </RequireAuth>
  );
}
