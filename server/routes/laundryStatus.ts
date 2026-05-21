import { Request, Response } from "express";
import { getSupabase } from "../supabase";


const STATUSES = [
  "Washing",
  "Drying",
  "Folding",
  "For Delivery",
  "Completed",
  "Delivered",
];

export async function handleGetLaundryStatus(_req: Request, res: Response) {
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*, users(full_name, username)")
    .in("status", ["Washing", "Drying", "Folding", "For Delivery"])
    .order("created_at", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function handleUpdateOrderStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const { data, error } = await getSupabase()
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}
