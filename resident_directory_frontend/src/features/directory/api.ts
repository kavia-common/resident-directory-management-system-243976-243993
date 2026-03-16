"use client";

import { z } from "zod";
import { apiRequest } from "@/lib/api";
import { ResidentDirectoryCard, ResidentDirectoryCardSchema } from "@/lib/types";

const ResidentListSchema = z.array(ResidentDirectoryCardSchema);

// PUBLIC_INTERFACE
export async function fetchDirectory({
  token,
  q,
  tag,
  building,
}: {
  token: string;
  q?: string;
  tag?: string;
  building?: string;
}): Promise<ResidentDirectoryCard[]> {
  /** Fetch resident directory with optional search/filter. */
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (tag) params.set("tag", tag);
  if (building) params.set("building", building);

  return apiRequest({
    path: `/residents/directory${params.size ? `?${params.toString()}` : ""}`,
    method: "GET",
    token,
    schema: ResidentListSchema,
  });
}
