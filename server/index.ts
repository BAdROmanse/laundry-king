import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  requireAdmin,
  requireAuth,
  requireSelfOrAdmin,
  requireVerifiedEmail,
} from "./auth";

// ── Route handlers ──────────────────────────────────────────
import { handleDemo } from "./routes/demo";
import { handleDashboard } from "./routes/dashboard";
import {
  handleGetInventory,
  handleAddInventory,
  handleUpdateInventory,
  handleDeleteInventory,
} from "./routes/inventory";
import {
  handleGetLaundryStatus,
  handleUpdateOrderStatus,
} from "./routes/laundryStatus";
import {
  handleGetTransactions,
  handleGetTransactionById,
  handleUpdateTransactionOrder,
} from "./routes/transactions";
import {
  handleGetExpenses,
  handleSyncInventoryExpense,
} from "./routes/expenses";
import {
  handleGetActiveOrders,
  handleGetOrderHistory,
  handleGetOrderStatus,
  handleCreateOrder,
} from "./routes/orders";
import { handleGetProfile, handleUpdateProfile } from "./routes/profile";

export function createServer() {
  const app = express();

  // ── Middleware ─────────────────────────────────────────────
  const configuredOrigins = (
    process.env.CORS_ORIGINS ||
    process.env.PUBLIC_SITE_URL ||
    "http://laundrykingWDF.com"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV !== "production") {
    configuredOrigins.push("http://localhost:8080", "http://localhost:5173");
  }

  const allowedOrigins = new Set(configuredOrigins);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        return callback(new Error("Origin is not allowed by CORS."));
      },
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Health check ───────────────────────────────────────────
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // ── Admin: Dashboard ───────────────────────────────────────
  app.get("/api/dashboard", requireAuth, requireVerifiedEmail, requireAdmin, handleDashboard);

  // ── Admin: Inventory ───────────────────────────────────────
  app.get("/api/inventory", requireAuth, requireVerifiedEmail, requireAdmin, handleGetInventory);
  app.post("/api/inventory", requireAuth, requireVerifiedEmail, requireAdmin, handleAddInventory);
  app.put("/api/inventory/:id", requireAuth, requireVerifiedEmail, requireAdmin, handleUpdateInventory);
  app.delete("/api/inventory/:id", requireAuth, requireVerifiedEmail, requireAdmin, handleDeleteInventory);

  // ── Admin: Laundry Status ──────────────────────────────────
  app.get("/api/laundry-status", requireAuth, requireVerifiedEmail, requireAdmin, handleGetLaundryStatus);
  app.put("/api/laundry-status/:id", requireAuth, requireVerifiedEmail, requireAdmin, handleUpdateOrderStatus);

  // ── Admin: Transactions ────────────────────────────────────
  app.get("/api/transactions", requireAuth, requireVerifiedEmail, requireAdmin, handleGetTransactions);
  app.get("/api/transactions/:id", requireAuth, requireVerifiedEmail, requireAdmin, handleGetTransactionById);
  app.patch("/api/transactions/:id", requireAuth, requireVerifiedEmail, requireAdmin, handleUpdateTransactionOrder);

  // Admin: Expenses. Uses service role because browser-side inserts can be
  // blocked by RLS and the current Supabase schema may not expose expenses.
  app.get("/api/expenses", requireAuth, requireVerifiedEmail, requireAdmin, handleGetExpenses);
  app.post("/api/expenses/inventory-sync", requireAuth, requireVerifiedEmail, requireAdmin, handleSyncInventoryExpense);

  // ── User: Orders ───────────────────────────────────────────
  app.get("/api/orders/active/:userId", requireAuth, requireVerifiedEmail, requireSelfOrAdmin(), handleGetActiveOrders);
  app.get("/api/orders/history/:userId", requireAuth, requireVerifiedEmail, requireSelfOrAdmin(), handleGetOrderHistory);
  app.get("/api/orders/:orderId/status", requireAuth, requireVerifiedEmail, handleGetOrderStatus);
  app.post("/api/orders", requireAuth, requireVerifiedEmail, handleCreateOrder);

  // ── User: Profile ──────────────────────────────────────────
  app.get("/api/profile/:userId", requireAuth, requireVerifiedEmail, requireSelfOrAdmin(), handleGetProfile);
  app.patch("/api/profile/:userId", requireAuth, requireVerifiedEmail, requireSelfOrAdmin(), handleUpdateProfile);

  return app;
}
