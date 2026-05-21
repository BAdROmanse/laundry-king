// src/pages/admin/Sales.tsx
import { toast } from "sonner";
import EmptyState from "@/components/EmptyStates";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { fetchExpenses } from "@/lib/expenses";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";

// ── Types ─────────────────────────────────────────────────────
type FilterKey =
  | "today"
  | "yesterday"
  | "week"
  | "last-week"
  | "month"
  | "last-month"
  | "three-months";

interface KpiData {
  sales: number;
  expenses: number;
  label: string;
}
interface SalesRow {
  service: string;
  customers: number;
  unpaid: number;
  total: number;
}
interface ExpRow {
  type: string;
  detail: string;
  qty: number;
  remark: string;
  total: number;
}
interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

const FILTER_OPTIONS: { value: FilterKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "This Week" },
  { value: "last-week", label: "Last Week" },
  { value: "month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "three-months", label: "Last 3 Months" },
];

// ── Date range ────────────────────────────────────────────────
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

// ── Donut SVG ─────────────────────────────────────────────────
function DonutChart({
  slices,
  total,
}: {
  slices: DonutSlice[];
  total: number;
}) {
  const R = 38;
  const CIRC = 2 * Math.PI * R;
  let offset = 0;

  const paths = slices.map((slice) => {
    const pct = total > 0 ? slice.value / total : 0;
    const dash = pct * CIRC;
    const path = (
      <circle
        key={slice.label}
        cx="50"
        cy="50"
        r={R}
        fill="none"
        stroke={slice.color}
        strokeWidth="22"
        strokeDasharray={`${dash} ${CIRC}`}
        strokeDashoffset={-offset}
        transform="rotate(-90 50 50)"
      />
    );
    offset += dash;
    return path;
  });

  return (
    <svg viewBox="0 0 100 100" width="130" height="130">
      <circle
        cx="50"
        cy="50"
        r={R}
        fill="none"
        stroke="#2a4f8f"
        strokeWidth="22"
      />
      {paths}
      <circle cx="50" cy="50" r="25" fill="#1a3a6b" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────
export default function Sales() {
  const [filter, setFilter] = useState<FilterKey>("month");
  const [kpi, setKpi] = useState<KpiData>({ sales: 0, expenses: 0, label: "" });
  const [salesRows, setSalesRows] = useState<SalesRow[]>([]);
  const [expRows, setExpRows] = useState<ExpRow[]>([]);
  const [incomeSlices, setIncomeSlices] = useState<DonutSlice[]>([]);
  const [expenseSlices, setExpenseSlices] = useState<DonutSlice[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll(filter);
  }, [filter]);

  async function fetchAll(f: FilterKey) {
    setLoading(true);
    setFetchError(null);
    const { from, to } = getRange(f);

    // ── Orders ───────────────────────────────────────────────
    const orderResponse = await apiFetch(
      `/api/transactions?${new URLSearchParams({ from, to }).toString()}`,
    );
    const orderData = await orderResponse.json().catch(() => null);

    if (!orderResponse.ok) {
      const message = orderData?.error ?? "Failed to load sales.";
      setFetchError(message);
      toast.error(`Failed to load sales: ${message}`);
      setLoading(false);
      return;
    }

    const orders: any[] = orderData ?? [];
    const totalSales = orders.reduce((s, o) => s + (o.total_cost ?? 0), 0);

    // Group by service_type
    const byService: Record<
      string,
      { customers: number; unpaid: number; total: number }
    > = {};
    orders.forEach((o) => {
      const svc = o.service_type ?? "Other";
      if (!byService[svc])
        byService[svc] = { customers: 0, unpaid: 0, total: 0 };
      byService[svc].customers += 1;
      if (o.payment_status !== "Paid") byService[svc].unpaid += 1;
      byService[svc].total += o.total_cost ?? 0;
    });

    setSalesRows(
      Object.entries(byService).map(([svc, v]) => ({
        service: svc,
        customers: v.customers,
        unpaid: v.unpaid,
        total: v.total,
      })),
    );

    const INCOME_COLORS = ["#3a6bbf", "#4fa3d1", "#dce8f8"];
    setIncomeSlices(
      Object.entries(byService).map(([svc, v], i) => ({
        label: svc,
        value: v.total,
        color: INCOME_COLORS[i % INCOME_COLORS.length],
      })),
    );

    // ── Expenses ─────────────────────────────────────────────
    const { data: expData, error: expenseError } = await fetchExpenses(
      from,
      to,
    );

    if (expenseError) {
      setFetchError(expenseError.message);
      toast.error(`Failed to load expenses: ${expenseError.message}`);
      setLoading(false);
      return;
    }

    const expenses: any[] = expData ?? [];
    const totalExp = expenses.reduce((s, ex) => s + (ex.total_amount ?? 0), 0);

    setExpRows(
      expenses.map((ex) => ({
        type: ex.type,
        detail: ex.detail,
        qty: ex.quantity,
        remark: ex.remark ?? "",
        total: ex.total_amount,
      })),
    );

    const byType: Record<string, number> = {};
    expenses.forEach((ex) => {
      byType[ex.type] = (byType[ex.type] ?? 0) + (ex.total_amount ?? 0);
    });
    const EXP_COLORS = ["#3a6bbf", "#4fa3d1", "#dce8f8"];
    setExpenseSlices(
      Object.entries(byType).map(([t, v], i) => ({
        label: t,
        value: v,
        color: EXP_COLORS[i % EXP_COLORS.length],
      })),
    );

    setKpi({
      sales: totalSales,
      expenses: totalExp,
      label: FILTER_OPTIONS.find((o) => o.value === f)?.label ?? "",
    });

    setLoading(false);
  }

  const incomeTot = incomeSlices.reduce((s, sl) => s + sl.value, 0);
  const expenseTot = expenseSlices.reduce((s, sl) => s + sl.value, 0);

  return (
    <div className="lk-shell">
      <AdminSidebar />

      <main className="main">
        <AdminTopbar />

        {/* ── Page header ── */}
        <div className="page-header page-header--row">
          <div>
            <h1 className="page-header__title">Sales</h1>
            <p className="page-header__sub">Monitor your cash flow here!</p>
          </div>
          <select
            className="sales-dropdown"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterKey)}
          >
            {FILTER_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {fetchError && (
          <div
            style={{
              color: "#721c24",
              background: "#f8d7da",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {fetchError}
            <button
              onClick={() => fetchAll(filter)}
              style={{
                marginLeft: 12,
                background: "none",
                border: "none",
                color: "#721c24",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Retry
            </button>
          </div>
        )}

        <div className="sales-layout">
          {/* ── LEFT: KPIs + tables ── */}
          <div className="sales-main">
            {/* KPI row */}
            <div className="sales-kpi-row">
              <div className="dashboard-card sales-kpi-card">
                <div className="sales-kpi-header">
                  <span className="dashboard-card__title">Total Sales</span>
                </div>
                <div className="sales-kpi-value">
                  {loading ? "—" : `₱${kpi.sales.toLocaleString()}`}
                </div>
                <div className="sales-kpi-date">{kpi.label}</div>
              </div>

              <div className="dashboard-card sales-kpi-card">
                <div className="sales-kpi-header">
                  <span className="dashboard-card__title">Total Expenses</span>
                </div>
                <div className="sales-kpi-value">
                  {loading ? "—" : `₱${kpi.expenses.toLocaleString()}`}
                </div>
                <div className="sales-kpi-date">{kpi.label}</div>
              </div>
            </div>

            {/* Sales Breakdown */}
            <div className="dashboard-card">
              <div className="sales-table-header">
                <span className="dashboard-card__title">Sales Breakdown</span>
              </div>
              <table
                className="data-table data-table--plain"
                style={{ marginTop: 14 }}
              >
                <thead>
                  <tr>
                    <th>Service Type</th>
                    <th>No. of Customers</th>
                    <th>Unpaid</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} style={{ color: "var(--text-muted)" }}>
                        Loading…
                      </td>
                    </tr>
                  ) : salesRows.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <EmptyState
                          icon="transactions"
                          title="No sales data"
                          sub="No orders in this period."
                        />
                      </td>
                    </tr>
                  ) : (
                    salesRows.map((r, i) => (
                      <tr key={i}>
                        <td>{r.service}</td>
                        <td>{r.customers}</td>
                        <td>{r.unpaid}</td>
                        <td>₱{r.total.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Expenses Breakdown */}
            <div className="dashboard-card">
              <div className="sales-table-header">
                <span className="dashboard-card__title">
                  Expenses Breakdown
                </span>
              </div>
              <table
                className="data-table data-table--plain"
                style={{ marginTop: 14 }}
              >
                <thead>
                  <tr>
                    <th>Expense Type</th>
                    <th>Detail</th>
                    <th>Quantity</th>
                    <th>Remark</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ color: "var(--text-muted)" }}>
                        Loading…
                      </td>
                    </tr>
                  ) : expRows.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState
                          icon="inventory"
                          title="No expenses recorded"
                          sub="No expenses logged in this period."
                        />
                      </td>
                    </tr>
                  ) : (
                    expRows.map((r, i) => (
                      <tr key={i}>
                        <td>{r.type}</td>
                        <td>{r.detail}</td>
                        <td>{r.qty}</td>
                        <td>{r.remark}</td>
                        <td>₱{r.total.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── RIGHT: donut charts ── */}
          <div className="sales-charts">
            <div className="sales-donut-card">
              <div className="sales-donut-header">
                <span className="dashboard-card__title">Income</span>
              </div>
              <div className="sales-donut-amount">
                ₱{incomeTot.toLocaleString()}
              </div>
              <div className="donut-wrapper">
                <DonutChart slices={incomeSlices} total={incomeTot} />
              </div>
              <div className="donut-legend">
                {incomeSlices.length === 0 ? (
                  <span
                    style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}
                  >
                    No data
                  </span>
                ) : (
                  incomeSlices.map((sl) => (
                    <span key={sl.label}>
                      <span
                        className="legend-dot"
                        style={{ background: sl.color }}
                      />
                      {sl.label}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="sales-donut-card">
              <div className="sales-donut-header">
                <span className="dashboard-card__title">Expenses</span>
              </div>
              <div className="sales-donut-amount">
                ₱{expenseTot.toLocaleString()}
              </div>
              <div className="donut-wrapper">
                <DonutChart slices={expenseSlices} total={expenseTot} />
              </div>
              <div className="donut-legend">
                {expenseSlices.length === 0 ? (
                  <span
                    style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}
                  >
                    No data
                  </span>
                ) : (
                  expenseSlices.map((sl) => (
                    <span key={sl.label}>
                      <span
                        className="legend-dot"
                        style={{ background: sl.color }}
                      />
                      {sl.label}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
