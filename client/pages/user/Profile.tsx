import { toast } from "sonner";

import { useEffect, useState } from "react";
import UserSidebar from "../../components/UserSidebar";
import { useCurrentUser } from "../../hooks/use-current-user";
import { apiFetch } from "../../lib/api";
import { TopbarUser, getInitials } from "./shared";
import "../../styles/globals.css";

toast.success("message");
toast.error("message");

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  username: string;
  created_at: string;
}

function ProfileField({
  label,
  value,
  name,
  onChange,
  isEditing,
  type = "text",
  readOnly = false,
}: {
  label: string;
  value: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label className="form-label">{label}</label>
      {isEditing && !readOnly ? (
        <input
          className="form-input"
          type={type}
          name={name}
          value={value}
          onChange={onChange}
        />
      ) : (
        <div
          style={{
            padding: "12px 16px",
            border: "1.5px solid var(--border)",
            borderRadius: 8,
            fontSize: 14,
            color: readOnly ? "var(--text-muted)" : "var(--text-main)",
            background: "#f5f7fb",
            minHeight: 46,
          }}
        >
          {value || <span style={{ color: "var(--text-muted)" }}>—</span>}
        </div>
      )}
      {readOnly && isEditing && (
        <span
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 4,
            display: "block",
          }}
        >
          Email cannot be changed here.
        </span>
      )}
    </div>
  );
}

export default function Profile() {
  const user = useCurrentUser();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ full_name: "", username: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    apiFetch(`/api/profile/${user.id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then((data: UserProfile) => {
        setProfile(data);
        setForm({
          full_name: data.full_name ?? "",
          username: data.username ?? "",
        });
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [user]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleCancel() {
    if (profile)
      setForm({
        full_name: profile.full_name ?? "",
        username: profile.username ?? "",
      });
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  }

  async function handleSave() {
    if (!user || !profile) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await apiFetch(`/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          username: form.username,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? `Server error ${res.status}`);
      }

      const updated: UserProfile = await res.json();
      setProfile(updated);
      setForm({
        full_name: updated.full_name ?? "",
        username: updated.username ?? "",
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const initials = getInitials(profile?.email ?? user?.email ?? undefined);
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "—";

  return (
    <div className="lk-shell">
      <UserSidebar />
      <main className="main">
        <TopbarUser />

        <div className="page-header">
          <h1 className="page-header__title">Profile</h1>
          <p className="page-header__sub">
            View and update your personal information.
          </p>
        </div>

        {/* Avatar strip */}
        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 24,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--navy-mid)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--navy)",
                marginBottom: 4,
              }}
            >
              {loading
                ? "—"
                : profile?.full_name ||
                  profile?.username ||
                  profile?.email ||
                  "—"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Member since {memberSince}
            </div>
          </div>
          {!isEditing && (
            <button
              className="btn-primary"
              style={{ marginLeft: "auto" }}
              onClick={() => {
                setIsEditing(true);
                setSuccess(false);
                setError(null);
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Banners */}
        {success && (
          <div
            className="auth-alert auth-alert--success"
            style={{ marginBottom: 20, maxWidth: 560 }}
          >
            ✓ Profile updated successfully.
          </div>
        )}
        {error && (
          <div
            className="auth-alert auth-alert--error"
            style={{ marginBottom: 20, maxWidth: 560 }}
          >
            {error}
          </div>
        )}

        {/* Form card */}
        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "28px 28px 20px",
            boxShadow: "var(--shadow-sm)",
            maxWidth: 560,
          }}
        >
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      width: 80,
                      height: 13,
                      background: "#e2e8f4",
                      borderRadius: 4,
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      width: "100%",
                      height: 46,
                      background: "#e2e8f4",
                      borderRadius: 8,
                    }}
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              <ProfileField
                label="Full Name"
                value={isEditing ? form.full_name : (profile?.full_name ?? "")}
                name="full_name"
                onChange={handleChange}
                isEditing={isEditing}
              />
              <ProfileField
                label="Username"
                value={isEditing ? form.username : (profile?.username ?? "")}
                name="username"
                onChange={handleChange}
                isEditing={isEditing}
              />
              <ProfileField
                label="Email Address"
                value={profile?.email ?? user?.email ?? ""}
                name="email"
                onChange={() => {}}
                isEditing={isEditing}
                type="email"
                readOnly={true}
              />
              {isEditing && (
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button
                    className="btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    className="btn-back"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
