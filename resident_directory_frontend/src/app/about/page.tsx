import React from "react";

export default function AboutPage() {
  return (
    <main className="main" style={{ maxWidth: 900, margin: "0 auto" }}>
      <section className="card">
        <div className="card-body" style={{ display: "grid", gap: 10 }}>
          <div className="title">About</div>
          <p className="subtitle">
            This app provides a resident directory with privacy controls, announcements, and
            contact requests. Admins can manage residents and announcements.
          </p>
          <p className="subtitle">
            If backend endpoints differ from the expected paths (e.g. <code>/auth/login</code>),
            update <code>src/contexts/AuthContext.tsx</code> and <code>src/features/*/api.ts</code>.
          </p>
        </div>
      </section>
    </main>
  );
}
