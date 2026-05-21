import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

type AuthState = "loading" | "authenticated" | "unauthenticated";

function LoadingScreen() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        style={{ animation: "spin 1s linear infinite" }}
      >
        <circle cx="24" cy="24" r="20" stroke="#e2e8f4" strokeWidth="4" />
        <path
          d="M24 4 A20 20 0 0 1 44 24"
          stroke="#1a3a6b"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <p
        style={{
          color: "#6b7a99",
          fontSize: 14,
          fontFamily: "Satoshi, sans-serif",
        }}
      >
        Checking session…
      </p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Shared role checker ───────────────────────────────────────
async function getUserRole(userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
  return profile?.role ?? "customer";
}

// ── ProtectedRoute — any logged-in user ───────────────────────
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [, navigate] = useLocation();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (!session) {
        setAuthState("unauthenticated");
        navigate("/login");
        return;
      }
      if (!session.user.email_confirmed_at) {
        localStorage.setItem(
          "pendingVerificationEmail",
          session.user.email ?? "",
        );
        await supabase.auth.signOut();
        setAuthState("unauthenticated");
        navigate("/check-email?type=verify&reason=unverified");
        return;
      }
      // If admin tries to access a user route, send them to admin dashboard
      const role = await getUserRole(session.user.id);
      if (role === "admin") {
        navigate("/admin/dashboard");
        return;
      }
      setAuthState("authenticated");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (!session) {
        setAuthState("unauthenticated");
        navigate("/login");
        return;
      }
      if (!session.user.email_confirmed_at) {
        localStorage.setItem(
          "pendingVerificationEmail",
          session.user.email ?? "",
        );
        await supabase.auth.signOut();
        setAuthState("unauthenticated");
        navigate("/check-email?type=verify&reason=unverified");
        return;
      }
      const role = await getUserRole(session.user.id);
      if (role === "admin") {
        navigate("/admin/dashboard");
        return;
      }
      setAuthState("authenticated");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (authState === "loading") return <LoadingScreen />;
  if (authState === "unauthenticated") return null;
  return <>{children}</>;
}

// ── AdminRoute — admin only ───────────────────────────────────
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [, navigate] = useLocation();

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (mounted) {
          setAuthState("unauthenticated");
          navigate("/login");
        }
        return;
      }
      if (!session.user.email_confirmed_at) {
        localStorage.setItem(
          "pendingVerificationEmail",
          session.user.email ?? "",
        );
        await supabase.auth.signOut();
        if (mounted) {
          setAuthState("unauthenticated");
          navigate("/check-email?type=verify&reason=unverified");
        }
        return;
      }

      const role = await getUserRole(session.user.id);
      if (!mounted) return;

      if (role === "admin") {
        setAuthState("authenticated");
      } else {
        setAuthState("unauthenticated");
        navigate("/home");
      }
    }

    checkAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        setAuthState("unauthenticated");
        navigate("/login");
      }
      // Do NOT re-check role here — causes redirect loop on hot reload
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // ← empty deps, runs once only

  if (authState === "loading") return <LoadingScreen />;
  if (authState === "unauthenticated") return null;
  return <>{children}</>;
}
