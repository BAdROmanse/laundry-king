// client/pages/user/OfferedServices.tsx
// U3 — Step 1: Select Service + Service Type
// Converted from: u3_offered-services.html

import { Link } from "wouter";
import { useBooking } from "@/context/BookingContext";
import UserSidebar from "@/components/UserSidebar";
import { useAuth } from "@/hooks/useAuth";

export default function OfferedServices() {
  const { booking, setBooking } = useBooking();
  const { user } = useAuth();

  function selectService(type: "Full Service" | "Dry and Fold") {
    setBooking((prev) => ({ ...prev, serviceType: type }));
  }

  function toggleRushed() {
    setBooking((prev) => ({ ...prev, isRushed: !prev.isRushed }));
  }

  return (
    <div style={{ display: "flex" }}>
      <UserSidebar />
      <main className="main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar__user">
            <div className="topbar__avatar">
              {user?.user_metadata?.full_name?.slice(0, 2).toUpperCase() ??
                "LV"}
            </div>
            <div className="topbar__info">
              <span className="topbar__name">
                {user?.user_metadata?.full_name ?? "User"}
              </span>
              <span className="topbar__email">{user?.email ?? ""}</span>
            </div>
          </div>
        </header>

        {/* ── Select Service ── */}
        <section className="section">
          <h2 className="section__title">Select Service</h2>
          <div className="service-grid">
            {/* Full Service */}
            <div
              className={`service-card${booking.serviceType === "Full Service" ? " selected" : ""}`}
              onClick={() => selectService("Full Service")}
            >
              <div className="service-card__icon">
                <svg width="52" height="52" viewBox="0 0 56 56" fill="none">
                  <rect
                    x="6"
                    y="6"
                    width="44"
                    height="44"
                    rx="8"
                    stroke="#1a3a6b"
                    strokeWidth="2.2"
                  />
                  <circle
                    cx="28"
                    cy="32"
                    r="11"
                    stroke="#1a3a6b"
                    strokeWidth="2.2"
                  />
                  <circle
                    cx="28"
                    cy="32"
                    r="4.5"
                    stroke="#1a3a6b"
                    strokeWidth="2"
                  />
                  <circle cx="15" cy="15" r="2.2" fill="#1a3a6b" />
                  <circle cx="22" cy="15" r="2.2" fill="#1a3a6b" />
                </svg>
              </div>
              <div className="service-card__info">
                <h3>Full service</h3>
                <p className="service-card__price">₱30/kg</p>
                <p className="service-card__desc">
                  Includes wash, dry, and fold
                </p>
              </div>
            </div>

            {/* Dry and Fold */}
            <div
              className={`service-card${booking.serviceType === "Dry and Fold" ? " selected" : ""}`}
              onClick={() => selectService("Dry and Fold")}
            >
              <div className="service-card__icon">
                <svg width="52" height="52" viewBox="0 0 56 56" fill="none">
                  <path
                    d="M20 10 L12 18 L18 21 L18 34 L38 34 L38 21 L44 18 L36 10 C35 13 31 15 28 15 C25 15 21 13 20 10Z"
                    stroke="#1a3a6b"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <rect
                    x="18"
                    y="36"
                    width="20"
                    height="3"
                    rx="1.5"
                    stroke="#1a3a6b"
                    strokeWidth="1.8"
                    fill="none"
                  />
                  <rect
                    x="19"
                    y="40"
                    width="18"
                    height="3"
                    rx="1.5"
                    stroke="#1a3a6b"
                    strokeWidth="1.8"
                    fill="none"
                  />
                  <rect
                    x="20"
                    y="44"
                    width="16"
                    height="3"
                    rx="1.5"
                    stroke="#1a3a6b"
                    strokeWidth="1.8"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="service-card__info">
                <h3>Dry and Fold</h3>
                <p className="service-card__price">₱20/1kg</p>
                <p className="service-card__desc">Includes dry and fold.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Service Type (Optional) ── */}
        <section className="section">
          <h2 className="section__title">
            Service Type <span className="optional">(Optional)</span>
          </h2>
          <div className="type-grid">
            <div
              className={`service-card${booking.isRushed ? " selected" : ""}`}
              onClick={toggleRushed}
            >
              <div className="service-card__icon">
                <svg width="52" height="52" viewBox="0 0 56 56" fill="none">
                  <line
                    x1="8"
                    y1="22"
                    x2="18"
                    y2="22"
                    stroke="#1a3a6b"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="6"
                    y1="29"
                    x2="16"
                    y2="29"
                    stroke="#1a3a6b"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="8"
                    y1="36"
                    x2="18"
                    y2="36"
                    stroke="#1a3a6b"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="34"
                    cy="29"
                    r="14"
                    stroke="#1a3a6b"
                    strokeWidth="2.2"
                  />
                  <polyline
                    points="34,21 34,29 40,29"
                    stroke="#1a3a6b"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="service-card__info">
                <h3>Rushed</h3>
                <p className="service-card__price">+₱20.00</p>
                <p className="service-card__desc">
                  Your clothes are our priority
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom actions ── */}
        <div className="bottom-actions">
          <Link href="/offered-services/wash-type">
            <button
              className="btn-next"
              disabled={!booking.serviceType}
              style={{
                opacity: booking.serviceType ? 1 : 0.5,
                cursor: booking.serviceType ? "pointer" : "not-allowed",
              }}
            >
              Next
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
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
