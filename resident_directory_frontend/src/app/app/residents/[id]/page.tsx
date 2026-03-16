"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { fetchResident } from "@/features/residents/api";
import { ApiError } from "@/lib/api";
import Link from "next/link";

export default function ResidentProfilePage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();

  const query = useQuery({
    queryKey: ["resident", params.id],
    queryFn: () => fetchResident({ token: token!, id: params.id }),
    enabled: Boolean(token && params?.id),
  });

  return (
    <RequireAuth>
      <AppShell title="Resident Profile">
        <section className="card">
          <div className="card-body" style={{ display: "grid", gap: 12 }}>
            <Link className="btn" href="/app/directory">
              ← Back to directory
            </Link>

            {query.isLoading ? <div className="subtitle">Loading profile…</div> : null}

            {query.isError ? (
              <div className="card" style={{ borderColor: "rgba(239,68,68,0.4)" }} role="alert">
                <div className="card-body" style={{ color: "var(--danger)" }}>
                  {(query.error as ApiError).message || "Failed to load profile."}
                </div>
              </div>
            ) : null}

            {query.data ? (
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <div className="title">{query.data.displayName}</div>
                  <div className="subtitle">
                    Unit {query.data.unit || "—"} · <span className="badge">{query.data.visibility}</span>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ display: "grid", gap: 8 }}>
                    <div className="subtitle">Bio</div>
                    <div>{query.data.bio || <span className="subtitle">No bio provided.</span>}</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ display: "grid", gap: 8 }}>
                    <div className="subtitle">Contact</div>
                    <div className="subtitle">
                      Email: {query.data.email || "—"} <br />
                      Phone: {query.data.phone || "—"}
                    </div>
                    <div className="subtitle">
                      If the resident hides contact info, you can still submit a contact request.
                    </div>
                    <Link className="btn btn-primary" href="/app/requests">
                      Send contact request
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </AppShell>
    </RequireAuth>
  );
}
