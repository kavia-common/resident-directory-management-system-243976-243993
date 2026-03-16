"use client";

import { z } from "zod";
import { apiRequest } from "@/lib/api";
import { ContactRequest, ContactRequestSchema } from "@/lib/types";

const ContactRequestListSchema = z.array(ContactRequestSchema);

// PUBLIC_INTERFACE
export async function fetchMyRequests({ token }: { token: string }): Promise<ContactRequest[]> {
  /** Fetch current user's contact requests (inbound/outbound, backend-defined). */
  return apiRequest({
    path: "/contact-requests",
    method: "GET",
    token,
    schema: ContactRequestListSchema,
  });
}

// PUBLIC_INTERFACE
export async function createRequest({
  token,
  toResidentId,
  message,
}: {
  token: string;
  toResidentId: string;
  message: string;
}): Promise<ContactRequest> {
  /** Create a new contact request to a resident. */
  return apiRequest({
    path: "/contact-requests",
    method: "POST",
    token,
    body: { toResidentId, message },
    schema: ContactRequestSchema,
  });
}

// PUBLIC_INTERFACE
export async function updateRequestStatus({
  token,
  id,
  status,
}: {
  token: string;
  id: string;
  status: "accepted" | "declined";
}): Promise<ContactRequest> {
  /** Update status of a contact request (accept/decline). */
  return apiRequest({
    path: `/contact-requests/${id}`,
    method: "PATCH",
    token,
    body: { status },
    schema: ContactRequestSchema,
  });
}
