import { Request, Response } from "express";
import { getSupabase } from "../supabase";
import type { AuthedRequest } from "../auth";

function normalizePaymentMethod(method: string | undefined) {
  if (method === "Online Payment" || method === "GCash") return "GCash";
  if (
    method === "Cash on pick up/delivery" ||
    method === "Cash on Delivery"
  ) {
    return "Cash on Delivery";
  }
  return method ?? null;
}

export async function handleGetActiveOrders(req: Request, res: Response) {
  const { userId } = req.params;
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*, users(full_name, username)")
    .eq("user_id", userId)
    .in("status", ["Washing", "Drying", "Folding", "For Delivery"]);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function handleGetOrderHistory(req: Request, res: Response) {
  const { userId } = req.params;
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*, users(full_name, username)")
    .eq("user_id", userId)
    .eq("status", "Completed")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function handleGetOrderStatus(req: AuthedRequest, res: Response) {
  const { orderId } = req.params;
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*, users(full_name, username)")
    .eq("id", orderId)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  if (req.user?.role !== "admin" && data?.user_id !== req.user?.id) {
    return res.status(403).json({ error: "Order access denied." });
  }
  res.json(data);
}

export async function handleCreateOrder(req: AuthedRequest, res: Response) {
  const body = req.body;
  const { data, error } = await getSupabase()
    .from("orders")
    .insert([{
      user_id:        req.user?.id,
      service_type:   body.serviceType,
      pack:           body.pack,
      addons:         body.addons,
      delivery_mode:  body.deliveryMode,
      payment_method: normalizePaymentMethod(body.paymentMethod),
      is_rushed:      body.isRushed ?? false,
      status:         "Washing",
      payment_status: "Unpaid",
    }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}
