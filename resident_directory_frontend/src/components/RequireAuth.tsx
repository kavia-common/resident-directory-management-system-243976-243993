"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

// PUBLIC_INTERFACE
export function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Role[];
}) {
  /** Client-side guard for authenticated/role-based routes. Redirects to /login when not allowed. */
  const router = useRouter();
  const { state, role } = useAuth();

  useEffect(() => {
    if (state.status === "anonymous") {
      router.replace("/login");
      return;
    }
    if (state.status === "authenticated" && roles && role && !roles.includes(role)) {
      router.replace("/app");
      return;
    }
  }, [state.status, role, roles, router]);

  if (state.status === "loading") {
    return (
      <div className="main">
        <div className="card">
          <div className="card-body">Loading…</div>
        </div>
      </div>
    );
  }

  if (state.status === "anonymous") return null;

  if (roles && role && !roles.includes(role)) return null;

  return <>{children}</>;
}
