"use client";

import { z } from "zod";
import { apiRequest } from "@/lib/api";
import { Announcement, AnnouncementSchema } from "@/lib/types";

export const AuditLogSchema = z.object({
  id: z.string(),
  actor_user_id: z.string().optional().nullable(),
  action: z.string(),
  entity_type: z.string().optional().nullable(),
  entity_id: z.string().optional().nullable(),
  success: z.boolean(),
  details: z.record(z.any()).default({}),
  created_at: z.string().optional(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

const AuditListSchema = z.array(AuditLogSchema);

// PUBLIC_INTERFACE
export async function adminBootstrapAdmin({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ ok: boolean; user_id: string }> {
  /** One-time helper to create/update an admin account (no auth). */
  // Backend expects query params (simple function params).
  const params = new URLSearchParams({ email, password });
  return apiRequest({
    path: `/admin/bootstrap-admin?${params.toString()}`,
    method: "POST",
  });
}

// PUBLIC_INTERFACE
export async function adminImportResidents({
  token,
  residents,
}: {
  token: string;
  residents: Array<{
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    display_name?: string | null;
    unit?: string | null;
    building?: string | null;
    phone?: string | null;
    bio?: string | null;
    tags?: string[];
  }>;
}) {
  /** Admin: import residents in bulk. */
  return apiRequest({
    path: "/admin/import",
    method: "POST",
    token,
    body: { residents },
  });
}

// PUBLIC_INTERFACE
export async function adminExportResidents({
  token,
  format,
}: {
  token: string;
  format: "csv" | "json";
}) {
  /** Admin: export residents (csv streams; json returns object). */
  return apiRequest({
    path: "/admin/export",
    method: "POST",
    token,
    body: { format },
  });
}

// PUBLIC_INTERFACE
export async function adminGetAuditLogs({ token }: { token: string }): Promise<AuditLog[]> {
  /** Admin: list recent audit logs. */
  return apiRequest({ path: "/admin/audit-logs", method: "GET", token, schema: AuditListSchema });
}

// PUBLIC_INTERFACE
export async function adminListAnnouncements({ token }: { token: string }): Promise<Announcement[]> {
  /** Admin: list announcements (admin can include unpublished via query). */
  return apiRequest({
    path: "/announcements?include_unpublished=true",
    method: "GET",
    token,
    schema: z.array(AnnouncementSchema),
  });
}

// PUBLIC_INTERFACE
export async function adminCreateAnnouncement({
  token,
  body,
}: {
  token: string;
  body: { title: string; body: string; is_published?: boolean };
}): Promise<Announcement> {
  /** Admin: create announcement. */
  return apiRequest({
    path: "/announcements",
    method: "POST",
    token,
    body,
    schema: AnnouncementSchema,
  });
}

// PUBLIC_INTERFACE
export async function adminDeleteAnnouncement({ token, id }: { token: string; id: string }) {
  /** Admin: delete announcement. */
  return apiRequest<{ ok: true }>({ path: `/announcements/${id}`, method: "DELETE", token });
}
