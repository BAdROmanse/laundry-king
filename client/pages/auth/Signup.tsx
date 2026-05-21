import { useState } from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function Signup() {
  const [, navigate] = useLocation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/login?verified=1`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("users").upsert({
        id: data.user.id,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        username: email.split("@")[0],
        role: "customer",
      });
    }

    localStorage.setItem("pendingVerificationEmail", email.trim().toLowerCase());
    navigate("/check-email?type=verify");
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60fr 40fr",
        minHeight: "100vh",
      }}
    >
      {/* ── LEFT ── */}
      <div
        style={{
          position: "relative",
          background:
            "url('https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1200&q=80') center center / cover no-repeat",
          display: "flex",
          flexDirection: "column",
          padding: "32px 40px",
          overflow: "hidden",
        }}
      >
        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10, 18, 40, 0.62)",
            zIndex: 0,
          }}
        />

        {/* Top-left logo */}
        <Link
          href="/"
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <img
            src="/logo/LK-logo-white.png"
            alt="Laundry King"
            style={{ width: 48, height: 48, objectFit: "contain" }}
          />
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.3px",
            }}
          >
            Laundry King
          </span>
        </Link>

        {/* Center brand */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#ffffff",
            padding: 40,
          }}
        >
          <p
            style={{
              fontSize: 18,
              fontWeight: 400,
              opacity: 0.9,
              marginBottom: 8,
              letterSpacing: "0.5px",
            }}
          >
            Welcome to
          </p>
          <span
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.3px",
            }}
          >
            Laundry King
          </span>

          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 16,
              fontWeight: 400,
              opacity: 0.85,
              letterSpacing: "1px",
            }}
          >
            <span
              style={{
                display: "block",
                width: 60,
                height: 1,
                background: "rgba(255,255,255,0.6)",
              }}
            />
            Ang hari ng labada
            <span
              style={{
                display: "block",
                width: 60,
                height: 1,
                background: "rgba(255,255,255,0.6)",
              }}
            />
          </p>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div
        style={{
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 48px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-subtitle">
            Sign up to get started and enjoy the elite service from Laundry
            King!
          </p>

          {error && <div className="auth-alert auth-alert--error">{error}</div>}

          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullname">
                Full Name
              </label>
              <input
                className="form-input"
                type="text"
                id="fullname"
                placeholder="Enter your name"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
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

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                className="form-input"
                type="password"
                id="password"
                placeholder="Enter your password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="form-label" htmlFor="confirm-password">
                Confirm Password
              </label>
              <input
                className="form-input"
                type="password"
                id="confirm-password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Sign up"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
