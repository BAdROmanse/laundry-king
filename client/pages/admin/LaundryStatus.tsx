import { toast } from "sonner";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  PAYMENT_STATUSES,
  normalizePaymentMethod,
  normalizePaymentStatus,
  type PaymentStatus,
} from "@/lib/payments";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";
import EmptyState from "@/components/EmptyStates";

type LaundryStatus = "Washing" | "Drying" | "Folding" | "For Delivery";

interface OrderCard {
  id: string;
  reference_no: string;
  username: string;
  service_type: string;
  status: LaundryStatus;
  payment_method: string | null;
  payment_status: PaymentStatus;
}

const STATUSES: LaundryStatus[] = [
  "Washing",
  "Drying",
  "Folding",
  "For Delivery",
];
const STAT_CONFIG: Record<LaundryStatus, { label: string; sublabel: string }> =
  {
    Washing: { label: "Washing", sublabel: "Currently washing" },
    Drying: { label: "Drying", sublabel: "Drying in progress" },
    Folding: { label: "Folding", sublabel: "Finishing up laundry" },
    "For Delivery": {
      label: "For Delivery",
      sublabel: "Available for pickup/delivery",
    },
  };

export default function AdminLaundryStatus() {
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const response = await apiFetch("/api/laundry-status");
    const data = await response.json().catch(() => null);

    if (response.ok && data) {
      setOrders(
        data.map((o: any) => ({
          id: o.id,
          reference_no: o.id.slice(0, 8).toUpperCase(),
          username: o.users?.full_name ?? o.users?.username ?? "-",
          service_type: o.service_type,
          status: o.status as LaundryStatus,
          payment_method: normalizePaymentMethod(o.payment_method) || null,
          payment_status: normalizePaymentStatus(o.payment_status),
        })),
      );
    }
    setLoading(false);
  }

  async function updateStatus(orderId: string, newStatus: LaundryStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    const response = await apiFetch(`/api/laundry-status/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      toast.error(`Failed to update: ${body?.error ?? "Unknown error"}`);
      await loadOrders();
    } else {
      toast.success("Order status updated!");
    }
  }

  async function updatePaymentStatus(orderId: string, newStatus: PaymentStatus) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, payment_status: newStatus } : o,
      ),
    );
    const response = await apiFetch(`/api/transactions/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_status: newStatus }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      toast.error(`Failed to update payment: ${body?.error ?? "Unknown error"}`);
      await loadOrders();
    } else {
      toast.success("Payment status updated!");
    }
  }

  const countOf = (s: LaundryStatus) =>
    orders.filter((o) => o.status === s).length;

  return (
    <div className="lk-shell">
      <AdminSidebar />
      <main className="main">
        <AdminTopbar />
        <div className="page-header page-header--row">
          <div>
            <h1 className="page-header__title">Laundry Status</h1>
            <p className="page-header__sub">
              Here is the current status of customer orders.
            </p>
          </div>
          <button className="icon-btn" onClick={loadOrders}>
            ↻
          </button>
        </div>

        <div className="ls-stat-row">
          {STATUSES.map((s) => (
            <div key={s} className="ls-stat-card">
              <div className="ls-stat-card__label">{STAT_CONFIG[s].label}</div>
              <div className="ls-stat-card__value">
                {loading ? "—" : countOf(s)}
              </div>
              <div className="ls-stat-card__sublabel">
                {STAT_CONFIG[s].sublabel}
              </div>
            </div>
          ))}
        </div>

        <div className="ls-detail-row">
          {STATUSES.map((s) => (
            <div key={s} className="ls-detail-col">
              <div className="ls-detail-col__title">{STAT_CONFIG[s].label}</div>
              <div className="ls-order-list">
                {loading ? (
                  <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    Loading…
                  </p>
                ) : orders.filter((o) => o.status === s).length === 0 ? (
                  <EmptyState icon="laundry" title="No orders" />
                ) : (
                  orders
                    .filter((o) => o.status === s)
                    .map((order) => (
                      <div key={order.id} className="ls-order-card">
                        <div>
                          <strong>Ref:</strong> #{order.reference_no}
                        </div>
                        <div>
                          <strong>Customer:</strong> {order.username}
                        </div>
                        <div>
                          <strong>Service:</strong> {order.service_type}
                        </div>
                        <div>
                          <strong>Payment Method:</strong>{" "}
                          {order.payment_method ?? "-"}
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateStatus(
                                order.id,
                                e.target.value as LaundryStatus,
                              )
                            }
                            style={{
                              fontSize: 12,
                              fontFamily: "var(--font)",
                              fontWeight: 600,
                              color: "var(--navy)",
                              border: "1px solid var(--border)",
                              borderRadius: 6,
                              padding: "3px 8px",
                              background: "var(--navy-light)",
                              cursor: "pointer",
                            }}
                          >
                            {STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {STAT_CONFIG[st].label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <select
                            value={order.payment_status}
                            onChange={(e) =>
                              updatePaymentStatus(
                                order.id,
                                e.target.value as PaymentStatus,
                              )
                            }
                            style={{
                              fontSize: 12,
                              fontFamily: "var(--font)",
                              fontWeight: 600,
                              color: "var(--navy)",
                              border: "1px solid var(--border)",
                              borderRadius: 6,
                              padding: "3px 8px",
                              background: "var(--navy-light)",
                              cursor: "pointer",
                            }}
                          >
                            {PAYMENT_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
