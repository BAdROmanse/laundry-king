import { toast } from "sonner";
import { useState } from "react";
import UserSidebar from "@/components/UserSidebar";
import UserTopbar from "@/components/UserTopbar";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/hooks/use-current-user";
import "@/styles/globals.css";

// ── Change Password Modal ─────────────────────────────────────
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [show, setShow] = useState({ next: false, confirm: false });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.next.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.next !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const { error: sbError } = await supabase.auth.updateUser({
        password: form.next,
      });
      if (sbError) throw new Error(sbError.message);
      setForm({ next: "", confirm: "" });
      toast.success("Password updated successfully!");
      setTimeout(() => onClose(), 1000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    // Backdrop
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,20,50,0.45)",
        backdropFilter: "blur(3px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 440,
          padding: "36px 32px 28px",
          boxShadow: "0 20px 60px rgba(10,20,60,0.22)",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: 20,
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--navy)",
            marginBottom: 6,
          }}
        >
          Change Password
        </h2>
        <p
          style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}
        >
          Choose a strong password you don't use anywhere else.
        </p>

        {success && (
          <div
            className="auth-alert auth-alert--success"
            style={{ marginBottom: 16 }}
          >
            ✓ Password updated! Closing…
          </div>
        )}
        {error && (
          <div
            className="auth-alert auth-alert--error"
            style={{ marginBottom: 16 }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { name: "next" as const, label: "New Password" },
            { name: "confirm" as const, label: "Confirm New Password" },
          ].map(({ name, label }) => (
            <div key={name} style={{ marginBottom: 18 }}>
              <label className="form-label">{label}</label>
              <div style={{ position: "relative" }}>
                <input
                  className="form-input"
                  type={show[name] ? "text" : "password"}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShow((p) => ({ ...p, [name]: !p[name] }))}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {show[name] ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
            style={{ marginTop: 8, width: "100%", justifyContent: "center" }}
          >
            {saving ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Settings page ────────────────────────────────────────
export default function Settings() {
  const user = useCurrentUser();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    order_updates: true,
    promotions: false,
    email_newsletter: true,
    two_factor: false,
  });
  const [deliveryDefault, setDeliveryDefault] = useState("Delivery");
  const [paymentDefault, setPaymentDefault] = useState("GCash");

  function toggleNotif(key: keyof typeof notifPrefs) {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const SECTIONS = [
    {
      title: "Account",
      rows: [
        {
          label: "Email address",
          desc: user?.email ?? "—",
          type: "info" as const,
        },
        {
          label: "Phone number",
          desc: "Not set",
          type: "info" as const,
        },
        {
          label: "Change password",
          desc: "Update your login password",
          type: "link" as const,
          onClick: () => setShowPasswordModal(true),
        },
      ],
    },
    {
      title: "Notifications",
      rows: [
        {
          label: "Order updates",
          desc: "Get notified when your order status changes",
          type: "toggle" as const,
          key: "order_updates" as const,
        },
        {
          label: "Promotions",
          desc: "Receive deals and special offers",
          type: "toggle" as const,
          key: "promotions" as const,
        },
        {
          label: "Email newsletter",
          desc: "Weekly tips and news from Laundry King",
          type: "toggle" as const,
          key: "email_newsletter" as const,
        },
      ],
    },
    {
      title: "Preferences",
      rows: [
        {
          label: "Default delivery mode",
          desc: "Choose pick-up or delivery as default",
          type: "delivery-select" as const,
        },
        {
          label: "Default payment",
          desc: "Set your preferred payment method",
          type: "payment-select" as const,
        },
      ],
    },
    {
      title: "Privacy & Security",
      rows: [
        {
          label: "Two-factor authentication",
          desc: "Add extra security to your account",
          type: "toggle" as const,
          key: "two_factor" as const,
        },
        {
          label: "Delete account",
          desc: "Permanently remove your data",
          type: "link" as const,
          onClick: () => {},
        },
      ],
    },
  ];

  return (
    <div className="lk-shell">
      <UserSidebar />
      <main className="main">
        <UserTopbar />

        <div className="page-header" style={{ marginBottom: 28 }}>
          <h1 className="page-header__title">Settings</h1>
          <p className="page-header__sub">
            Manage your account and preferences
          </p>
        </div>

        {SECTIONS.map((section) => (
          <section className="section" key={section.title}>
            <h2 className="section__title">{section.title}</h2>
            <div className="settings-list">
              {section.rows.map((row) => (
                <div className="settings-row" key={row.label}>
                  <div className="settings-row__info">
                    <span className="settings-row__label">{row.label}</span>
                    <span className="settings-row__desc">{row.desc}</span>
                  </div>
                  <div className="settings-row__control">
                    {row.type === "info" && null}

                    {row.type === "toggle" && "key" in row && (
                      <label className="settings-toggle">
                        <input
                          type="checkbox"
                          className="settings-toggle__input"
                          checked={notifPrefs[row.key]}
                          onChange={() => toggleNotif(row.key)}
                        />
                        <span className="settings-toggle__track" />
                      </label>
                    )}

                    {row.type === "link" && (
                      <button
                        className="settings-link-btn"
                        onClick={"onClick" in row ? row.onClick : undefined}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>
                    )}

                    {row.type === "delivery-select" && (
                      <select
                        className="settings-select"
                        value={deliveryDefault}
                        onChange={(e) => setDeliveryDefault(e.target.value)}
                      >
                        <option>Delivery</option>
                        <option>Pick up</option>
                      </select>
                    )}

                    {row.type === "payment-select" && (
                      <select
                        className="settings-select"
                        value={paymentDefault}
                        onChange={(e) => setPaymentDefault(e.target.value)}
                      >
                        <option>GCash</option>
                        <option>Cash on Delivery</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Password modal */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      <style>{`
        .settings-list {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .settings-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 22px;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
        }
        .settings-row:last-child { border-bottom: none; }
        .settings-row:hover { background: var(--bg); }
        .settings-row__info { display: flex; flex-direction: column; gap: 3px; }
        .settings-row__label { font-size: 14px; font-weight: 600; color: var(--text-main); }
        .settings-row__desc  { font-size: 12px; color: var(--text-muted); }
        .settings-row__control { flex-shrink: 0; }
        .settings-toggle { position: relative; display: inline-flex; cursor: pointer; }
        .settings-toggle__input { position: absolute; opacity: 0; width: 0; height: 0; }
        .settings-toggle__track {
          display: inline-block; width: 44px; height: 24px;
          background: var(--border); border-radius: 12px;
          transition: background 0.2s; position: relative;
        }
        .settings-toggle__track::after {
          content: ''; position: absolute; top: 3px; left: 3px;
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--white); box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        }
        .settings-toggle__input:checked + .settings-toggle__track { background: var(--navy); }
        .settings-toggle__input:checked + .settings-toggle__track::after { transform: translateX(20px); }
        .settings-link-btn {
          width: 32px; height: 32px; padding: 0;
          background: var(--navy-light); border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          color: var(--navy); border: none; cursor: pointer;
          transition: background 0.15s;
        }
        .settings-link-btn:hover { background: #c5d9f0; }
        .settings-select {
          appearance: none;
          background: var(--navy-light);
          border: none; border-radius: 20px;
          padding: 6px 28px 6px 12px;
          font-size: 13px; font-weight: 600; color: var(--navy);
          cursor: pointer; outline: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%231a3a6b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }
      `}</style>
    </div>
  );
}
