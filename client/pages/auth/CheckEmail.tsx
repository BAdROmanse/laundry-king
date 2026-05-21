// client/pages/auth/CheckEmail.tsx
// Converted from: p5_confirmation.html
// Shown after: signup (email verify) + forgot-password (reset link sent)
// DO NOT modify: supabase.ts · server/ · .env · vite.config.* · netlify.toml
import { Link, useSearch } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

// ── Shared left-panel SVGs ────────────────────────────────────────────────────
const LogoMark = () => (
  <img
    src="/logo/LK-logo-white.png"
    alt="Laundry King logo"
    style={{ width: 65, height: 65, objectFit: "contain" }}
  />
);

const CrownSvg = () => (
  <img
    src="/landing page icons/crown1.png"
    alt="crown"
    style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0 }}
  />
);

// ── Envelope icon (matches p5 HTML exactly) ───────────────────────────────────
const EnvelopeIcon = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="8"
      y="22"
      width="84"
      height="60"
      rx="12"
      stroke="#1a3a6b"
      strokeWidth="6"
    />
    <path
      d="M8 34 L50 58 L92 34"
      stroke="#1a3a6b"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function CheckEmail() {
  // Optional: read ?type=reset vs ?type=verify from query string
  const search = useSearch();
  const params = new URLSearchParams(search);
  const type = params.get("type"); // 'reset' | 'verify' | null
  const isReset = type === "reset";
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const linkError = useMemo(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return (
      params.get("error_description") ??
      hashParams.get("error_description") ??
      params.get("error") ??
      hashParams.get("error")
    );
  }, [search]);

  useEffect(() => {
    setEmail(localStorage.getItem("pendingVerificationEmail") ?? "");
    if (linkError) {
      setError(
        "Verification link is invalid or expired. Request a new confirmation email.",
      );
    } else if (params.get("reason") === "unverified") {
      setError("Please verify your email before continuing.");
    }
  }, [linkError, search]);

  async function resendVerification() {
    const nextEmail = email.trim().toLowerCase();
    if (!nextEmail) {
      setError("Enter your email address to resend the confirmation email.");
      return;
    }

    setSending(true);
    setError("");
    setMessage("");
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: nextEmail,
      options: { emailRedirectTo: `${window.location.origin}/login?verified=1` },
    });
    setSending(false);

    if (resendError) {
      setError(resendError.message);
      return;
    }

    localStorage.setItem("pendingVerificationEmail", nextEmail);
    setMessage("Confirmation email sent. Check your inbox.");
  }

  const heading = isReset ? "Check your Email" : "Check your Email";
  const subtitle = isReset
    ? "We sent a password reset link to your email. Please check your inbox."
    : "We sent a confirmation link to your email. Please verify to activate your account.";

  return (
    <div className="auth-layout">
      {/* ── LEFT ── */}
      <div className="auth-left">
        <Link href="/" className="auth-logo">
          <LogoMark />
          Laundry King
        </Link>

        <div className="auth-brand">
          <p className="auth-brand__welcome">Welcome to</p>
          <h1 className="auth-brand__name">
            Laundry King
            <CrownSvg />
          </h1>
          <p className="auth-brand__tagline">Ang hari ng labada</p>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="auth-right">
        <div className="auth-form-wrap" style={{ textAlign: "center" }}>
          <h2 className="auth-title">{heading}</h2>
          <p className="auth-subtitle">{subtitle}</p>

          {error && <div className="auth-alert auth-alert--error">{error}</div>}
          {message && (
            <div className="auth-alert auth-alert--success">{message}</div>
          )}

          {/* Envelope icon */}
          <div className="auth-icon">
            <EnvelopeIcon />
          </div>

          {!isReset && (
            <div style={{ marginBottom: 16 }}>
              <input
                className="form-input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginBottom: 12, textAlign: "center" }}
              />
              <button
                className="auth-btn-primary"
                type="button"
                disabled={sending}
                onClick={resendVerification}
              >
                {sending ? "Sending..." : "Resend Verification Email"}
              </button>
            </div>
          )}

          <Link href="/login">
            <button className="auth-btn-primary" type="button">
              Back to Log In
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
