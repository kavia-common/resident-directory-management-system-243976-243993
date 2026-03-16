"use client";

import React, { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMyProfile, updateMyProfile } from "@/features/residents/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import type { ResidentProfile } from "@/lib/types";

export default function MyProfilePage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [banner, setBanner] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["me-profile"],
    queryFn: () => fetchMyProfile({ token: token! }),
    enabled: Boolean(token),
  });

  const mutation = useMutation({
    mutationFn: (body: Partial<ResidentProfile>) => updateMyProfile({ token: token!, body }),
    onSuccess: async () => {
      setBanner("Saved!");
      await qc.invalidateQueries({ queryKey: ["me-profile"] });
      setTimeout(() => setBanner(null), 2000);
    },
  });

  useEffect(() => {
    if (mutation.isError) {
      setBanner((mutation.error as ApiError).message || "Failed to save.");
    }
  }, [mutation.isError, mutation.error]);

  return (
    <RequireAuth>
      <AppShell title="My Profile">
        <section className="card">
          <div className="card-body" style={{ display: "grid", gap: 12 }}>
            <div>
              <div className="title">Profile & Privacy</div>
              <div className="subtitle">Control what other residents can see.</div>
            </div>

            {banner ? (
              <div className="card" role="status" aria-live="polite">
                <div className="card-body">{banner}</div>
              </div>
            ) : null}

            {query.isLoading ? <div className="subtitle">Loading…</div> : null}

            {query.isError ? (
              <div className="card" style={{ borderColor: "rgba(239,68,68,0.4)" }} role="alert">
                <div className="card-body" style={{ color: "var(--danger)" }}>
                  {(query.error as ApiError).message || "Failed to load profile."}
                </div>
              </div>
            ) : null}

            {query.data ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  mutation.mutate({
                    displayName: String(fd.get("displayName") || ""),
                    unit: String(fd.get("unit") || ""),
                    email: String(fd.get("email") || ""),
                    phone: String(fd.get("phone") || ""),
                    bio: String(fd.get("bio") || ""),
                    visibility: String(fd.get("visibility") || "residents_only") as ResidentProfile["visibility"],
                  });
                }}
                style={{ display: "grid", gap: 10 }}
              >
                <div style={{ display: "grid", gap: 6 }}>
                  <label className="subtitle" htmlFor="displayName">
                    Display name
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    className="input"
                    defaultValue={query.data.displayName}
                    required
                  />
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label className="subtitle" htmlFor="unit">
                    Unit
                  </label>
                  <input id="unit" name="unit" className="input" defaultValue={query.data.unit || ""} />
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label className="subtitle" htmlFor="email">
                    Contact email
                  </label>
                  <input id="email" name="email" className="input" defaultValue={query.data.email || ""} />
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label className="subtitle" htmlFor="phone">
                    Phone
                  </label>
                  <input id="phone" name="phone" className="input" defaultValue={query.data.phone || ""} />
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label className="subtitle" htmlFor="visibility">
                    Profile visibility
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    className="select"
                    defaultValue={query.data.visibility}
                  >
                    <option value="public">Public</option>
                    <option value="residents_only">Residents only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label className="subtitle" htmlFor="bio">
                    Bio
                  </label>
                  <textarea id="bio" name="bio" className="textarea" defaultValue={query.data.bio || ""} />
                </div>

                <button className="btn btn-primary" type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving…" : "Save changes"}
                </button>
              </form>
            ) : null}
          </div>
        </section>
      </AppShell>
    </RequireAuth>
  );
}
