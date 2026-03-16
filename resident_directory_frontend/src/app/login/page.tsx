"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { state, login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const defaultValues = useMemo<LoginForm>(() => ({ email: "", password: "" }), []);

  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues,
  });

  async function onSubmit(values: LoginForm) {
    setError(null);
    try {
      await login(values.email, values.password);
      router.replace("/app");
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("Login failed. Please try again.");
    }
  }

  const isBusy = state.status === "loading" || form.formState.isSubmitting;

  return (
    <main className="min-h-screen" style={{ display: "grid", placeItems: "center", padding: 18 }}>
      <section className="card" style={{ width: "min(520px, 100%)" }}>
        <div className="card-body" style={{ display: "grid", gap: 12 }}>
          <div>
            <div className="title">Sign in</div>
            <p className="subtitle">Use your building account to access the directory.</p>
          </div>

          {error ? (
            <div className="card" style={{ borderColor: "rgba(239,68,68,0.4)" }} role="alert">
              <div className="card-body" style={{ color: "var(--danger)" }}>
                {error}
              </div>
            </div>
          ) : null}

          <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label className="subtitle" htmlFor="email">
                Email
              </label>
              <input id="email" className="input" type="email" {...form.register("email")} />
              {form.formState.errors.email ? (
                <div className="subtitle" style={{ color: "var(--danger)" }}>
                  {form.formState.errors.email.message}
                </div>
              ) : null}
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label className="subtitle" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="input"
                type="password"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <div className="subtitle" style={{ color: "var(--danger)" }}>
                  {form.formState.errors.password.message}
                </div>
              ) : null}
            </div>

            <button className="btn btn-primary" type="submit" disabled={isBusy}>
              {isBusy ? "Signing in…" : "Sign in"}
            </button>

            <div className="subtitle">
              Admin and resident roles are enforced by the backend and reflected in the UI.
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
