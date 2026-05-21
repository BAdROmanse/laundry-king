import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { apiFetch } from "@/lib/api";
import {
  PAYMENT_STATUSES,
  normalizePaymentMethod,
  normalizePaymentStatus,
  type PaymentStatus,
} from "@/lib/payments";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";

type LaundryStatus = "Washing" | "Drying" | "Folding" | "For Delivery";

interface StatusItem {
  id: string;
  user_id: string;
  customer_name: string;
  service_type: string;
  payment_method: string;
  status: LaundryStatus;
  payment_status: PaymentStatus;
  created_at: string;
}

interface DashStats {
  activeOrders: number;
  unpaidOrders: number;
  readyOrders: number;
}

const ACTIVE_STATUSES: LaundryStatus[] = [
  "Washing",
  "Drying",
  "Folding",
  "For Delivery",
];

function formatTodayLabel() {
  return new Date().toLocaleDateString("en-PH", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Skel({ w = "100%", h = 14 }: { w?: string; h?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        background:
          "linear-gradient(90deg,#e2e8f4 25%,#f1f5f9 50%,#e2e8f4 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
      }}
    />
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashStats>({
    activeOrders: 0,
    unpaidOrders: 0,
    readyOrders: 0,
  });
  const [statusItems, setStatusItems] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const response = await apiFetch("/api/dashboard");
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to load dashboard data.");
      }

      const items: StatusItem[] = ((body?.orders as any[]) ?? [])
        .filter((o: any) => ACTIVE_STATUSES.includes(o.status))
        .map((o: any) => ({
        id: o.id,
        user_id: o.user_id ?? "-",
        customer_name: o.users?.full_name ?? o.users?.username ?? "-",
        service_type: o.service_type ?? "-",
        status: o.status as LaundryStatus,
        payment_method: normalizePaymentMethod(o.payment_method) || "-",
        payment_status: normalizePaymentStatus(o.payment_status),
        created_at: o.created_at,
      }));

      setStatusItems(items);
      setStats({
        activeOrders: items.length,
        unpaidOrders: items.filter((o) => o.payment_status === "Unpaid")
          .length,
        readyOrders: items.filter((o) => o.status === "For Delivery").length,
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updatePaymentStatus(orderId: string, status: PaymentStatus) {
    setSavingId(orderId);
    setStatusItems((prev) =>
      prev.map((item) =>
        item.id === orderId ? { ...item, payment_status: status } : item,
      ),
    );

    const response = await apiFetch(`/api/transactions/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_status: status }),
    });
    const body = await response.json().catch(() => null);

    setSavingId(null);
    if (!response.ok) {
      setError(body?.error ?? "Failed to update payment status.");
      await load();
      return;
    }

    setStats((prev) => ({
      ...prev,
      unpaidOrders: statusItems.filter((item) =>
        item.id === orderId
          ? status === "Unpaid"
          : item.payment_status === "Unpaid",
      ).length,
    }));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="lk-shell">
      <AdminSidebar />
      <main className="main">
        <AdminTopbar />

        <div className="page-header page-header--row">
          <div>
            <p className="page-header__welcome">Welcome back, Admin</p>
            <h1 className="page-header__title">Dashboard</h1>
            <p className="page-header__sub">
              Live view of active laundry orders and payment status.
            </p>
          </div>
          <div className="page-header__date">{formatTodayLabel()}</div>
        </div>

        {error && (
          <div
            style={{
              background: "#fff0f0",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              borderRadius: 8,
              padding: "12px 16px",
              fontSize: 13,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span>Failed to load dashboard data: {error}</span>
            <button
              className="btn-back"
              style={{ padding: "6px 14px", fontSize: 12 }}
              onClick={load}
            >
              Retry
            </button>
          </div>
        )}

        <div className="stat-cards-row">
          <div className="stat-card stat-card--navy">
            <div className="stat-card__label">Active Orders</div>
            <div className="stat-card__value">
              {loading ? <Skel w="60%" h={40} /> : stats.activeOrders}
            </div>
            <div className="stat-card__sublabel">
              Washing, drying, folding, and delivery queue
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Unpaid Orders</div>
            <div className="stat-card__value">
              {loading ? <Skel w="50%" h={40} /> : stats.unpaidOrders}
            </div>
            <div className="stat-card__sublabel">
              Requires staff payment update
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">For Delivery</div>
            <div className="stat-card__value">
              {loading ? <Skel w="50%" h={40} /> : stats.readyOrders}
            </div>
            <div className="stat-card__sublabel">Ready for pickup/delivery</div>
          </div>
        </div>

        <div className="dashboard-card dashboard-card--shadow">
          <div className="dashboard-card__header">
            <div>
              <span className="dashboard-card__title">Status Update</span>
              <span className="dashboard-card__sub">
                Active orders update dynamically as order or payment state
                changes.
              </span>
            </div>
            <button className="icon-btn" onClick={load}>
              Refresh
            </button>
          </div>

          <div className="status-update-list status-update-list--grid">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="status-update-item" style={{ gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#e2e8f4",
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <Skel w="70%" h={10} />
                    <Skel w="50%" h={10} />
                  </div>
                </div>
              ))
            ) : statusItems.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                No active orders right now.
              </p>
            ) : (
              statusItems.map((item, i) => (
                <div
                  key={item.id}
                  className="status-update-item status-update-item--card"
                  style={{ "--i": i } as CSSProperties}
                >
                  <div
                    className="topbar__avatar"
                    style={{ width: 38, height: 38, fontSize: 11 }}
                  >
                    {item.customer_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="su-info">
                    <div>
                      <strong>Customer:</strong> {item.customer_name}
                    </div>
                    <div>
                      <strong>Order:</strong> #
                      {item.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div>
                      <strong>Service:</strong> {item.service_type}
                    </div>
                    <div>
                      <strong>Date:</strong> {formatDateTime(item.created_at)}
                    </div>
                  </div>
                  <div className="su-right">
                    <div>
                      <strong>Status:</strong> {item.status}
                    </div>
                    <div>
                      <strong>Payment Method:</strong> {item.payment_method}
                    </div>
                    <div>
                      <strong>Payment:</strong>{" "}
                      <select
                        value={item.payment_status}
                        disabled={savingId === item.id}
                        onChange={(e) =>
                          updatePaymentStatus(
                            item.id,
                            e.target.value as PaymentStatus,
                          )
                        }
                      >
                        {PAYMENT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </main>
    </div>
  );
}
