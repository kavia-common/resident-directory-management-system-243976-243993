"use client";

import { z } from "zod";
import { apiRequest } from "@/lib/api";
import {
  Announcement,
  AnnouncementSchema,
  ResidentProfile,
  ResidentProfileSchema,
} from "@/lib/types";

const ResidentsSchema = z.array(ResidentProfileSchema);
const AnnouncementsSchema = z.array(AnnouncementSchema);

export const AuditEventSchema = z.object({
  id: z.string(),
  action: z.string(),
  actor: z.string().optional().nullable(),
  createdAt: z.string(),
  metadata: z.unknown().optional(),
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

const AuditListSchema = z.array(AuditEventSchema);

// PUBLIC_INTERFACE
export async function adminListResidents({ token }: { token: string }): Promise<ResidentProfile[]> {
  /** Admin: list all residents (includes private fields depending on backend). */
  return apiRequest({ path: "/admin/residents", method: "GET", token, schema: ResidentsSchema });
}

// PUBLIC_INTERFACE
export async function adminCreateResident({
  token,
  body,
}: {
  token: string;
  body: Partial<ResidentProfile> & { email: string; displayName: string };
}): Promise<ResidentProfile> {
  /** Admin: create resident. */
  return apiRequest({
    path: "/admin/residents",
    method: "POST",
    token,
    body,
    schema: ResidentProfileSchema,
  });
}

// PUBLIC_INTERFACE
export async function adminDeleteResident({ token, id }: { token: string; id: string }) {
  /** Admin: delete resident. */
  return apiRequest<{ ok: true }>({ path: `/admin/residents/${id}`, method: "DELETE", token });
}

// PUBLIC_INTERFACE
export async function adminListAnnouncements({ token }: { token: string }): Promise<Announcement[]> {
  /** Admin: list announcements. */
  return apiRequest({
    path: "/admin/announcements",
    method: "GET",
    token,
    schema: AnnouncementsSchema,
  });
}

// PUBLIC_INTERFACE
export async function adminCreateAnnouncement({
  token,
  body,
}: {
  token: string;
  body: { title: string; body: string };
}): Promise<Announcement> {
  /** Admin: create announcement. */
  return apiRequest({
    path: "/admin/announcements",
    method: "POST",
    token,
    body,
    schema: AnnouncementSchema,
  });
}

// PUBLIC_INTERFACE
export async function adminDeleteAnnouncement({ token, id }: { token: string; id: string }) {
  /** Admin: delete announcement. */
  return apiRequest<{ ok: true }>({ path: `/admin/announcements/${id}`, method: "DELETE", token });
}

// PUBLIC_INTERFACE
export async function adminGetAuditLog({ token }: { token: string }): Promise<AuditEvent[]> {
  /** Admin: fetch audit log. */
  return apiRequest({ path: "/admin/audit-log", method: "GET", token, schema: AuditListSchema });
}
