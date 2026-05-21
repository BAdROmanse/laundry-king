import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminTopbar() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initials, setInitials] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("users")
        .select("full_name, email")
        .eq("id", session.user.id)
        .single();

      const fullName =
        profile?.full_name || session.user.user_metadata?.full_name || "Admin";
      const userEmail = profile?.email || session.user.email || "";

      const parts = fullName.trim().split(" ");
      const derived =
        parts.length >= 2
          ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
          : (parts[0]?.[0] || "A").toUpperCase();

      setName(fullName);
      setEmail(userEmail);
      setInitials(derived);
    }
    load();
  }, []);

  return (
    <header className="topbar">
      <div className="topbar__user">
        <div className="topbar__avatar">{initials || "A"}</div>
        <div className="topbar__info">
          <span className="topbar__name">{name || "Loading…"}</span>
          <span className="topbar__email">{email}</span>
        </div>
      </div>
    </header>
  );
}
