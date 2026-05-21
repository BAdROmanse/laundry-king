import { useState } from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

const CrownSvg = () => (
  <img
    src="/landing page icons/crown1.png"
    alt="crown"
    style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0 }}
  />
);

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
    setTimeout(() => navigate("/login"), 2500);
  }

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <Link href="/" className="auth-logo">
          <img
            src="/logo/LK-logo-white.png"
            alt="Laundry King logo"
            style={{ width: 65, height: 65, objectFit: "contain" }}
          />
          Laundry King
        </Link>
        <div className="auth-brand">
          <p className="auth-brand__welcome">Welcome to</p>
          <h1 className="auth-brand__name">
            Laundry King <CrownSvg />
          </h1>
          <p className="auth-brand__tagline">Ang hari ng labada</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <h2 className="auth-title" style={{ textAlign: "center" }}>
            Set New Password
          </h2>
          <p className="auth-subtitle" style={{ textAlign: "center" }}>
            Choose a strong password for your account.
          </p>

          {done ? (
            <div
              style={{
                background: "#d1fae5",
                border: "1px solid #6ee7b7",
                color: "#065f46",
                borderRadius: 8,
                padding: "16px",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              ✓ Password updated! Redirecting to login…
            </div>
          ) : (
            <>
              {error && (
                <div
                  style={{
                    background: "#fff0f0",
                    border: "1px solid #fca5a5",
                    color: "#b91c1c",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    marginBottom: 20,
                  }}
                >
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    New Password
                  </label>
                  <input
                    className="form-input"
                    type="password"
                    id="password"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 28 }}>
                  <label className="form-label" htmlFor="confirm">
                    Confirm Password
                  </label>
                  <input
                    className="form-input"
                    type="password"
                    id="confirm"
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={loading}
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
