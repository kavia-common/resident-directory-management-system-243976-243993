"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    if (state.status === "authenticated") router.replace("/app");
  }, [state.status, router]);

  return (
    <main className="min-h-screen" style={{ display: "grid", placeItems: "center", padding: 18 }}>
      <section className="card" style={{ width: "min(720px, 100%)" }}>
        <div className="card-body" style={{ display: "grid", gap: 12 }}>
          <div>
            <div className="title">Resident Directory</div>
            <p className="subtitle">
              Retro-themed directory with privacy controls, announcements, and contact requests.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn btn-primary" href="/login">
              Sign in
            </Link>
            <Link className="btn" href="/about">
              Learn more
            </Link>
          </div>

          <div className="subtitle">
            Backend configured via <code>NEXT_PUBLIC_API_BASE_URL</code>.
          </div>
        </div>
      </section>
    </main>
  );
}
