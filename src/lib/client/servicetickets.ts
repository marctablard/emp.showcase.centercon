'use client';

import type {
  CreateServiceTicketInput,
  ServiceTicket,
  ServiceTicketType,
} from '@/platform/services/model/serviceticket';

const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data?.error || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

/**
 * Fetch the current customer's service tickets.
 */
export async function fetchServiceTickets(locale?: string): Promise<ServiceTicket[]> {
  const query = locale ? `?locale=${encodeURIComponent(locale)}` : '';
  const response = await fetch(`/api/servicetickets${query}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const data = (await response.json()) as ServiceTicket[];
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch the available request types (ticket structures).
 */
export async function fetchServiceTicketTypes(locale?: string): Promise<ServiceTicketType[]> {
  const query = locale ? `?locale=${encodeURIComponent(locale)}` : '';
  const response = await fetch(`/api/servicetickets/types${query}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const data = (await response.json()) as ServiceTicketType[];
  return Array.isArray(data) ? data : [];
}

/**
 * Create a new service ticket.
 */
export async function createServiceTicket(input: CreateServiceTicketInput, locale?: string): Promise<{ id: string }> {
  const response = await fetch('/api/servicetickets', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ ...input, locale }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

/**
 * Append a customer reply to a ticket conversation.
 */
export async function replyToServiceTicket(ticketId: string, message: string): Promise<void> {
  const response = await fetch(`/api/servicetickets/${encodeURIComponent(ticketId)}/messages`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

/**
 * Reopen a terminal ticket.
 */
export async function reopenServiceTicket(ticketId: string): Promise<void> {
  const response = await fetch(`/api/servicetickets/${encodeURIComponent(ticketId)}/reopen`, {
    method: 'POST',
    headers: JSON_HEADERS,
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

/**
 * Submit satisfaction feedback for a ticket.
 */
export async function submitServiceTicketFeedback(ticketId: string, score: number, comment?: string): Promise<void> {
  const response = await fetch(`/api/servicetickets/${encodeURIComponent(ticketId)}/feedback`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ score, comment }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}
