"use client";

import { z } from "zod";
import { apiRequest } from "@/lib/api";
import { ContactRequest, ContactRequestSchema, MessageThread, MessageThreadSchema } from "@/lib/types";

const ContactRequestListSchema = z.array(ContactRequestSchema);

// PUBLIC_INTERFACE
export async function fetchInbox({ token }: { token: string }): Promise<ContactRequest[]> {
  /** Fetch contact requests received by current user. */
  return apiRequest({
    path: "/messaging/contact-requests/inbox",
    method: "GET",
    token,
    schema: ContactRequestListSchema,
  });
}

// PUBLIC_INTERFACE
export async function fetchOutbox({ token }: { token: string }): Promise<ContactRequest[]> {
  /** Fetch contact requests sent by current user. */
  return apiRequest({
    path: "/messaging/contact-requests/outbox",
    method: "GET",
    token,
    schema: ContactRequestListSchema,
  });
}

// PUBLIC_INTERFACE
export async function createRequest({
  token,
  toUserId,
  subject,
  initialMessage,
}: {
  token: string;
  toUserId: string;
  subject?: string;
  initialMessage: string;
}): Promise<ContactRequest> {
  /** Create a new contact request to another user (recipient user_id). */
  return apiRequest({
    path: "/messaging/contact-requests",
    method: "POST",
    token,
    body: { to_user_id: toUserId, subject, initial_message: initialMessage },
    schema: ContactRequestSchema,
  });
}

// PUBLIC_INTERFACE
export async function respondToRequest({
  token,
  id,
  action,
}: {
  token: string;
  id: string;
  action: "accepted" | "declined" | "closed";
}): Promise<MessageThread | ContactRequest> {
  /** Respond to a contact request. Accept returns a thread; decline/close returns updated contact request. */
  return apiRequest({
    path: `/messaging/contact-requests/${id}/respond`,
    method: "POST",
    token,
    body: { action },
    schema: z.union([MessageThreadSchema, ContactRequestSchema]),
  });
}
