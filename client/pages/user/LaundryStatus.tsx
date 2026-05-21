// client/pages/user/LaundryStatus.tsx
// FIXED:
// - removed reference_no, delivery_type, amount, estimated_completion
// - changed delivery_type → delivery_mode
// - changed amount → total_cost
// - fixed STATUS_MAP to use capitalized values matching DB
// - added error state

import { useEffect, useState, JSX } from "react";
import React from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { formatPHDateTime } from "@/lib/date";
import { normalizePaymentMethod, normalizePaymentStatus } from "@/lib/payments";
import UserSidebar from "@/components/UserSidebar";

type StepName = "Washing" | "Drying" | "Folding" | "For Delivery";
const STEPS: StepName[] = ["Washing", "Drying", "Folding", "For Delivery"];

const stepIcons: Record<StepName, JSX.Element> = {
  Washing: (
    <svg width="40" height="40" viewBox="0 0 56 56" fill="none">
      <rect
        x="6"
        y="6"
        width="44"
        height="44"
        rx="8"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <circle cx="28" cy="32" r="11" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="28" cy="32" r="4.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="15" cy="15" r="2.2" fill="currentColor" />
      <circle cx="22" cy="15" r="2.2" fill="currentColor" />
    </svg>
  ),
  Drying: (
    <svg width="40" height="40" viewBox="0 0 56 56" fill="none">
      <line
        x1="4"
        y1="14"
        x2="52"
        y2="14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M28 14 C28 10 32 8 28 5 C24 8 28 10 28 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M18 14 L12 22 L18 25 L18 44 L38 44 L38 25 L44 22 L38 14 C37 17 33 19 28 19 C23 19 19 17 18 14Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="23"
        y1="46"
        x2="23"
        y2="50"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="28"
        y1="46"
        x2="28"
        y2="51"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="33"
        y1="46"
        x2="33"
        y2="50"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  Folding: (
    <svg width="40" height="40" viewBox="0 0 56 56" fill="none">
      {[10, 21, 32].map((y) => (
        <g key={y}>
          <rect
            x="8"
            y={y}
            width="40"
            height="9"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <line
            x1="14"
            y1={y + 3}
            x2="42"
            y2={y + 3}
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <line
            x1="14"
            y1={y + 6}
            x2="42"
            y2={y + 6}
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  ),
  "For Delivery": (
    <svg width="40" height="40" viewBox="0 0 56 56" fill="none">
      <circle
        cx="36"
        cy="12"
        r="5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M10 36 L20 28 L30 28 L36 20 L44 20 L46 28 L48 36"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle
        cx="14"
        cy="40"
        r="6"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
      />
      <circle
        cx="44"
        cy="40"
        r="6"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
      />
      <rect
        x="18"
        y="22"
        width="10"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
    </svg>
  ),
};

interface ActiveOrder {
  id: string;
  service_type: string;
  pack_type: string | null;
  delivery_mode: string; // ← was delivery_type
  status: string;
  total_cost: number | null; // ← was amount
  payment_method: string | null;
  payment_status: string | null;
  created_at: string;
}

export default function LaundryStatus() {
  const [order, setOrder] = useState<ActiveOrder | null>(null);
  const [customerName, setCustomerName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }
    setCustomerName(
      session.user.user_metadata?.full_name ??
        session.user.email?.split("@")[0] ??
        "User",
    );

    // ── FIXED: removed reference_no, delivery_type, amount, estimated_completion
    // ── FIXED: status values now match DB ("Washing" not "washing")
    const { data, error: fetchError } = await supabase
      .from("orders")
      .select(
        "id, service_type, pack_type, delivery_mode, status, total_cost, payment_method, payment_status, created_at",
      )
      .eq("user_id", session.user.id)
      .in("status", ["Washing", "Drying", "Folding", "For Delivery"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(); // ← use maybeSingle so no error when empty

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setOrder(data ?? null);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // ── FIXED: status values now capitalized to match DB
  const activeStep = (order?.status ?? "Washing") as StepName;

  const orderDetails = order
    ? [
        { label: "Order No:", value: `#${order.id.slice(0, 8).toUpperCase()}` },
        { label: "Customer Name:", value: customerName },
        { label: "Service Type:", value: order.service_type },
        { label: "Clothes:", value: order.pack_type ?? "—" },
        { label: "Delivery Mode:", value: order.delivery_mode },
        { label: "Date Ordered:", value: formatPHDateTime(order.created_at) },
        {
          label: "Order Status:",
          value: <span className="status-badge">In Progress</span>,
        },
        {
          label: "Total Cost:",
          value: order.total_cost
            ? `₱${order.total_cost.toLocaleString()}`
            : "—",
        },
        {
          label: "Payment Method:",
          value: normalizePaymentMethod(order.payment_method) || "—",
        },
        {
          label: "Payment Status:",
          value:
            normalizePaymentStatus(order.payment_status) === "Paid" ? (
              <span className="paid-badge">Paid</span>
            ) : (
              <span className="status-badge">Unpaid</span>
            ),
        },
      ]
    : [];

  return (
    <div className="lk-shell">
      <UserSidebar />
      <main className="main">
        <section className="section">
          <h2 className="section__title">Order Status</h2>

          {/* Loading */}
          {loading && (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading…</p>
          )}

          {/* Error */}
          {!loading && error && (
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
              }}
            >
              <span>⚠️ {error}</span>
              <button
                className="btn-back"
                style={{ padding: "6px 14px", fontSize: 12 }}
                onClick={load}
              >
                ↻ Retry
              </button>
            </div>
          )}

          {/* No active order */}
          {!loading && !error && !order && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
                No active orders right now.
              </p>
              <Link href="/offered-services">
                <a className="btn-next">Book a Service</a>
              </Link>
            </div>
          )}

          {/* Order found */}
          {!loading && !error && order && (
            <>
              {/* Status Tracker */}
              <div className="status-tracker">
                {STEPS.map((step, i) => (
                  <React.Fragment key={step}>
                    <div
                      className={`step${step === activeStep ? " active" : ""}`}
                    >
                      <div className="step__circle">{stepIcons[step]}</div>
                      <span className="step__label">{step}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="step__connector" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Order Details */}
              <section className="section">
                <h2 className="section__title">Order Details</h2>
                <div className="order-card">
                  <h3 className="order-card__number">
                    Order No: #{order.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <div className="order-details">
                    {orderDetails.map((row, i) => (
                      <div key={i} className="detail-row">
                        <span className="detail-row__key">{row.label}</span>
                        <span className="detail-row__val">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </section>

        <div className="bottom-actions">
          <Link href="/home">
            <button className="btn-primary">
              Done
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
