"use client";

import React, { useMemo, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { createRequest, fetchMyRequests, updateRequestStatus } from "@/features/requests/api";

export default function RequestsPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [banner, setBanner] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["contact-requests"],
    queryFn: () => fetchMyRequests({ token: token! }),
    enabled: Boolean(token),
  });

  const createMutation = useMutation({
    mutationFn: (body: { toResidentId: string; message: string }) =>
      createRequest({ token: token!, ...body }),
    onSuccess: async () => {
      setBanner("Request sent.");
      await qc.invalidateQueries({ queryKey: ["contact-requests"] });
      setTimeout(() => setBanner(null), 2000);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (body: { id: string; status: "accepted" | "declined" }) =>
      updateRequestStatus({ token: token!, ...body }),
    onSuccess: async () => {
      setBanner("Updated.");
      await qc.invalidateQueries({ queryKey: ["contact-requests"] });
      setTimeout(() => setBanner(null), 2000);
    },
  });

  const grouped = useMemo(() => {
    const data = query.data || [];
    const pending = data.filter((r) => r.status === "pending");
    const other = data.filter((r) => r.status !== "pending");
    return { pending, other };
  }, [query.data]);

  return (
    <RequireAuth>
      <AppShell title="Contact Requests">
        <section className="card">
          <div className="card-body" style={{ display: "grid", gap: 12 }}>
            <div>
              <div className="title">Contact Requests</div>
              <div className="subtitle">
                Send a message to request contact or respond to incoming requests.
              </div>
            </div>

            {banner ? (
              <div className="card" role="status" aria-live="polite">
                <div className="card-body">{banner}</div>
              </div>
            ) : null}

            <div className="card">
              <div className="card-body" style={{ display: "grid", gap: 10 }}>
                <div className="title">New request</div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const toResidentId = String(fd.get("toResidentId") || "").trim();
                    const message = String(fd.get("message") || "").trim();
                    if (!toResidentId || !message) {
                      setBanner("Please fill out resident id and message.");
                      return;
                    }
                    createMutation.mutate({ toResidentId, message });
                    e.currentTarget.reset();
                  }}
                  style={{ display: "grid", gap: 10 }}
                >
                  <input
                    name="toResidentId"
                    className="input"
                    placeholder="Resident ID (from profile URL)"
                  />
                  <textarea name="message" className="textarea" placeholder="Message" />
                  <button className="btn btn-primary" type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Sending…" : "Send request"}
                  </button>
                  {createMutation.isError ? (
                    <div className="subtitle" style={{ color: "var(--danger)" }}>
                      {((createMutation.error as ApiError)?.message) || "Failed to send request."}
                    </div>
                  ) : null}
                </form>
              </div>
            </div>

            {query.isLoading ? <div className="subtitle">Loading…</div> : null}

            {query.isError ? (
              <div className="card" style={{ borderColor: "rgba(239,68,68,0.4)" }} role="alert">
                <div className="card-body" style={{ color: "var(--danger)" }}>
                  {(query.error as ApiError).message || "Failed to load requests."}
                </div>
              </div>
            ) : null}

            {query.data ? (
              <div style={{ display: "grid", gap: 12 }}>
                <div className="card">
                  <div className="card-body" style={{ display: "grid", gap: 10 }}>
                    <div className="title">Pending</div>
                    {grouped.pending.length === 0 ? (
                      <div className="subtitle">No pending requests.</div>
                    ) : (
                      grouped.pending.map((r) => (
                        <div key={r.id} className="card" style={{ borderColor: "rgba(59,130,246,0.25)" }}>
                          <div className="card-body" style={{ display: "grid", gap: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                              <div className="subtitle">
                                To resident: <span className="badge">{r.toResidentId}</span>
                              </div>
                              <span className="badge">{new Date(r.createdAt).toLocaleString()}</span>
                            </div>
                            <div style={{ whiteSpace: "pre-wrap" }}>{r.message}</div>

                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                              <button
                                className="btn btn-primary"
                                onClick={() => statusMutation.mutate({ id: r.id, status: "accepted" })}
                                disabled={statusMutation.isPending}
                              >
                                Accept
                              </button>
                              <button
                                className="btn"
                                onClick={() => statusMutation.mutate({ id: r.id, status: "declined" })}
                                disabled={statusMutation.isPending}
                              >
                                Decline
                              </button>
                            </div>

                            {statusMutation.isError ? (
                              <div className="subtitle" style={{ color: "var(--danger)" }}>
                                {((statusMutation.error as ApiError)?.message) || "Update failed."}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ display: "grid", gap: 10 }}>
                    <div className="title">History</div>
                    {grouped.other.length === 0 ? (
                      <div className="subtitle">No completed requests.</div>
                    ) : (
                      grouped.other.map((r) => (
                        <div key={r.id} className="card">
                          <div className="card-body" style={{ display: "grid", gap: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                              <div className="subtitle">
                                To resident: <span className="badge">{r.toResidentId}</span>
                              </div>
                              <span className="badge badge-muted">{r.status}</span>
                            </div>
                            <div className="subtitle">{new Date(r.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      ))
                    )}
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
