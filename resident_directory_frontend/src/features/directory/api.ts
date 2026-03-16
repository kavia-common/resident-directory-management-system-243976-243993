"use client";

import { z } from "zod";
import { apiRequest } from "@/lib/api";
import { ResidentProfile, ResidentProfileSchema } from "@/lib/types";

const ResidentListSchema = z.array(ResidentProfileSchema);

// PUBLIC_INTERFACE
export async function fetchDirectory({
  token,
  q,
  visibility,
}: {
  token: string;
  q?: string;
  visibility?: "public" | "residents_only" | "private";
}): Promise<ResidentProfile[]> {
  /** Fetch resident directory with optional search/filter. */
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (visibility) params.set("visibility", visibility);

  // Expected: GET /residents?...
  return apiRequest({
    path: `/residents${params.size ? `?${params.toString()}` : ""}`,
    method: "GET",
    token,
    schema: ResidentListSchema,
  });
}
