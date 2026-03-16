"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Bell, Contact, LayoutDashboard, LogOut, User, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function NavItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={clsx("btn", "justify-start w-full", active && "btn-primary")}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

// PUBLIC_INTERFACE
export function AppShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  /** Main authenticated layout shell with nav and user actions. */
  const { user, role, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="card">
          <div className="card-body" style={{ display: "grid", gap: 10 }}>
            <div>
              <div className="title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="badge">Retro</span>
                <span>{process.env.NEXT_PUBLIC_APP_NAME || "Resident Directory"}</span>
              </div>
              <div className="subtitle">Signed in as {user?.displayName}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="badge badge-muted">{role}</span>
                <span className="badge badge-success">Online</span>
              </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <NavItem href="/app" label="Home" icon={<LayoutDashboard size={18} />} />
              <NavItem href="/app/directory" label="Directory" icon={<Users size={18} />} />
              <NavItem href="/app/announcements" label="Announcements" icon={<Bell size={18} />} />
              <NavItem href="/app/requests" label="Contact Requests" icon={<Contact size={18} />} />
              <NavItem href="/app/me" label="My Profile" icon={<User size={18} />} />
              {role === "admin" ? (
                <NavItem href="/app/admin" label="Admin" icon={<LayoutDashboard size={18} />} />
              ) : null}
            </div>

            <button className="btn btn-danger" onClick={logout}>
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div>
        <div className="topbar">
          <div>
            <div className="title">{title || "Dashboard"}</div>
            <div className="subtitle">
              Tip: use <span className="kbd">Ctrl</span> + <span className="kbd">K</span> to jump
              (coming soon)
            </div>
          </div>
        </div>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
