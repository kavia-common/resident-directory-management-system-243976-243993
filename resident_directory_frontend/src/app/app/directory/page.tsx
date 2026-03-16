"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDirectory } from "@/features/directory/api";
import { ApiError } from "@/lib/api";

export default function DirectoryPage() {
  const { token } = useAuth();
  const [q, setQ] = useState("");
  const [visibility, setVisibility] = useState<"public" | "residents_only" | "private" | "">("");

  const queryKey = useMemo(() => ["directory", q, visibility], [q, visibility]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      fetchDirectory({
        token: token!,
        q: q.trim() || undefined,
        visibility: visibility || undefined,
      }),
    enabled: Boolean(token),
  });

  return (
    <RequireAuth>
      <AppShell title="Directory">
        <section className="card">
          <div className="card-body" style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <div className="title">Resident Directory</div>
              <div className="subtitle">
                Search and filter residents. Individual profiles respect privacy settings.
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
                gridTemplateColumns: "1fr 220px",
              }}
            >
              <input
                className="input"
                placeholder="Search by name, unit, email…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <select
                className="select"
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as "public" | "residents_only" | "private" | "")
                }
              >
                <option value="">All visibility</option>
                <option value="public">Public</option>
                <option value="residents_only">Residents only</option>
                <option value="private">Private</option>
              </select>
            </div>

            {query.isLoading ? <div className="subtitle">Loading directory…</div> : null}

            {query.isError ? (
              <div className="card" style={{ borderColor: "rgba(239,68,68,0.4)" }} role="alert">
                <div className="card-body" style={{ color: "var(--danger)" }}>
                  {(query.error as ApiError).message || "Failed to load directory."}
                </div>
              </div>
            ) : null}

            {query.data ? (
              <div style={{ overflowX: "auto" }}>
                <table className="table" aria-label="Resident directory table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Unit</th>
                      <th>Visibility</th>
                      <th>Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {query.data.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <Link className="btn" href={`/app/residents/${r.id}`}>
                            {r.displayName}
                          </Link>
                        </td>
                        <td>{r.unit || "—"}</td>
                        <td>
                          <span className="badge">{r.visibility}</span>
                        </td>
                        <td className="subtitle">
                          {r.visibility === "private" ? "Hidden" : r.email || r.phone || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </section>
      </AppShell>
    </RequireAuth>
  );
}
