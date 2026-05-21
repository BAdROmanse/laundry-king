import { useState } from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.user?.email_confirmed_at) {
      localStorage.setItem("pendingVerificationEmail", email.trim().toLowerCase());
      await supabase.auth.signOut();
      navigate("/check-email?type=verify&reason=unverified");
      return;
    }

    // Check role and redirect accordingly
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user!.id)
      .single();

    const role = profile?.role ?? data.user?.user_metadata?.role ?? "customer";

    if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="auth-layout">
      {/* ── LEFT ── */}
      <div className="auth-left">
        {/* Top-left logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            position: "relative",
            zIndex: 1,
            textDecoration: "none",
          }}
        >
          <img
            src="/logo/LK-logo-white.png"
            alt="Laundry King logo"
            style={{
              width: 65,
              height: 65,
              objectFit: "contain",
              display: "block",
            }}
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
        <div className="auth-brand">
          <p className="auth-brand__welcome">Welcome to</p>
          <h1 className="auth-brand__name">Laundry King</h1>
          <p className="auth-brand__tagline">Ang hari ng labada</p>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <h2 className="auth-title">
            Welcome <span>Back!</span>
          </h2>
          <p className="auth-subtitle">
            Enter your details to get started and enjoy the elite service from
            Laundry King!
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email or Username
              </label>
              <input
                className="form-input"
                type="email"
                id="email"
                placeholder="Enter your email"
                autoComplete="username"
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label className="form-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="form-forgot">
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div className="auth-alert auth-alert--error">{error}</div>
            )}

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
            >
              {loading ? "Logging in…" : "Log In"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{" "}
            <Link href="/signup">
              <strong>Sign Up</strong>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
