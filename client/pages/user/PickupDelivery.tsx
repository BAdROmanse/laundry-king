// client/pages/user/PickupDelivery.tsx
// U3.2 — Step 3: Pickup/Delivery + Payment Method → creates order in Supabase
// Converted from: u3.2_pickup-delivery.html

import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useBooking } from "@/context/BookingContext";
import UserSidebar from "@/components/UserSidebar";
import { useAuth } from "@/hooks/useAuth";
import type { PaymentMethod } from "@/lib/payments";

export default function PickupDelivery() {
  const { booking, setBooking, resetBooking, calcTotal } = useBooking();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function selectDelivery(mode: "Delivery" | "Pick up") {
    setBooking((prev) => ({ ...prev, deliveryMode: mode }));
  }

  function selectPayment(method: PaymentMethod) {
    setBooking((prev) => ({ ...prev, paymentMethod: method }));
  }

  /* ── Submit order to Supabase ── */
  async function handleFinish() {
    if (!booking.deliveryMode) {
      setError("Please select a delivery mode.");
      return;
    }
    if (!booking.paymentMethod) {
      setError("Please select a payment method.");
      return;
    }
    if (!user) {
      setError("You must be logged in.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const total = calcTotal();

      /* 1. Insert into orders table */
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          service_type: booking.serviceType,
          pack_type: booking.packType,
          delivery_mode: booking.deliveryMode,
          payment_method: booking.paymentMethod,
          payment_status: "Unpaid",
          status: "Washing",
          weight: booking.weight,
          total_cost: total,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      /* 2. Insert into transactions table */
      const { error: txError } = await supabase.from("transactions").insert({
        order_id: order.id,
        user_id: user.id,
        amount: total,
      });

      if (txError) throw txError;
      /* 3. If GCash, show QR code. Status stays Unpaid until staff updates it. */
      if (booking.paymentMethod === "GCash") {
        setShowQR(true);
      } else {
        resetBooking();
        navigate("/laundry-status");
      }
    } catch (err: unknown) {
      const msg = (err as any)?.message ?? JSON.stringify(err);
      console.error("Full error:", JSON.stringify(err, null, 2));
      setError(msg);
      console.error("Order creation error:", err);
    } finally {
      setLoading(false);
    }
  }

  const total = calcTotal();

  return (
    <div style={{ display: "flex" }}>
      <UserSidebar />
      <main className="main">
        {/* ── Address Card ── */}
        <div className="address-card">
          <div className="address-card__left">
            <div className="address-card__label">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a3a6b"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Your address</span>
            </div>
            <p className="address-card__text">
              {booking.address || "8FHJ+24C, National Hwy, Kalayaan, Laguna"}
            </p>
          </div>
          <button className="address-card__arrow" aria-label="Edit address">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1a3a6b"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {/* ── Pick up & Delivery ── */}
        <section className="section">
          <h2 className="section__title">Pick up &amp; Delivery</h2>
          <div className="option-grid">
            <div
              className={`option-card${booking.deliveryMode === "Delivery" ? " selected" : ""}`}
              onClick={() => selectDelivery("Delivery")}
            >
              <div className="option-card__icon">
                <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
                  <circle
                    cx="44"
                    cy="10"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M10 44 L22 34 L34 34 L40 26 L52 26 L54 34 L56 44"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <circle
                    cx="15"
                    cy="49"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    fill="none"
                  />
                  <circle
                    cx="51"
                    cy="49"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    fill="none"
                  />
                  <rect
                    x="20"
                    y="26"
                    width="12"
                    height="9"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="option-card__info">
                <span className="option-card__name">Delivery</span>
                <span className="option-card__sub">+₱20.00</span>
              </div>
            </div>

            <div
              className={`option-card${booking.deliveryMode === "Pick up" ? " selected" : ""}`}
              onClick={() => selectDelivery("Pick up")}
            >
              <div className="option-card__icon">
                <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
                  <rect
                    x="16"
                    y="24"
                    width="32"
                    height="30"
                    rx="4"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    fill="none"
                  />
                  <path
                    d="M24 24 C24 16 40 16 40 24"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <polyline
                    points="26,16 32,10 38,16"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="32"
                    y1="10"
                    x2="32"
                    y2="20"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="option-card__info">
                <span className="option-card__name">Pick up</span>
                <span className="option-card__sub">No additional fee</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Payment Methods ── */}
        <section className="section">
          <h2 className="section__title">Payment Methods</h2>
          <div className="option-grid">
            <div
              className={`option-card${booking.paymentMethod === "GCash" ? " selected" : ""}`}
              onClick={() => selectPayment("GCash")}
            >
              <div className="option-card__icon">
                <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
                  <rect
                    x="16"
                    y="8"
                    width="28"
                    height="46"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    fill="none"
                  />
                  <rect
                    x="20"
                    y="14"
                    width="20"
                    height="28"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    fill="none"
                  />
                  <polyline
                    points="24,28 29,33 38,22"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="30" cy="48" r="2" fill="currentColor" />
                </svg>
              </div>
              <div className="option-card__info">
                <span className="option-card__name">GCash</span>
                <span className="option-card__sub">Pay with QR code</span>
              </div>
            </div>

            <div
              className={`option-card${booking.paymentMethod === "Cash on Delivery" ? " selected" : ""}`}
              onClick={() => selectPayment("Cash on Delivery")}
            >
              <div className="option-card__icon">
                <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
                  <rect
                    x="8"
                    y="22"
                    width="48"
                    height="32"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    fill="none"
                  />
                  <line
                    x1="8"
                    y1="32"
                    x2="56"
                    y2="32"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <rect
                    x="38"
                    y="36"
                    width="14"
                    height="10"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="option-card__info">
                <span className="option-card__name">
                  Cash on Delivery
                </span>
                <span className="option-card__sub">Pay Cash</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Order Summary ── */}
        <section className="section">
          <div className="dashboard-card" style={{ maxWidth: 480 }}>
            <div className="dashboard-card__title" style={{ marginBottom: 12 }}>
              Order Summary
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                fontSize: 13,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Service:</span>
                <span style={{ fontWeight: 600 }}>
                  {booking.serviceType || "—"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Pack:</span>
                <span style={{ fontWeight: 600 }}>
                  {booking.packType || "—"}
                </span>
              </div>
              {booking.isRushed && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "var(--text-muted)" }}>Rushed:</span>
                  <span style={{ fontWeight: 600 }}>+₱20</span>
                </div>
              )}
              {booking.addons.map((a) => (
                <div
                  key={a}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "var(--text-muted)" }}>{a}:</span>
                  <span style={{ fontWeight: 600 }}>
                    +₱{a === "Fabric Conditioned" ? 30 : 5}
                  </span>
                </div>
              ))}
              {booking.deliveryMode === "Delivery" && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "var(--text-muted)" }}>
                    Delivery fee:
                  </span>
                  <span style={{ fontWeight: 600 }}>+₱20</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid var(--border)",
                  paddingTop: 10,
                  marginTop: 4,
                }}
              >
                <span style={{ fontWeight: 700, color: "var(--navy)" }}>
                  Total:
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    color: "var(--navy)",
                    fontSize: 16,
                  }}
                >
                  ₱{total}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div
            style={{
              color: "#b91c1c",
              background: "#fff0f0",
              border: "1px solid #fca5a5",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              marginBottom: 80,
              maxWidth: 480,
            }}
          >
            {error}
          </div>
        )}

        {/* ── Bottom actions ── */}
        <div className="bottom-actions">
          <button className="btn-back" onClick={() => window.history.back()}>
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
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>
          <button
            className="btn-next"
            onClick={handleFinish}
            disabled={
              loading || !booking.deliveryMode || !booking.paymentMethod
            }
            style={{
              opacity:
                loading || !booking.deliveryMode || !booking.paymentMethod
                  ? 0.6
                  : 1,
            }}
          >
            {loading ? "Placing order…" : "Finish"}
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
        </div>

        {/* GCash QR Modal */}
        {showQR && (
          <div
            onClick={() => {
              setShowQR(false);
              resetBooking();
              navigate("/laundry-status");
            }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10,20,50,0.55)",
              backdropFilter: "blur(4px)",
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--white)",
                borderRadius: 20,
                padding: "36px 32px 28px",
                maxWidth: 380,
                width: "100%",
                boxShadow: "0 20px 60px rgba(10,20,60,0.22)",
                textAlign: "center",
              }}
            >
              {/* GCash header */}
              <div style={{ marginBottom: 8 }}>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    marginBottom: 4,
                  }}
                >
                  Scan to pay via
                </p>
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#007DC5",
                    letterSpacing: -0.5,
                  }}
                >
                  GCash
                </h2>
              </div>

              {/* QR Code */}
              <div
                style={{
                  margin: "20px auto",
                  width: 220,
                  height: 220,
                  border: "2px solid var(--border)",
                  borderRadius: 12,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/images/gcash-qr.png"
                  alt="GCash QR Code"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Amount */}
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginBottom: 4,
                }}
              >
                Total Amount
              </p>
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "var(--navy)",
                  marginBottom: 20,
                  letterSpacing: -1,
                }}
              >
                ₱{calcTotal()}
              </p>

              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginBottom: 24,
                  lineHeight: 1.6,
                }}
              >
                Scan the QR code with your GCash app to complete payment.
                Staff will verify and mark the order as paid.
              </p>

              {/* Done button */}
              <button
                className="auth-btn-primary"
                onClick={() => {
                  setShowQR(false);
                  resetBooking();
                  navigate("/laundry-status");
                }}
                disabled={loading}
              >
                Done
              </button>

              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 12,
                }}
              >
                Tap outside to dismiss
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
