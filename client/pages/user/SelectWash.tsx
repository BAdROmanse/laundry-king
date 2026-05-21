// client/pages/user/SelectWash.tsx
// U3.1 — Step 2: Select Pack Type + Addons
// Converted from: u3.1_select-wash.html

import { Link } from "wouter";
import { useBooking } from "@/context/BookingContext";
import UserSidebar from "@/components/UserSidebar";

export default function SelectWash() {
  const { booking, setBooking } = useBooking();

  function selectPack(pack: "Pack 1" | "Pack 2" | "Pack 3") {
    setBooking((prev) => ({ ...prev, packType: pack }));
  }

  function toggleAddon(addon: string) {
    setBooking((prev) => ({
      ...prev,
      addons: prev.addons.includes(addon)
        ? prev.addons.filter((a) => a !== addon)
        : [...prev.addons, addon],
    }));
  }

  return (
    <div style={{ display: "flex" }}>
      <UserSidebar />
      <main className="main">
        {/* ── Select Pack ── */}
        <section className="section">
          <h2 className="section__title">Select what type to wash</h2>
          <div className="pack-grid">
            {/* Pack 1 */}
            <div
              className={`pack-card${booking.packType === "Pack 1" ? " selected" : ""}`}
              onClick={() => selectPack("Pack 1")}
            >
              <div className="pack-card__icon">
                <svg width="64" height="64" viewBox="0 0 72 72" fill="none">
                  <path
                    d="M24 14 L14 24 L22 28 L22 46 L50 46 L50 28 L58 24 L48 14 C47 17 43 20 36 20 C29 20 25 17 24 14Z"
                    stroke="#1a3a6b"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <line
                    x1="12"
                    y1="12"
                    x2="12"
                    y2="18"
                    stroke="#1a3a6b"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <line
                    x1="9"
                    y1="15"
                    x2="15"
                    y2="15"
                    stroke="#1a3a6b"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <rect
                    x="22"
                    y="49"
                    width="28"
                    height="4"
                    rx="2"
                    stroke="#1a3a6b"
                    strokeWidth="1.8"
                    fill="none"
                  />
                  <rect
                    x="23"
                    y="54"
                    width="26"
                    height="4"
                    rx="2"
                    stroke="#1a3a6b"
                    strokeWidth="1.8"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="pack-card__info">
                <h3>Pack 1</h3>
                <p>Regular clothes</p>
              </div>
            </div>

            {/* Pack 2 */}
            <div
              className={`pack-card${booking.packType === "Pack 2" ? " selected" : ""}`}
              onClick={() => selectPack("Pack 2")}
            >
              <div className="pack-card__icon">
                <svg width="64" height="64" viewBox="0 0 72 72" fill="none">
                  <path
                    d="M20 12 L12 20 L18 23 L18 36 L32 36 L32 23 L38 20 L30 12 C29 14 26 16 25 16 C24 16 21 14 20 12Z"
                    stroke="#1a3a6b"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <circle cx="23" cy="38" r="1.2" fill="#1a3a6b" />
                  <circle cx="27" cy="38" r="1.2" fill="#1a3a6b" />
                  <path
                    d="M38 28 L38 52 L46 52 L46 40 L50 40 L50 52 L58 52 L58 28 Z"
                    stroke="#1a3a6b"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <line
                    x1="38"
                    y1="32"
                    x2="58"
                    y2="32"
                    stroke="#1a3a6b"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="pack-card__info">
                <h3>Pack 2</h3>
                <p>
                  Maong, Blankets, Towels, All white clothes, &amp; baby clothes
                </p>
              </div>
            </div>

            {/* Pack 3 */}
            <div
              className={`pack-card${booking.packType === "Pack 3" ? " selected" : ""}`}
              onClick={() => selectPack("Pack 3")}
            >
              <div className="pack-card__icon">
                <svg width="64" height="64" viewBox="0 0 72 72" fill="none">
                  <rect
                    x="14"
                    y="12"
                    width="44"
                    height="10"
                    rx="2"
                    stroke="#1a3a6b"
                    strokeWidth="2"
                    fill="none"
                  />
                  <line
                    x1="20"
                    y1="15"
                    x2="52"
                    y2="15"
                    stroke="#1a3a6b"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="20"
                    y1="18"
                    x2="52"
                    y2="18"
                    stroke="#1a3a6b"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <rect
                    x="14"
                    y="24"
                    width="44"
                    height="10"
                    rx="2"
                    stroke="#1a3a6b"
                    strokeWidth="2"
                    fill="none"
                  />
                  <line
                    x1="20"
                    y1="27"
                    x2="52"
                    y2="27"
                    stroke="#1a3a6b"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="20"
                    y1="30"
                    x2="52"
                    y2="30"
                    stroke="#1a3a6b"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <rect
                    x="14"
                    y="36"
                    width="44"
                    height="10"
                    rx="2"
                    stroke="#1a3a6b"
                    strokeWidth="2"
                    fill="none"
                  />
                  <line
                    x1="20"
                    y1="39"
                    x2="52"
                    y2="39"
                    stroke="#1a3a6b"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="20"
                    y1="42"
                    x2="52"
                    y2="42"
                    stroke="#1a3a6b"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="pack-card__info">
                <h3>Pack 3</h3>
                <p>Comforter, Seat cover, Curtains, Fleece blankets</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Addons (Optional) ── */}
        <section className="section">
          <h2 className="section__title">
            Additional <span className="optional">(Optional)</span>
          </h2>
          <div className="addon-grid">
            {/* Fabric Conditioned */}
            <div
              className={`addon-card${booking.addons.includes("Fabric Conditioned") ? " selected" : ""}`}
              onClick={() => toggleAddon("Fabric Conditioned")}
            >
              <div className="addon-card__icon">
                <svg width="60" height="60" viewBox="0 0 72 72" fill="none">
                  <line
                    x1="10"
                    y1="20"
                    x2="10"
                    y2="30"
                    stroke="#1a3a6b"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <line
                    x1="5"
                    y1="25"
                    x2="15"
                    y2="25"
                    stroke="#1a3a6b"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <line
                    x1="7"
                    y1="22"
                    x2="13"
                    y2="28"
                    stroke="#1a3a6b"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <line
                    x1="13"
                    y1="22"
                    x2="7"
                    y2="28"
                    stroke="#1a3a6b"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M22 34 L24 58 L48 58 L50 34 Z"
                    stroke="#1a3a6b"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <path
                    d="M26 34 C26 26 46 26 46 34"
                    stroke="#1a3a6b"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <line
                    x1="36"
                    y1="38"
                    x2="36"
                    y2="57"
                    stroke="#1a3a6b"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <line
                    x1="23"
                    y1="44"
                    x2="49"
                    y2="44"
                    stroke="#1a3a6b"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <line
                    x1="23"
                    y1="50"
                    x2="49"
                    y2="50"
                    stroke="#1a3a6b"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="addon-card__info">
                <h3>Fabric Conditioned</h3>
                <p className="addon-card__price">+₱30.00</p>
              </div>
            </div>

            {/* Stain Removal */}
            <div
              className={`addon-card${booking.addons.includes("Stain Removal") ? " selected" : ""}`}
              onClick={() => toggleAddon("Stain Removal")}
            >
              <div className="addon-card__icon">
                <svg width="60" height="60" viewBox="0 0 72 72" fill="none">
                  <path
                    d="M22 12 L12 22 L20 26 L20 56 L52 56 L52 26 L60 22 L50 12 C49 15 44 18 36 18 C28 18 23 15 22 12Z"
                    stroke="#1a3a6b"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <circle
                    cx="36"
                    cy="38"
                    r="7"
                    stroke="#1a3a6b"
                    strokeWidth="1.8"
                    fill="none"
                  />
                  <circle
                    cx="30"
                    cy="34"
                    r="3.5"
                    stroke="#1a3a6b"
                    strokeWidth="1.6"
                    fill="none"
                  />
                  <circle
                    cx="42"
                    cy="34"
                    r="2.5"
                    stroke="#1a3a6b"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="addon-card__info">
                <h3>Stain Removal</h3>
                <p className="addon-card__price">+₱5.00</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom actions ── */}
        <div className="bottom-actions">
          <Link href="/offered-services">
            <button className="btn-back">
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
          </Link>
          <Link href="/offered-services/pickup-delivery">
            <button
              className="btn-next"
              disabled={!booking.packType}
              style={{
                opacity: booking.packType ? 1 : 0.5,
                cursor: booking.packType ? "pointer" : "not-allowed",
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
