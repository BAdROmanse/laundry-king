import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatPHDateTime } from "@/lib/date";
import {
  fetchExpenses,
  syncInventoryExpense,
  type ExpenseRow,
} from "@/lib/expenses";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";
import EmptyState from "@/components/EmptyStates";
import InventoryLegacy from "./InventoryLegacy";

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

interface InventoryRow {
  id: string;
  name: string;
  category: string;
  vendor: string;
  remarks: string;
  stock: number;
  status: StockStatus;
}

interface InventoryDraft extends InventoryRow {
  unit: string;
  cost_per_unit: number;
}

type ExpenseFilter = "daily" | "weekly" | "monthly";

const CATEGORIES = [
  "Detergent",
  "Fabric Conditioner",
  "Packaging",
  "Water Consumables",
  "Other Supplies",
];

function parseMeta(remarks: string | null | undefined) {
  const text = remarks ?? "";
  const rawUnit = text.match(/unit=([^;]+)/i)?.[1]?.trim() || "pcs";
  const unit = rawUnit.replace(/^\d+(\.\d+)?\s*/g, "").trim() || "pcs";
  const cost = Number(text.match(/cost=([^;]+)/i)?.[1] ?? 0);
  const note = text
    .split(";")
    .filter((part) => !/^\s*(unit|cost)=/i.test(part))
    .join(";")
    .trim();
  return { unit, cost_per_unit: Number.isFinite(cost) ? cost : 0, note };
}

function buildRemarks(draft: InventoryDraft) {
  const note = parseMeta(draft.remarks).note;
  return [
    `unit=${draft.unit || "pcs"}`,
    `cost=${draft.cost_per_unit || 0}`,
    note,
  ]
    .filter(Boolean)
    .join("; ");
}

function deriveStatus(stock: number): StockStatus {
  if (stock <= 0) return "Out of Stock";
  if (stock <= 5) return "Low Stock";
  return "In Stock";
}

function StatusBadge({ status }: { status: StockStatus }) {
  if (status === "In Stock")
    return <span className="status-badge-instock">{status}</span>;
  if (status === "Low Stock")
    return <span className="status-badge-low">{status}</span>;
  return <span className="status-badge-out">{status}</span>;
}

function dateRange(days: number) {
  const from = new Date();
  from.setDate(from.getDate() - days + 1);
  from.setHours(0, 0, 0, 0);
  return from.toISOString();
}

const EXPENSE_FILTERS: Record<ExpenseFilter, { label: string; days: number }> =
  {
    daily: { label: "Daily", days: 1 },
    weekly: { label: "Weekly", days: 7 },
    monthly: { label: "Monthly", days: 30 },
  };

