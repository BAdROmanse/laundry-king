import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatPHDateTime } from "@/lib/date";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  normalizePaymentMethod,
  normalizePaymentStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/payments";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";

interface TxnRow {
  id: string;
  reference_no: string;
  user_id: string;
  username: string;
  service_name: string;
  total_cost: number | null;
  payment_method: PaymentMethod | "";
  payment_status: PaymentStatus;
  order_status: string;
  created_at: string;
}

type FilterKey =
  | "today"
  | "yesterday"
  | "week"
  | "last-week"
  | "month"
  | "last-month"
  | "three-months";

type DeliveryFilter = "not-delivered" | "delivered";

const FILTER_OPTIONS: { value: FilterKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "This Week" },
  { value: "last-week", label: "Last Week" },
  { value: "month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "three-months", label: "Last 3 Months" },
];

const DELIVERY_FILTER_OPTIONS: { value: DeliveryFilter; label: string }[] = [
  { value: "not-delivered", label: "Not Delivered" },
  { value: "delivered", label: "Delivered" },
];

function getRange(filter: FilterKey) {
  const now = new Date();
  const pad = (d: Date) => d.toISOString().slice(0, 10);
  const s = (d: Date) => `${pad(d)}T00:00:00`;
  const e = (d: Date) => `${pad(d)}T23:59:59`;
  const mon = (d: Date) => {
    const day = d.getDay();
    const c = new Date(d);
    c.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    return c;
  };
  switch (filter) {
    case "today":
      return { from: s(now), to: e(now) };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      return { from: s(y), to: e(y) };
    }
    case "week": {
      const m = mon(new Date(now));
      const su = new Date(m);
      su.setDate(m.getDate() + 6);
      return { from: s(m), to: e(su) };
    }
    case "last-week": {
      const m = mon(new Date(now));
      m.setDate(m.getDate() - 7);
      const su = new Date(m);
      su.setDate(m.getDate() + 6);
      return { from: s(m), to: e(su) };
    }
    case "month": {
      const m = new Date(now.getFullYear(), now.getMonth(), 1);
      const en = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: s(m), to: e(en) };
    }
    case "last-month": {
      const m = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const en = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: s(m), to: e(en) };
    }
    case "three-months": {
      const m = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const en = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: s(m), to: e(en) };
    }
  }
}

export default function ATransactions() {
  const [filter, setFilter] = useState<FilterKey>("three-months");
  const [deliveryFilter, setDeliveryFilter] =
    useState<DeliveryFilter>("not-delivered");
  const [rows, setRows] = useState<TxnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchData(f: FilterKey, delivery: DeliveryFilter) {
    setLoading(true);
    setError(null);
    const { from, to } = getRange(f);
    const params = new URLSearchParams({ from, to, delivery });
    const response = await apiFetch(`/api/transactions?${params.toString()}`);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setError(data?.error ?? "Failed to load transactions.");
      setLoading(false);
      return;
    }

    setRows(
      ((data as any[]) ?? []).map((o: any) => ({
        id: o.id,
        reference_no: o.id.slice(0, 8).toUpperCase(),
        user_id: o.user_id.slice(0, 8),
        username: o.users?.full_name ?? o.users?.username ?? "-",
        service_name: [o.service_type, o.pack_type].filter(Boolean).join(" / "),
        total_cost: o.total_cost,
        payment_method: normalizePaymentMethod(o.payment_method),
        payment_status: normalizePaymentStatus(o.payment_status),
        order_status: o.status ?? "-",
        created_at: o.created_at,
      })),
    );
    setLoading(false);
  }

  async function updatePayment(
    row: TxnRow,
    changes: Partial<Pick<TxnRow, "payment_method" | "payment_status">>,
  ) {
    const next = { ...row, ...changes };
    setSavingId(row.id);
    setRows((prev) => prev.map((r) => (r.id === row.id ? next : r)));

    const response = await apiFetch(`/api/transactions/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payment_method: next.payment_method || null,
        payment_status: next.payment_status,
      }),
    });
    const body = await response.json().catch(() => null);

    setSavingId(null);
    if (!response.ok) {
      setError(body?.error ?? "Failed to update payment.");
      await fetchData(filter, deliveryFilter);
    }
  }

  async function markDelivered(row: TxnRow) {
    setSavingId(row.id);
    setError(null);

    const response = await apiFetch(`/api/transactions/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Delivered" }),
    });
    const body = await response.json().catch(() => null);

    setSavingId(null);
    if (!response.ok) {
      const message = body?.error ?? "Failed to update delivery status.";
      setError(message);
      toast.error(`Delivery update failed: ${message}`);
      return;
    }

    toast.success("Order marked as delivered.");
    setRows((prev) =>
      deliveryFilter === "delivered"
        ? prev.map((r) =>
            r.id === row.id ? { ...r, order_status: "Delivered" } : r,
          )
        : prev.filter((r) => r.id !== row.id),
    );
    await fetchData(filter, deliveryFilter);
  }

  useEffect(() => {
    fetchData(filter, deliveryFilter);
  }, [filter, deliveryFilter]);

  return (
    <div className="lk-shell">
      <AdminSidebar />
      <main className="main">
        <AdminTopbar />

        <div className="page-header page-header--row">
          <div>
            <h1 className="page-header__title">Transactions</h1>
            <p className="page-header__sub">All customer transactions.</p>
          </div>
          <div className="inventory-toolbar" style={{ margin: 0 }}>
            <select
              className="transactions-dropdown"
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterKey)}
            >
              {FILTER_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className="transactions-dropdown"
              value={deliveryFilter}
              onChange={(e) =>
                setDeliveryFilter(e.target.value as DeliveryFilter)
              }
            >
              {DELIVERY_FILTER_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            Failed to load transactions: {error}
            <button onClick={() => fetchData(filter, deliveryFilter)}>
              Retry
            </button>
          </div>
        )}

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Laundry Service</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Amount</th>
                <th>Date and Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", color: "var(--text-muted)" }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", color: "var(--text-muted)" }}
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>#{row.reference_no}</td>
                    <td>{row.username}</td>
                    <td>{row.service_name || "-"}</td>
                    <td>
                      <select
                        value={row.payment_method}
                        disabled={savingId === row.id}
                        onChange={(e) =>
                          updatePayment(row, {
                            payment_method: e.target.value as PaymentMethod,
                          })
                        }
                      >
                        <option value="">Select method</option>
                        {PAYMENT_METHODS.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={row.payment_status}
                        disabled={savingId === row.id}
                        onChange={(e) =>
                          updatePayment(row, {
                            payment_status: e.target.value as PaymentStatus,
                          })
                        }
                      >
                        {PAYMENT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{row.order_status}</td>
                    <td>
                      {row.total_cost != null
                        ? `\u20b1${row.total_cost.toLocaleString()}`
                        : "-"}
                    </td>
                    <td>{formatPHDateTime(row.created_at)}</td>
                    <td>
                      {row.payment_status === "Paid" &&
                      row.order_status === "For Delivery" ? (
                        <button
                          className="icon-btn"
                          disabled={savingId === row.id}
                          onClick={() => markDelivered(row)}
                          style={{ width: "auto", padding: "0 12px" }}
                        >
                          Delivered
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
