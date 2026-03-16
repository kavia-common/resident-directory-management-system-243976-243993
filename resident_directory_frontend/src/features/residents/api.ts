"use client";

import { apiRequest } from "@/lib/api";
import {
  ResidentMyProfile,
  ResidentMyProfileSchema,
  PrivacySettings,
  PrivacySettingsSchema,
} from "@/lib/types";

// PUBLIC_INTERFACE
export async function updateMyProfile({
  token,
  body,
}: {
  token: string;
  body: Partial<ResidentMyProfile>;
}): Promise<ResidentMyProfile> {
  /** Update current user's profile (non-privacy fields). */
  return apiRequest({
    path: `/residents/me/profile`,
    method: "PATCH",
    token,
    body,
    schema: ResidentMyProfileSchema,
  });
}

// PUBLIC_INTERFACE
export async function fetchMyProfile({ token }: { token: string }): Promise<ResidentMyProfile> {
  /** Fetch current user's full profile (including privacy). */
  return apiRequest({
    path: `/residents/me/profile`,
    method: "GET",
    token,
    schema: ResidentMyProfileSchema,
  });
}

// PUBLIC_INTERFACE
export async function updateMyPrivacy({
  token,
  body,
}: {
  token: string;
  body: PrivacySettings;
}): Promise<{ ok: boolean; privacy: PrivacySettings }> {
  /** Update current user's privacy settings. */
  return apiRequest({
    path: `/residents/me/privacy`,
    method: "PATCH",
    token,
    body,
    schema: zPrivacyResponseSchema,
  });
}

const zPrivacyResponseSchema = (() => {
  // local schema to avoid exporting a one-off type
  const z = require("zod") as typeof import("zod");
  return z.object({
    ok: z.boolean(),
    privacy: PrivacySettingsSchema,
  });
})();
