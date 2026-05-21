// pages/user/UserHome.tsx
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { formatPHDateTime } from "@/lib/date";
import UserSidebar from "../../components/UserSidebar";
import { TopbarUser, WasherIcon, TshirtIcon, Order } from "./shared";
import "../../styles/globals.css";

export default function UserHome() {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select(
          "id, service_type, pack_type, delivery_mode, status, payment_status, total_cost, weight, created_at",
        )
        .eq("user_id", session.user.id)
        .in("status", ["Washing", "Drying", "Folding", "For Delivery"])
        .order("created_at", { ascending: false })
        .limit(5);

      setActiveOrders(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="lk-shell">
      <UserSidebar />
      <main className="main">
        <TopbarUser />

        {/* Hero Banner */}
        <div className="hero">
          <div className="hero__overlay" />
          <div className="hero__content">
            <h1>
              Fresh &amp; Clean,
              <br />
              Every Time.
            </h1>
            <p>Professional laundry services at your doorstep</p>
          </div>
        </div>

        {/* Top Picks */}
        <section className="section">
          <h2 className="section__title">Top picks for you</h2>
          <div className="cards-grid">
            <div className="service-card">
              <div className="service-card__icon">
                <WasherIcon />
              </div>
              <div className="service-card__info">
                <h3>Full service</h3>
                <p className="service-card__desc">
                  Pack 1 / Regular clothes
                  <br />
                  Fabric Conditioned
                  <br />
                  Cash / pick up
                </p>
              </div>
            </div>
            <div className="service-card">
              <div className="service-card__icon">
                <WasherIcon />
              </div>
              <div className="service-card__info">
                <h3>Full service</h3>
                <p className="service-card__desc">
                  Pack 2 / Regular clothes
                  <br />
                  Fabric Conditioned
                  <br />
                  Cash / For Delivery
                </p>
              </div>
            </div>
            <div className="service-card">
              <div className="service-card__icon">
                <TshirtIcon />
              </div>
              <div className="service-card__info">
                <h3>Dry and Fold</h3>
                <p className="service-card__desc">
                  Pack 1 / Regular clothes
                  <br />
                  Fabric Conditioned
                  <br />
                  Cash / pick up
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Active Purchase */}
        <section className="section">
          <h2 className="section__title">Active Purchase</h2>
          <div className="purchases">
            {loading ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                Loading…
              </p>
            ) : activeOrders.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                No active orders.
              </p>
            ) : (
              activeOrders.map((order) => (
                <div key={order.id} className="purchase-item">
                  <div className="purchase-item__icon">
                    <WasherIcon />
                  </div>
                  <div className="purchase-item__details">
                    <span className="purchase-item__name">
                      Laundry: {order.service_type} /{" "}
                      {order.delivery_type ?? "Pickup"}
                    </span>
                    <span className="purchase-item__date">
                      {formatPHDateTime(order.created_at)}
                    </span>
                  </div>
                  <div className="purchase-item__action">
                    <span className="purchase-item__ref">
                      Ref: #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <Link href="/laundry-status">
                      <button className="btn-check-status">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                        Check Status
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
