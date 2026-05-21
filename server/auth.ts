import { NextFunction, Request, Response } from "express";
import { getSupabase } from "./supabase";

export interface AuthedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role: string;
    emailVerified: boolean;
  };
}

function bearerToken(req: Request) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : null;
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: "Authentication required." });

  const { data, error } = await getSupabase().auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid or expired session." });
  }

  const { data: profile, error: profileError } = await getSupabase()
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }

  req.user = {
    id: data.user.id,
    email: data.user.email,
    role: profile?.role ?? data.user.user_metadata?.role ?? "customer",
    emailVerified: Boolean(data.user.email_confirmed_at),
  };

  next();
}

export function requireVerifiedEmail(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user?.emailVerified) {
    return res.status(403).json({ error: "Email verification required." });
  }
  next();
}

export function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

export function requireSelfOrAdmin(paramName = "userId") {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const requestedUserId = req.params[paramName];
    if (req.user?.role === "admin" || req.user?.id === requestedUserId) {
      return next();
    }

    return res.status(403).json({ error: "Account access denied." });
  };
}
