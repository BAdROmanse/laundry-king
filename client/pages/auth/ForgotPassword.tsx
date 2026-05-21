// client/pages/auth/ForgotPassword.tsx
// Converted from: p4_forgot-password.html
// DO NOT modify: supabase.ts · server/ · .env · vite.config.* · netlify.toml
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/reset-password` },
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
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
          <h1 className="auth-brand__name">Laundry King</h1>
          <p className="auth-brand__tagline">Ang hari ng labada</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap" style={{ textAlign: "center" }}>
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-subtitle">
            Enter your email and we'll send you a link to reset your password.
          </p>

          {sent ? (
            <div
              style={{
                background: "#d1fae5",
                border: "1px solid #6ee7b7",
                color: "#065f46",
                borderRadius: 8,
                padding: "16px",
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              ✓ Reset link sent! Check your email inbox.
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
              <form onSubmit={handleReset}>
                <div
                  className="form-group"
                  style={{ marginBottom: 28, textAlign: "left" }}
                >
                  <label className="form-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    className="form-input"
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={loading}
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

          <p className="auth-footer" style={{ marginTop: 16 }}>
            Remembered it? <Link href="/login">Back to Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
