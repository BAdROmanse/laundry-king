export type PaymentMethod = "GCash" | "Cash on Delivery";
export type PaymentStatus = "Paid" | "Unpaid";

export const PAYMENT_METHODS: PaymentMethod[] = ["GCash", "Cash on Delivery"];
export const PAYMENT_STATUSES: PaymentStatus[] = ["Paid", "Unpaid"];

export function normalizePaymentMethod(
  method: string | null | undefined,
): PaymentMethod | "" {
  if (method === "Online Payment" || method === "GCash") return "GCash";
  if (
    method === "Cash on pick up/delivery" ||
    method === "Cash on Delivery"
  ) {
    return "Cash on Delivery";
  }
  return "";
}

export function normalizePaymentStatus(
  status: string | null | undefined,
): PaymentStatus {
  return status === "Paid" ? "Paid" : "Unpaid";
}