export default function Inventory() {
  const [useLegacy, setUseLegacy] = useState(false);
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expenseFilter, setExpenseFilter] = useState<ExpenseFilter>("daily");
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<InventoryDraft[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadInventory(), loadExpenses()]);
    setLoading(false);
  }

  async function loadInventory() {
    const response = await apiFetch("/api/inventory");
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data?.error ?? "Failed to load inventory.";
      setLoadError(message);
      toast.error(`Failed to load inventory: ${message}`);
      return;
    }
    setLoadError(null);
    setRows((data ?? []) as InventoryRow[]);
  }

  async function loadExpenses() {
    const { data, error } = await fetchExpenses(dateRange(30));
    if (error) {
      toast.error(`Failed to load expenses: ${error.message}`);
      return;
    }
    setExpenses((data ?? []) as ExpenseRow[]);
  }

  function toDraft(row: InventoryRow): InventoryDraft {
    const meta = parseMeta(row.remarks);
    return {
      ...row,
      unit: meta.unit,
      cost_per_unit: meta.cost_per_unit,
      status: deriveStatus(row.stock),
    };
  }

  function startEditing() {
    setDraft(rows.map(toDraft));
    setEditing(true);
  }

  function patchDraft(id: string, field: keyof InventoryDraft, value: string) {
    setDraft((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const numericValue = Math.max(0, Number(value) || 0);
        const nextValue =
          field === "unit"
            ? value.replace(/^\d+(\.\d+)?\s*/g, "").trim()
            : value;
        const next = {
          ...row,
          [field]:
            field === "stock" || field === "cost_per_unit"
              ? numericValue
              : nextValue,
        };
        return { ...next, status: deriveStatus(Number(next.stock) || 0) };
      }),
    );
  }

  function buildInventoryPayload(item: InventoryDraft) {
    const { id, unit, cost_per_unit, ...rest } = item;
    return {
      ...rest,
      name: rest.name.trim(),
      category: rest.category || "Other Supplies",
      vendor: rest.vendor.trim(),
      stock: Number(rest.stock) || 0,
      status: deriveStatus(Number(rest.stock) || 0),
      remarks: buildRemarks({ id, unit, cost_per_unit, ...rest }),
    };
  }

  async function finishEditing() {
    const invalid = draft.find((item) => !item.name.trim());
    if (invalid) {
      toast.error("Item name is required.");
      return;
    }

    setSaving(true);

    const existingItems = draft.filter((item) => !item.id.startsWith("__new"));
    const newItems = draft.filter((item) => item.id.startsWith("__new"));

    const updatePayloads = existingItems.map((item) => ({
      id: item.id,
      ...buildInventoryPayload(item),
    }));

    for (const payload of updatePayloads) {
      const response = await apiFetch(`/api/inventory/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setSaving(false);
        toast.error(`Save failed: ${body?.error ?? "Inventory update failed."}`);
        return;
      }
    }

    const insertPayloads = newItems.map(buildInventoryPayload);
    const insertedRows = [];
    for (const payload of insertPayloads) {
      const response = await apiFetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setSaving(false);
        toast.error(`Save failed: ${body?.error ?? "Inventory insert failed."}`);
        return;
      }
      insertedRows.push(body);
    }

    const expenseChanges = [
      ...existingItems.flatMap((item) => {
        const previous = rows.find((row) => row.id === item.id);
        if (!previous) return [];

        const stockDelta = item.stock - previous.stock;
        if (stockDelta === 0) return [];

        return [
          {
            inventory_id: item.id,
            type: item.category || "Other Supplies",
            detail: item.name,
            quantity: Math.abs(stockDelta),
            unit: item.unit || "pcs",
            total_amount: Math.abs(stockDelta) * (item.cost_per_unit || 0),
            action: stockDelta > 0 ? "purchase" : "usage",
          } as const,
        ];
      }),
      ...newItems.flatMap((item, index) => {
        const inserted = (insertedRows ?? [])[index];
        if (!inserted || item.stock <= 0) return [];

        return [
          {
            inventory_id: inserted.id,
            type: item.category || "Other Supplies",
            detail: item.name,
            quantity: item.stock,
            unit: item.unit || "pcs",
            total_amount: item.stock * (item.cost_per_unit || 0),
            action: "purchase",
          } as const,
        ];
      }),
    ];

    for (const change of expenseChanges) {
      const result = await syncInventoryExpense(change);
      if (result?.error) {
        toast.error(`Expense sync failed: ${result.error.message}`);
      }
    }

    setSaving(false);
    await loadAll();
    setEditing(false);
    toast.success("Inventory saved and expenses updated.");
  }

  function addRow() {
    const blank: InventoryDraft = {
      id: `__new_${Date.now()}`,
      name: "",
      category: "Other Supplies",
      vendor: "",
      remarks: "",
      stock: 0,
      unit: "pcs",
      cost_per_unit: 0,
      status: "Out of Stock",
    };
    if (!editing) {
      setDraft([...rows.map(toDraft), blank]);
      setEditing(true);
    } else {
      setDraft((prev) => [...prev, blank]);
    }
  }

  async function deleteRow(id: string) {
    if (!confirm("Delete this item?")) return;
    if (id.startsWith("__new")) {
      setDraft((prev) => prev.filter((r) => r.id !== id));
      return;
    }
    const response = await apiFetch(`/api/inventory/${id}`, {
      method: "DELETE",
    });
    const body = await response.json().catch(() => null);
    if (response.ok) {
      await loadInventory();
      toast.success("Item deleted.");
    } else {
      toast.error(`Delete failed: ${body?.error ?? "Inventory delete failed."}`);
    }
  }

  const displayRows = editing ? draft : rows.map(toDraft);
  const filtered = displayRows.filter((row) => {
    const matchesSearch = [row.name, row.category, row.vendor, row.status]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = category === "All" || row.category === category;
    const matchesStatus = statusFilter === "All" || row.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const summary = useMemo(() => {
    const totalValue = displayRows.reduce(
      (sum, row) => sum + row.stock * row.cost_per_unit,
      0,
    );
    const selectedExpenseTotal = expenses
      .filter(
        (ex) => ex.created_at >= dateRange(EXPENSE_FILTERS[expenseFilter].days),
      )
      .reduce((sum, ex) => sum + (ex.total_amount ?? 0), 0);
    const selectedExpenseCount = expenses.filter(
      (ex) => ex.created_at >= dateRange(EXPENSE_FILTERS[expenseFilter].days),
    ).length;
    return {
      total: rows.length,
      low: displayRows.filter((r) => r.status === "Low Stock").length,
      out: displayRows.filter((r) => r.status === "Out of Stock").length,
      totalValue,
      selectedExpenseTotal,
      selectedExpenseCount,
    };
  }, [displayRows, expenseFilter, expenses, rows.length]);

  if (useLegacy) {
    return (
      <div>
        <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 50 }}>
          <button className="icon-btn" onClick={() => setUseLegacy(false)}>
            Enhanced View
          </button>
        </div>
        <InventoryLegacy />
      </div>
    );
  }

  return (
    <div className="lk-shell">
      <AdminSidebar />
      <main className="main">
        <AdminTopbar />
        <div className="page-header page-header--row">
          <div>
            <h1 className="page-header__title">Inventory</h1>
            <p className="page-header__sub">
              Stock tracking, usage history, and operational expenses.
            </p>
          </div>
          <div className="inv-actions">
            <button className="icon-btn" onClick={() => setUseLegacy(true)}>
              Legacy View
            </button>
            <button
              className={`icon-btn${editing ? " editing" : ""}`}
              onClick={editing ? finishEditing : startEditing}
              disabled={saving}
            >
              {editing ? (saving ? "Saving..." : "Save") : "Edit"}
            </button>
            <button className="icon-btn" onClick={addRow}>
              Add
            </button>
          </div>
        </div>

        {loadError && (
          <div className="error-banner">
            {loadError}
            <button onClick={loadAll}>Retry</button>
          </div>
        )}

        <div className="inventory-kpi-grid">
          <div className="dashboard-card">
            <span className="dashboard-card__title">Items</span>
            <strong>{summary.total}</strong>
          </div>
          <div className="dashboard-card">
            <span className="dashboard-card__title">Low Stock</span>
            <strong>{summary.low}</strong>
          </div>
          <div className="dashboard-card">
            <span className="dashboard-card__title">Out of Stock</span>
            <strong>{summary.out}</strong>
          </div>
          <div className="dashboard-card">
            <span className="dashboard-card__title">Stock Value</span>
            <strong>{`\u20b1${summary.totalValue.toLocaleString()}`}</strong>
          </div>
        </div>

        <div className="inventory-kpi-grid">
          <div className="dashboard-card">
            <div className="dashboard-card__header" style={{ marginBottom: 0 }}>
              <span className="dashboard-card__title">
                {EXPENSE_FILTERS[expenseFilter].label} Expenses
              </span>
              <select
                value={expenseFilter}
                onChange={(e) =>
                  setExpenseFilter(e.target.value as ExpenseFilter)
                }
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <strong>{`\u20b1${summary.selectedExpenseTotal.toLocaleString()}`}</strong>
          </div>
          <div className="dashboard-card">
            <span className="dashboard-card__title">Usage Logs</span>
            <strong>{summary.selectedExpenseCount}</strong>
          </div>
        </div>

        <div className="inventory-toolbar">
          <input
            type="text"
            placeholder="Search inventory"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All</option>
            {CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Cost / Unit</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Last Updated</th>
                {editing && <th></th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9}>Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      icon="inventory"
                      title="No inventory items"
                      sub="Adjust filters or add a new item."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {editing ? (
                        <input
                          value={row.name}
                          onChange={(e) =>
                            patchDraft(row.id, "name", e.target.value)
                          }
                        />
                      ) : (
                        row.name
                      )}
                    </td>
                    <td>
                      {editing ? (
                        <select
                          value={row.category}
                          onChange={(e) =>
                            patchDraft(row.id, "category", e.target.value)
                          }
                        >
                          {CATEGORIES.map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      ) : (
                        row.category
                      )}
                    </td>
                    <td>
                      {editing ? (
                        <input
                          type="number"
                          min="0"
                          value={row.stock}
                          onChange={(e) =>
                            patchDraft(row.id, "stock", e.target.value)
                          }
                        />
                      ) : (
                        row.stock
                      )}
                    </td>
                    <td>
                      {editing ? (
                        <input
                          value={row.unit}
                          onChange={(e) =>
                            patchDraft(row.id, "unit", e.target.value)
                          }
                        />
                      ) : (
                        row.unit
                      )}
                    </td>
                    <td>
                      {editing ? (
                        <input
                          type="number"
                          min="0"
                          value={row.cost_per_unit}
                          onChange={(e) =>
                            patchDraft(row.id, "cost_per_unit", e.target.value)
                          }
                        />
                      ) : (
                        `\u20b1${row.cost_per_unit.toLocaleString()}`
                      )}
                    </td>
                    <td>{`\u20b1${(row.stock * row.cost_per_unit).toLocaleString()}`}</td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td>{new Date().toLocaleDateString("en-PH")}</td>
                    {editing && (
                      <td>
                        <button
                          className="icon-btn"
                          onClick={() => deleteRow(row.id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="dashboard-card" style={{ marginTop: 18 }}>
          <div className="dashboard-card__header">
            <span className="dashboard-card__title">
              Inventory Usage History
            </span>
          </div>
          <table className="data-table data-table--plain">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Item</th>
                <th>Quantity Used</th>
                <th>Expense</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ color: "var(--text-muted)" }}>
                    No usage logged yet.
                  </td>
                </tr>
              ) : (
                expenses.slice(0, 10).map((expense, index) => (
                  <tr key={`${expense.created_at}-${index}`}>
                    <td>
                      {formatPHDateTime(expense.created_at)}
                    </td>
                    <td>{expense.type}</td>
                    <td>{expense.detail}</td>
                    <td>{expense.quantity}</td>
                    <td>{`\u20b1${expense.total_amount.toLocaleString()}`}</td>
                    <td>{expense.remark ?? "-"}</td>
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
