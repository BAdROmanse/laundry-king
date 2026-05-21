import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";
import EmptyState from "@/components/EmptyStates";

interface InventoryRow {
  id: string;
  name: string;
  category: string;
  vendor: string;
  remarks: string;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

function StatusBadge({ status }: { status: string }) {
  if (status === "In Stock")
    return <span className="status-badge-instock">{status}</span>;
  if (status === "Low Stock")
    return <span className="status-badge-low">{status}</span>;
  return <span className="status-badge-out">{status}</span>;
}

export default function Inventory() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<InventoryRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    setLoading(true);
    const { data, error } = await supabase
      .from("inventory")
      .select("id, name, category, vendor, remarks, stock, status")
      .order("name");

    if (error) {
      setLoadError(error.message);
      toast.error(`Failed to load inventory: ${error.message}`);
      setLoading(false);
      return;
    }
    setLoadError(null);

    setRows((data ?? []) as InventoryRow[]);
    setLoading(false);
  }

  function startEditing() {
    setDraft(rows.map((r) => ({ ...r })));
    setEditing(true);
  }

  function patchDraft(idx: number, field: keyof InventoryRow, value: string) {
    setDraft((prev) =>
      prev.map((r, i) =>
        i === idx
          ? { ...r, [field]: field === "stock" ? Number(value) : value }
          : r,
      ),
    );
  }

  async function finishEditing() {
    setSaving(true);
    const upserts = draft.map(({ id, ...rest }) => ({
      id: id.startsWith("__new") ? undefined : id,
      ...rest,
    }));
    const { error } = await supabase.from("inventory").upsert(upserts as any);
    setSaving(false);
    if (!error) {
      await loadInventory();
      setEditing(false);
      toast.success("Inventory saved successfully!");
    } else toast.error(`Save failed: ${error.message}`);
  }

  function addRow() {
    const blank: InventoryRow = {
      id: `__new_${Date.now()}`,
      name: "",
      category: "",
      vendor: "",
      remarks: "",
      stock: 0,
      status: "In Stock",
    };
    if (!editing) {
      setDraft([...rows.map((r) => ({ ...r })), blank]);
      setEditing(true);
    } else setDraft((prev) => [...prev, blank]);
  }

  const displayRows = editing ? draft : rows;
  const filtered = search
    ? displayRows.filter((r) =>
        [r.name, r.category, r.vendor, r.status]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : displayRows;

  const inStock = rows.filter((r) => r.status === "In Stock").length;
  const lowStock = rows.filter((r) => r.status === "Low Stock").length;
  const outStock = rows.filter((r) => r.status === "Out of Stock").length;
  const total = rows.length;
  const inPct = total ? Math.round((inStock / total) * 100) : 0;
  const lowPct = total ? Math.round((lowStock / total) * 100) : 0;

  const FIELDS: (keyof InventoryRow)[] = [
    "name",
    "category",
    "vendor",
    "remarks",
    "stock",
  ];

  async function deleteRow(id: string) {
    if (!confirm("Delete this item?")) return;
    if (id.startsWith("__new")) {
      setDraft((prev) => prev.filter((r) => r.id !== id));
      return;
    }
    const { error } = await supabase.from("inventory").delete().eq("id", id);
    if (!error) {
      await loadInventory();
      toast.success("Item deleted.");
    } else toast.error(`Delete failed: ${error.message}`);
  }

  return (
    <div className="lk-shell">
      <AdminSidebar />
      <main className="main">
        <AdminTopbar />
        <div className="page-header page-header--row">
          <h1 className="page-header__title">Inventory</h1>
          <div className="page-header__search">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {loadError && (
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
            {loadError}
            <button
              onClick={loadInventory}
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
        <div className="inv-summary">
          <div className="inv-count">
            <strong>{total}</strong> products
          </div>
          <div className="inv-progress-bar">
            <div
              className="inv-progress-seg"
              style={{ width: `${inPct}%`, background: "#1a3a6b" }}
            />
            <div
              className="inv-progress-seg"
              style={{ width: `${lowPct}%`, background: "#4fa3d1" }}
            />
            <div
              className="inv-progress-seg"
              style={{
                width: `${100 - inPct - lowPct}%`,
                background: "#2a6bb5",
              }}
            />
          </div>
          <div className="inv-legend">
            <span
              className="inv-legend-dot"
              style={{ background: "#1a3a6b" }}
            />
            In Stock: {inStock}
            <span
              className="inv-legend-dot"
              style={{ background: "#4fa3d1", marginLeft: 12 }}
            />
            Low Stock: {lowStock}
            <span
              className="inv-legend-dot"
              style={{ background: "#2a6bb5", marginLeft: 12 }}
            />
            Out of Stock: {outStock}
          </div>
          <div className="inv-actions">
            <button
              className={`icon-btn${editing ? " editing" : ""}`}
              onClick={editing ? finishEditing : startEditing}
              disabled={saving}
            >
              {editing ? (saving ? "Saving…" : "Finish") : "Edit"}
            </button>
            <button className="icon-btn" onClick={addRow}>
              Add
            </button>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Remarks</th>
                <th>Stock</th>
                <th>Status</th>
                {editing && <th></th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon="inventory"
                      title="No inventory items"
                      sub="Click + Add to add your first item."
                    />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", color: "var(--text-muted)" }}
                  >
                    No items found.
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => (
                  <tr key={row.id}>
                    {FIELDS.map((field) => (
                      <td
                        key={field}
                        contentEditable={editing}
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          editing &&
                          patchDraft(idx, field, e.currentTarget.innerText)
                        }
                      >
                        {String(row[field])}
                      </td>
                    ))}
                    <td>
                      {editing ? (
                        <select
                          value={row.status}
                          onChange={(e) =>
                            patchDraft(idx, "status", e.target.value)
                          }
                          style={{
                            border: "none",
                            background: "transparent",
                            fontFamily: "var(--font)",
                            fontSize: 13,
                            color: "var(--navy)",
                            fontWeight: 600,
                          }}
                        >
                          <option>In Stock</option>
                          <option>Low Stock</option>
                          <option>Out of Stock</option>
                        </select>
                      ) : (
                        <StatusBadge status={row.status} />
                      )}
                    </td>
                    {editing && (
                      <td>
                        <button
                          onClick={() => deleteRow(row.id)}
                          style={{
                            background: "#fee2e2",
                            border: "none",
                            borderRadius: 6,
                            padding: "4px 10px",
                            color: "#b91c1c",
                            fontWeight: 600,
                            fontSize: 12,
                            cursor: "pointer",
                            fontFamily: "var(--font)",
                          }}
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
      </main>
    </div>
  );
}
