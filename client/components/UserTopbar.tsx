import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UserTopbar() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initials, setInitials] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const user = session.user;

      // Try to get full_name from users table
      const { data: profile } = await supabase
        .from("users")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      const fullName =
        profile?.full_name || user.user_metadata?.full_name || user.email || "";
      const userEmail = profile?.email || user.email || "";

      const parts = fullName.trim().split(" ");
      const derivedInitials =
        parts.length >= 2
          ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
          : (parts[0]?.[0] || "?").toUpperCase();

      setName(fullName);
      setEmail(userEmail);
      setInitials(derivedInitials);
    }
    load();
  }, []);

  return (
    <header className="topbar">
      <div className="topbar__user">
        <div className="topbar__avatar">{initials || "?"}</div>
        <div className="topbar__info">
          <span className="topbar__name">{name || "Loading…"}</span>
          <span className="topbar__email">{email}</span>
        </div>
      </div>
    </header>
  );
}
