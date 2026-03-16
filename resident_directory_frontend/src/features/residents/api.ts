"use client";

import { apiRequest } from "@/lib/api";
import { ResidentProfile, ResidentProfileSchema } from "@/lib/types";

// PUBLIC_INTERFACE
export async function fetchResident({
  token,
  id,
}: {
  token: string;
  id: string;
}): Promise<ResidentProfile> {
  /** Fetch a specific resident profile by id. */
  return apiRequest({
    path: `/residents/${id}`,
    method: "GET",
    token,
    schema: ResidentProfileSchema,
  });
}

// PUBLIC_INTERFACE
export async function updateMyProfile({
  token,
  body,
}: {
  token: string;
  body: Partial<ResidentProfile>;
}): Promise<ResidentProfile> {
  /** Update current user's profile (privacy, contact info). */
  return apiRequest({
    path: `/me/profile`,
    method: "PATCH",
    token,
    body,
    schema: ResidentProfileSchema,
  });
}

// PUBLIC_INTERFACE
export async function fetchMyProfile({
  token,
}: {
  token: string;
}): Promise<ResidentProfile> {
  /** Fetch current user's profile. */
  return apiRequest({
    path: `/me/profile`,
    method: "GET",
    token,
    schema: ResidentProfileSchema,
  });
}
