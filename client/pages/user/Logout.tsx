import { useState } from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import "@/styles/globals.css";

export default function Logout() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    setLocation("/");
  }

  return (
    <div className="logout-shell">
      <div className="logout-card">
        {/* ── Brand mark ── */}
        <div className="logout-brand">
          <img
            src="/logo/LK-logo-main.png"
            alt="Laundry King logo"
            style={{ width: 48, height: 48, objectFit: "contain" }}
          />
          <span className="logout-brand__name">Laundry King</span>
        </div>

        {/* ── Logout icon ── */}
        <div className="logout-icon">
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1a3a6b"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        <h1 className="logout-title">Log Out?</h1>
        <p className="logout-sub">
          Are you sure you want to log out of your Laundry King account?
        </p>

        <div className="logout-actions">
          <Link href="/home">
            <button className="btn-back" style={{ flex: 1 }}>
              Stay
            </button>
          </Link>
          <button
            className="btn-primary"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? (
              "Logging out…"
            ) : (
              <>
                Log Out
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
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .logout-shell {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .logout-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 44px 40px;
          max-width: 420px;
          width: 100%;
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
        }
        .logout-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .logout-brand__name {
          font-size: 18px;
          font-weight: 700;
          color: var(--navy);
          letter-spacing: -0.3px;
        }
        .logout-icon {
          width: 88px; height: 88px; border-radius: 50%;
          background: var(--navy-light);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px;
        }
        .logout-title {
          font-size: 28px; font-weight: 700;
          color: var(--text-main); letter-spacing: -0.8px;
        }
        .logout-sub {
          font-size: 14px; color: var(--text-muted); line-height: 1.6;
          max-width: 300px;
        }
        .logout-actions {
          display: flex;
          gap: 12px;
          width: 100%;
          margin-top: 8px;
        }
        .logout-actions button { padding: 12px 24px; }
      `}</style>
    </div>
  );
}
