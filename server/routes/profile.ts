import { Request, Response } from "express";
import { getSupabase } from "../supabase";

// GET /api/profile/:userId
export async function handleGetProfile(req: Request, res: Response) {
  const { userId } = req.params;
  const { data, error } = await getSupabase()
    .from("users")
    .select("id, full_name, email, username, created_at")
    .eq("id", userId)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// PATCH /api/profile/:userId
export async function handleUpdateProfile(req: Request, res: Response) {
  const { userId } = req.params;
  const { full_name, username } = req.body as {
    full_name?: string;
    username?: string;
  };

  const updates: Record<string, string> = {};
  if (full_name !== undefined) updates.full_name = full_name.trim();
  if (username !== undefined) updates.username = username.trim();

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No fields to update." });
  }

  const { data, error } = await getSupabase()
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("id, full_name, email, username")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}
