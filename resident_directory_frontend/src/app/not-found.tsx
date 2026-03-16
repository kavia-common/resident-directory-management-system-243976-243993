import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="main" style={{ maxWidth: 900, margin: "0 auto" }}>
      <section className="card" role="alert" aria-live="assertive">
        <div className="card-body" style={{ display: "grid", gap: 10 }}>
          <div className="title">404 – Page Not Found</div>
          <p className="subtitle">The page you’re looking for doesn’t exist.</p>
          <Link className="btn btn-primary" href="/">
            Go home
          </Link>
        </div>
      </section>
    </main>
  );
}
