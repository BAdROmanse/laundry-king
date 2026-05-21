import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { normalizePaymentMethod, normalizePaymentStatus } from "@/lib/payments";
import UserSidebar from "../../components/UserSidebar";
import { TopbarUser } from "./shared";
import "../../styles/globals.css";

interface Order {
  id: string;
  service_type: string;
  pack_type: string;
  delivery_mode: string;
  payment_method: string;
  payment_status: string;
  status: string;
  weight: number | null;
  total_cost: number | null;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const WasherIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="4"
      y="4"
      width="32"
      height="32"
      rx="6"
      stroke="#1a3a6b"
      strokeWidth="2"
    />
    <circle cx="20" cy="22" r="8" stroke="#1a3a6b" strokeWidth="2" />
    <circle cx="20" cy="22" r="3.5" stroke="#1a3a6b" strokeWidth="1.5" />
    <circle cx="11" cy="11" r="1.8" fill="#1a3a6b" />
    <circle cx="16" cy="11" r="1.8" fill="#1a3a6b" />
  </svg>
);

const TshirtIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 8 L8 14 L12 16 L12 32 L28 32 L28 16 L32 14 L26 8 C25 10 21 12 20 12 C19 12 15 10 14 8Z"
      stroke="#1a3a6b"
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

function TransactionSkeleton() {
  return (
    <div className="transaction-item" style={{ opacity: 0.5 }}>
      <div
        className="transaction-item__icon"
        style={{
          background: "#e2e8f4",
          width: 40,
          height: 40,
          borderRadius: "50%",
        }}
      />
      <div className="transaction-item__details">
        <span
          style={{
            display: "block",
            width: 260,
            height: 14,
            background: "#e2e8f4",
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
        <span
          style={{
            display: "block",
            width: 200,
            height: 12,
            background: "#e2e8f4",
            borderRadius: 4,
          }}
        />
      </div>
      <div className="transaction-item__action">
        <span
          style={{
            display: "block",
            width: 140,
            height: 12,
            background: "#e2e8f4",
            borderRadius: 4,
            marginBottom: 8,
          }}
        />
        <span
          style={{
            display: "block",
            width: 110,
            height: 32,
            background: "#e2e8f4",
            borderRadius: 8,
          }}
        />
      </div>
    </div>
  );
}

export default function Transaction() {
  const [history, setHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, service_type, pack_type, delivery_mode, payment_method, payment_status, status, weight, total_cost, created_at",
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setHistory((data ?? []) as Order[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="lk-shell">
      <UserSidebar />
      <main className="main">
        <TopbarUser />

        <section className="section">
          <h1 className="page-header__title" style={{ marginBottom: 24 }}>
            Transaction History
          </h1>

          {error && (
            <div
              style={{
                color: "#721c24",
                background: "#f8d7da",
                borderRadius: 8,
                padding: "10px 16px",
                marginBottom: 12,
                fontSize: 13,
              }}
            >
              Could not load history: {error}
            </div>
          )}

          <div className="transactions">
            {loading ? (
              <>
                <TransactionSkeleton />
                <TransactionSkeleton />
                <TransactionSkeleton />
              </>
            ) : history.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "var(--text-muted)",
                  fontSize: 14,
                }}
              >
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                  No transactions yet
                </p>
                <p>Your completed orders will appear here.</p>
              </div>
            ) : (
              history.map((order) => {
                const isDryFold = order.service_type === "Dry and Fold";
                return (
                  <div key={order.id} className="transaction-item">
                    <div className="transaction-item__icon">
                      {isDryFold ? <TshirtIcon /> : <WasherIcon />}
                    </div>
                    <div className="transaction-item__details">
                      <span className="transaction-item__name">
                        {`#${order.id.slice(0, 8).toUpperCase()} - ${order.service_type} - ${order.pack_type}`}
                      </span>
                      <span className="transaction-item__date">
                        {formatDate(order.created_at)}
                      </span>
                      <span className="transaction-item__date">
                        Payment Method:{" "}
                        {normalizePaymentMethod(order.payment_method) || "-"}
                      </span>
                    </div>
                    <div className="transaction-item__action">
                      <span className="transaction-item__meta">
                        {order.weight ? `${order.weight} kg | ` : ""}
                        <span className="status-badge">{order.status}</span>
                      </span>
                      <span className="transaction-item__meta">
                        Payment:{" "}
                        {normalizePaymentStatus(order.payment_status) ===
                        "Paid" ? (
                          <span className="paid-badge">Paid</span>
                        ) : (
                          <span className="status-badge">Unpaid</span>
                        )}
                      </span>
                      <span className="transaction-item__meta">
                        Total:{" "}
                        <strong>
                          ₱{order.total_cost?.toLocaleString() ?? "—"}
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
