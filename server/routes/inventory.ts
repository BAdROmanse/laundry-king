import { Request, Response } from "express";
import { getSupabase } from "../supabase";


export async function handleGetInventory(req: Request, res: Response) {
  const { search } = req.query;
  let query = getSupabase().from("inventory").select("*").order("name");
  if (search) query = query.ilike("name", `%${search}%`);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function handleAddInventory(req: Request, res: Response) {
  const { data, error } = await getSupabase()
    .from("inventory").insert([req.body]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}

export async function handleUpdateInventory(req: Request, res: Response) {
  const { id } = req.params;
  const { data, error } = await getSupabase()
    .from("inventory").update(req.body).eq("id", id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function handleDeleteInventory(req: Request, res: Response) {
  const { id } = req.params;
  const { error } = await getSupabase().from("inventory").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
}