// shared.tsx — types, helpers, and shared UI used across user pages

import { JSX } from "react";
import UserTopbar from "../../components/UserTopbar";
import { useCurrentUser } from "../../hooks/use-current-user";

// ── Order type ────────────────────────────────────────────────
export interface Order {
  id: string;
  reference_no: string;
  service_type: string;
  service_name: string;
  delivery_type: string;
  status: string;
  payment_status: string | null;
  amount: number | null;
  weight: number | null;
  created_at: string;
}

// ── Formatters ────────────────────────────────────────────────
export function formatOrderLabel(order: Order): string {
  return `Laundry: ${order.service_type} / ${order.delivery_type ?? "Pickup"}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(email?: string | null): string {
  if (!email) return "?";
  return email.slice(0, 2).toUpperCase();
}

// ── Shared SVG icons ──────────────────────────────────────────
export const WasherIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect
      x="4"
      y="4"
      width="32"
      height="32"
      rx="6"
      stroke="#1a3a6b"
      strokeWidth="2"
    />
    <circle cx="20" cy="22" r="8" stroke="#1a3a6b" strokeWidth="2" />
    <circle cx="20" cy="22" r="3.5" stroke="#1a3a6b" strokeWidth="1.5" />
    <circle cx="11" cy="11" r="1.8" fill="#1a3a6b" />
    <circle cx="16" cy="11" r="1.8" fill="#1a3a6b" />
  </svg>
);

export const TshirtIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path
      d="M14 8 L8 14 L12 16 L12 32 L28 32 L28 16 L32 14 L26 8 C25 10 21 12 20 12 C19 12 15 10 14 8Z"
      stroke="#1a3a6b"
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// ── TopbarUser — reads real user from Supabase session ────────
export function TopbarUser() {
  const user = useCurrentUser();
  return (
    <UserTopbar
      name={user?.user_metadata?.full_name ?? "User"}
      email={user?.email ?? ""}
    />
  );
}
