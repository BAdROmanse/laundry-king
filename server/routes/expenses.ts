import { Request, Response } from "express";
import { getSupabase } from "../supabase";

function isMissingExpensesTable(error: any) {
  return (
    error?.code === "PGRST205" ||
    String(error?.message ?? "").includes("public.expenses")
  );
}

function toFallbackExpense(row: any) {
  return {
    id: row.id,
    inventory_id: null,
    type: "Inventory",
    detail: "Inventory adjustment",
    quantity: 1,
    unit: null,
    action: null,
    remark: "Synced through transactions fallback",
    total_amount: Math.abs(Number(row.amount) || 0),
    created_at: row.created_at,
  };
}

export async function handleGetExpenses(req: Request, res: Response) {
  const { from, to } = req.query;
  let query = getSupabase()
    .from("expenses")
    .select("id, inventory_id, type, detail, quantity, unit, action, remark, total_amount, created_at")
    .order("created_at", { ascending: false });

  if (from) query = query.gte("created_at", from as string);
  if (to) query = query.lte("created_at", to as string);

  const { data, error } = await query;
  if (!error) return res.json(data ?? []);
  if (!isMissingExpensesTable(error)) {
    return res.status(500).json({ error: error.message });
  }

  // Supabase-side requirement: create/expose public.expenses for full typed
  // expense history. Until then, inventory expense totals are persisted as
  // negative transaction rows through the service-role server client so browser
  // RLS policies on transactions are not bypassed or weakened.
  let fallback = getSupabase()
    .from("transactions")
    .select("id, amount, created_at")
    .lt("amount", 0)
    .order("created_at", { ascending: false });

  if (from) fallback = fallback.gte("created_at", from as string);
  if (to) fallback = fallback.lte("created_at", to as string);

  const fallbackResult = await fallback;
  if (fallbackResult.error) {
    return res.status(500).json({ error: fallbackResult.error.message });
  }

  res.json((fallbackResult.data ?? []).map(toFallbackExpense));
}

export async function handleSyncInventoryExpense(req: Request, res: Response) {
  const { inventory_id, type, detail, quantity, unit, total_amount, action } =
    req.body as {
    inventory_id?: string;
    type?: string;
    detail?: string;
    quantity?: number;
    unit?: string;
    total_amount?: number;
    action?: "purchase" | "usage";
  };

  const qty = Number(quantity) || 0;
  const amount = Number(total_amount) || 0;
  if (!detail || qty <= 0 || amount <= 0) {
    return res.status(400).json({ error: "Invalid expense payload." });
  }

  const remark =
    action === "usage"
      ? `Inventory usage (${unit || "pcs"})`
      : `Inventory purchase (${unit || "pcs"})`;

  const insert = await getSupabase().from("expenses").insert({
    inventory_id: inventory_id || null,
    type: type || "Other Supplies",
    detail,
    quantity: qty,
    unit: unit || null,
    action: action || "adjustment",
    remark,
    total_amount: amount,
  });

  if (!insert.error) return res.status(201).json({ ok: true });
  if (!isMissingExpensesTable(insert.error)) {
    return res.status(500).json({ error: insert.error.message });
  }

  const fallback = await getSupabase().from("transactions").insert({
    amount: -Math.abs(amount),
  });

  if (fallback.error) {
    return res.status(500).json({ error: fallback.error.message });
  }

  res.status(201).json({
    ok: true,
    fallback: "transactions",
    note: "Create public.expenses for typed expense history.",
  });
}
