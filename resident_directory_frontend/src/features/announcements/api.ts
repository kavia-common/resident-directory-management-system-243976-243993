"use client";

import { z } from "zod";
import { apiRequest } from "@/lib/api";
import { AnnouncementSchema, Announcement } from "@/lib/types";

const AnnouncementListSchema = z.array(AnnouncementSchema);

// PUBLIC_INTERFACE
export async function fetchAnnouncements({ token }: { token: string }): Promise<Announcement[]> {
  /** Fetch announcements. */
  return apiRequest({
    path: "/announcements",
    method: "GET",
    token,
    schema: AnnouncementListSchema,
  });
}
