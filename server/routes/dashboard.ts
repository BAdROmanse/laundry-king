import { Request, Response } from "express";
import { getSupabase } from "../supabase";

export async function handleDashboard(_req: Request, res: Response) {
  const { data: orders, error } = await getSupabase()
    .from("orders")
    .select("*, users(full_name, username)")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const total    = orders.length;
  const rushed   = orders.filter((o: any) => o.is_rushed).length;
  const delivery = orders.filter((o: any) => o.delivery_mode === "Delivery").length;

  res.json({ totalOrders: total, rushOrders: rushed, forDelivery: delivery, orders });
}
