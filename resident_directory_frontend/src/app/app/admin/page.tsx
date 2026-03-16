"use client";

import React, { useMemo, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import {
  adminCreateAnnouncement,
  adminCreateResident,
  adminDeleteAnnouncement,
  adminDeleteResident,
  adminGetAuditLog,
  adminListAnnouncements,
  adminListResidents,
} from "@/features/admin/api";

type Tab = "residents" | "announcements" | "audit";

export default function AdminPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("residents");
  const [banner, setBanner] = useState<string | null>(null);

  const residentsQuery = useQuery({
    queryKey: ["admin-residents"],
    queryFn: () => adminListResidents({ token: token! }),
    enabled: Boolean(token),
  });

  const announcementsQuery = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: () => adminListAnnouncements({ token: token! }),
    enabled: Boolean(token),
  });

  const auditQuery = useQuery({
    queryKey: ["admin-audit"],
    queryFn: () => adminGetAuditLog({ token: token! }),
    enabled: Boolean(token && tab === "audit"),
  });

  const createResident = useMutation({
    mutationFn: (body: { email: string; displayName: string; unit?: string }) =>
      adminCreateResident({ token: token!, body }),
    onSuccess: async () => {
      setBanner("Resident created.");
      await qc.invalidateQueries({ queryKey: ["admin-residents"] });
      setTimeout(() => setBanner(null), 2000);
    },
  });

  const deleteResident = useMutation({
    mutationFn: (id: string) => adminDeleteResident({ token: token!, id }),
    onSuccess: async () => {
      setBanner("Resident deleted.");
      await qc.invalidateQueries({ queryKey: ["admin-residents"] });
      setTimeout(() => setBanner(null), 2000);
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: (body: { title: string; body: string }) =>
      adminCreateAnnouncement({ token: token!, body }),
    onSuccess: async () => {
      setBanner("Announcement posted.");
      await qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      setTimeout(() => setBanner(null), 2000);
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: (id: string) => adminDeleteAnnouncement({ token: token!, id }),
    onSuccess: async () => {
      setBanner("Announcement removed.");
      await qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      setTimeout(() => setBanner(null), 2000);
    },
  });

  const anyError = useMemo(() => {
    const err =
      (residentsQuery.error as ApiError) ||
      (announcementsQuery.error as ApiError) ||
      (auditQuery.error as ApiError) ||
      (createResident.error as ApiError) ||
      (deleteResident.error as ApiError) ||
      (createAnnouncement.error as ApiError) ||
      (deleteAnnouncement.error as ApiError);
    return err?.message || null;
  }, [
    residentsQuery.error,
    announcementsQuery.error,
    auditQuery.error,
    createResident.error,
    deleteResident.error,
    createAnnouncement.error,
    deleteAnnouncement.error,
  ]);

  return (
    <RequireAuth roles={["admin"]}>
      <AppShell title="Admin Dashboard">
        <section className="card">
          <div className="card-body" style={{ display: "grid", gap: 12 }}>
            <div>
              <div className="title">Admin Tools</div>
              <div className="subtitle">Manage residents, announcements, and audit events.</div>
            </div>

            {banner ? (
              <div className="card" role="status" aria-live="polite">
                <div className="card-body">{banner}</div>
              </div>
            ) : null}

            {anyError ? (
              <div className="card" style={{ borderColor: "rgba(239,68,68,0.4)" }} role="alert">
                <div className="card-body" style={{ color: "var(--danger)" }}>
                  {anyError}
                </div>
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className={tab === "residents" ? "btn btn-primary" : "btn"}
                onClick={() => setTab("residents")}
              >
                Residents
              </button>
              <button
                className={tab === "announcements" ? "btn btn-primary" : "btn"}
                onClick={() => setTab("announcements")}
              >
                Announcements
              </button>
              <button
                className={tab === "audit" ? "btn btn-primary" : "btn"}
                onClick={() => setTab("audit")}
              >
                Audit Log
              </button>
            </div>

            {tab === "residents" ? (
              <div style={{ display: "grid", gap: 12 }}>
                <div className="card">
                  <div className="card-body" style={{ display: "grid", gap: 10 }}>
                    <div className="title">Create resident</div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        const email = String(fd.get("email") || "").trim();
                        const displayName = String(fd.get("displayName") || "").trim();
                        const unit = String(fd.get("unit") || "").trim();
                        if (!email || !displayName) {
                          setBanner("Email and display name are required.");
                          return;
                        }
                        createResident.mutate({ email, displayName, unit: unit || undefined });
                        e.currentTarget.reset();
                      }}
                      style={{
                        display: "grid",
                        gap: 10,
                        gridTemplateColumns: "1fr 1fr 180px",
                      }}
                    >
                      <input className="input" name="email" placeholder="Email" />
                      <input className="input" name="displayName" placeholder="Display name" />
                      <input className="input" name="unit" placeholder="Unit (optional)" />
                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={createResident.isPending}
                      >
                        {createResident.isPending ? "Creating…" : "Create"}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ display: "grid", gap: 10 }}>
                    <div className="title">Residents</div>
                    {residentsQuery.isLoading ? <div className="subtitle">Loading…</div> : null}
                    {residentsQuery.data ? (
                      <div style={{ overflowX: "auto" }}>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Unit</th>
                              <th>Visibility</th>
                              <th />
                            </tr>
                          </thead>
                          <tbody>
                            {residentsQuery.data.map((r) => (
                              <tr key={r.id}>
                                <td>{r.displayName}</td>
                                <td className="subtitle">{r.email || "—"}</td>
                                <td>{r.unit || "—"}</td>
                                <td>
                                  <span className="badge">{r.visibility}</span>
                                </td>
                                <td>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => deleteResident.mutate(r.id)}
                                    disabled={deleteResident.isPending}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "announcements" ? (
              <div style={{ display: "grid", gap: 12 }}>
                <div className="card">
                  <div className="card-body" style={{ display: "grid", gap: 10 }}>
                    <div className="title">Post announcement</div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        const title = String(fd.get("title") || "").trim();
                        const body = String(fd.get("body") || "").trim();
                        if (!title || !body) {
                          setBanner("Title and body are required.");
                          return;
                        }
                        createAnnouncement.mutate({ title, body });
                        e.currentTarget.reset();
                      }}
                      style={{ display: "grid", gap: 10 }}
                    >
                      <input className="input" name="title" placeholder="Title" />
                      <textarea className="textarea" name="body" placeholder="Message" />
                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={createAnnouncement.isPending}
                      >
                        {createAnnouncement.isPending ? "Posting…" : "Post"}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ display: "grid", gap: 10 }}>
                    <div className="title">Announcements</div>
                    {announcementsQuery.isLoading ? <div className="subtitle">Loading…</div> : null}
                    {announcementsQuery.data ? (
                      <div style={{ display: "grid", gap: 10 }}>
                        {announcementsQuery.data.map((a) => (
                          <div key={a.id} className="card">
                            <div className="card-body" style={{ display: "grid", gap: 8 }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  gap: 10,
                                }}
                              >
                                <div className="title">{a.title}</div>
                                <button
                                  className="btn btn-danger"
                                  onClick={() => deleteAnnouncement.mutate(a.id)}
                                  disabled={deleteAnnouncement.isPending}
                                >
                                  Delete
                                </button>
                              </div>
                              <div style={{ whiteSpace: "pre-wrap" }}>{a.body}</div>
                              <div className="subtitle">
                                {new Date(a.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "audit" ? (
              <div className="card">
                <div className="card-body" style={{ display: "grid", gap: 10 }}>
                  <div className="title">Audit Log</div>
                  <div className="subtitle">Tracks administrative and sensitive actions.</div>

                  {auditQuery.isLoading ? <div className="subtitle">Loading…</div> : null}

                  {auditQuery.data ? (
                    <div style={{ overflowX: "auto" }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>When</th>
                            <th>Action</th>
                            <th>Actor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditQuery.data.map((e) => (
                            <tr key={e.id}>
                              <td className="subtitle">{new Date(e.createdAt).toLocaleString()}</td>
                              <td>{e.action}</td>
                              <td className="subtitle">{e.actor || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </AppShell>
    </RequireAuth>
  );
}
