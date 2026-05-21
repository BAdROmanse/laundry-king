import { apiFetch } from "@/lib/api";

export interface ExpenseRow {
  id: string;
  inventory_id: string | null;
  type: string;
  detail: string;
  quantity: number;
  unit: string | null;
  action: "purchase" | "usage" | "adjustment" | null;
  remark: string | null;
  total_amount: number;
  created_at: string;
}

type InventoryExpenseInput = {
  inventory_id?: string;
  type: string;
  detail: string;
  quantity: number;
  unit: string;
  total_amount: number;
  action: "purchase" | "usage";
};

export async function fetchExpenses(fromIso: string, toIso?: string) {
  const params = new URLSearchParams({ from: fromIso });
  if (toIso) params.set("to", toIso);

  const response = await apiFetch(`/api/expenses?${params.toString()}`);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      data: [],
      error: new Error(body?.error ?? "Failed to load expenses."),
    };
  }

  return { data: (body ?? []) as ExpenseRow[], error: null };
}

export async function syncInventoryExpense(params: InventoryExpenseInput) {
  if (params.quantity <= 0 || params.total_amount <= 0) return { error: null };

  const response = await apiFetch("/api/expenses/inventory-sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const body = await response.json().catch(() => null);
  return {
    error: response.ok
      ? null
      : new Error(body?.error ?? "Failed to sync inventory expense."),
  };
}
