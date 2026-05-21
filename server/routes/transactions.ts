import { Request, Response } from "express";
import { getSupabase } from "../supabase";

export async function handleGetTransactions(req: Request, res: Response) {
  const { date, from, to, delivery } = req.query;
  let query = getSupabase()
    .from("orders")
    .select("*, users(full_name, username)")
    .order("created_at", { ascending: false });

  if (delivery === "delivered") {
    query = query.eq("status", "Delivered");
  } else if (delivery === "not-delivered") {
    query = query.neq("status", "Delivered");
  } else if (!from && !to) {
    query = query.eq("status", "Completed");
  }

  if (date) {
    const start = new Date(date as string);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date as string);
    end.setHours(23, 59, 59, 999);
    query = query.gte("created_at", start.toISOString()).lte("created_at", end.toISOString());
  }
  if (from) query = query.gte("created_at", from as string);
  if (to) query = query.lte("created_at", to as string);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function handleGetTransactionById(req: Request, res: Response) {
  const { id } = req.params;
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*, users(full_name, username)")
    .eq("id", id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function handleUpdateTransactionOrder(req: Request, res: Response) {
  const { id } = req.params;
  const { payment_method, payment_status, status } = req.body as {
    payment_method?: string | null;
    payment_status?: string;
    status?: string;
  };

  const updates: Record<string, string | null> = {};
  if (payment_method !== undefined) updates.payment_method = payment_method;
  if (payment_status !== undefined) updates.payment_status = payment_status;
  if (status !== undefined) updates.status = status;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No fields to update." });
  }

  const { data, error } = await getSupabase()
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select("*, users(full_name, username)")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}
