import { Link } from "wouter";

export default function LandingPage() {
  return (
    <>
      {/* ── NAVBAR ── */}
      <header className="lp-navbar">
        <div className="lp-navbar__inner">
          <Link href="/">
            <a className="lp-navbar__logo">
              <img src="/logo/LK-logo-main.png" alt="Laundry King logo" />
              <span className="lp-navbar__brand">Laundry King</span>
            </a>
          </Link>

          <nav className="lp-navbar__links">
            <a href="#hero">Home</a>
            <a href="#about">About Us</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact Us</a>
          </nav>

          <div className="lp-navbar__actions">
            <Link href="/login">
              <a className="lp-btn-login">Log In</a>
            </Link>
            <Link href="/signup">
              <a className="lp-btn-signup">Sign Up</a>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="lp-hero" id="hero">
        <div className="lp-hero__content">
          <h1 className="lp-hero__heading">
            ENJOY <span className="lp-hero__accent">ELITE</span> AND{" "}
            <span className="lp-hero__accent">REGAL QUALITY</span> SERVICE
          </h1>
          <p className="lp-hero__sub">
            Receive top-tier quality service with exceptional stain removal
            system and collect your garments with exquisite fragrance only with
            Laundry King.
          </p>
          <Link href="/signup">
            <a className="lp-hero__cta">Be our noble guest! →</a>
          </Link>
        </div>

        <div className="lp-hero__image-wrap">
          <div className="lp-hero__circle" />
          <img
            src="/images/Hero-Pic.png"
            alt="Laundry service"
            className="lp-hero__img"
          />
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="lp-about" id="about">
        <div className="lp-about__inner">
          <h2 className="lp-about__title">
            Get to know more about Laundry King!
          </h2>
          <p className="lp-about__sub">
            Laundry King is a laundry service provider that attracts clients
            with its superior, quick, and reliable service Since its founding in
            2024, the company has thrived and flourished.
          </p>

          <div className="lp-about__features">
            <div className="lp-feature-card">
              <div className="lp-feature__icon">
                <img src="/landing page icons/crown1.png" alt="crown" />
              </div>
              <h3 className="lp-feature__title">King Quality Service</h3>
              <p className="lp-feature__desc">
                Receive and enjoy your garments fresh and fragrant with Laundry
                King's effective and careful wash, dry and fold process.
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature__icon">
                <img
                  src="/landing page icons/rush.png"
                  alt="fast and reliable"
                />
              </div>
              <h3 className="lp-feature__title">Fast and Reliable</h3>
              <p className="lp-feature__desc">
                Wait no more with our laundry service! Receive your garments a
                day after your order confirmation or avail our rushed service to
                get them within the day.
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature__icon">
                <img
                  src="/landing page icons/express-delivery.png"
                  alt="convenient"
                />
              </div>
              <h3 className="lp-feature__title">Convenient</h3>
              <p className="lp-feature__desc">
                Don't want to pick up your laundry? No problem! Laundry King
                offers delivery service and allows customers to pick their
                desired mode of claiming.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="lp-services" id="services">
        <div className="lp-services__inner">
          <h2 className="lp-services__title">We Offer Various Services</h2>
          <p className="lp-services__sub">
            Receive and enjoy your garments fresh and fragrant with Laundry
            King's effective wash, dry, fold, rushed, pickup, and delivery
            services.
          </p>

          <div className="lp-services__grid">
            {[
              {
                icon: "washer1.png",
                title: "Full Service",
                desc: "Complete wash, dry, and fold service. We handle everything from start to finish so you don't have to.",
              },
              {
                icon: "dry.png",
                title: "Dry",
                desc: "Professional drying service that ensures your garments come out perfectly dry and ready to wear.",
              },
              {
                icon: "fold.png",
                title: "Fold",
                desc: "Neatly folded garments delivered back to you organized and ready to be put away.",
              },
              {
                icon: "delivery-man.png",
                title: "Pickup & Delivery",
                desc: "We pick up your laundry from your doorstep and deliver it back fresh, clean, and on time.",
              },
            ].map(({ icon, title, desc }) => (
              <div className="lp-service-card" key={title}>
                <div className="lp-service-card__icon">
                  <img src={`/landing page icons/${icon}`} alt={title} />
                </div>
                <h3 className="lp-service-card__title">{title}</h3>
                <p className="lp-service-card__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="lp-contact" id="contact">
        <div className="lp-contact__inner">
          <div>
            <h2 className="lp-contact__title">Contact Us</h2>
            <p className="lp-contact__intro">
              Have any questions? Don't hesitate to contact us! You can call us,
              message us on Facebook, or go directly to our store.
            </p>

            <ul className="lp-contact__info">
              <li>
                <span className="lp-contact__icon">
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
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.56 3.35 2 2 0 0 1 3.53 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.57a16 16 0 0 0 6 6l.72-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 16z" />
                  </svg>
                </span>
                0916-346-6978
              </li>
              <li>
                <span className="lp-contact__icon">
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
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.56 3.35 2 2 0 0 1 3.53 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.57a16 16 0 0 0 6 6l.72-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 16z" />
                  </svg>
                </span>
                0968-679-9179
              </li>
              <li>
                <a
                  href="https://www.facebook.com/laundrykingkalayaan"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="lp-contact__icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </span>
                  Laundry King
                </a>
              </li>
              <li>
                <span className="lp-contact__icon">
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
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                Purok 3, Brgy. San Juan, Kalayaan, Laguna
              </li>
            </ul>

            <div className="lp-contact__footer-links">
              <div className="lp-contact__footer-col">
                <strong>Customer Support</strong>
                <p>
                  Reach out to us anytime for help with your orders or account.
                </p>
              </div>
              <div className="lp-contact__footer-col">
                <strong>Business Hours</strong>
                <p>Monday – Saturday, 7:00 AM – 7:00 PM. Closed on Sundays.</p>
              </div>
              <div className="lp-contact__footer-col">
                <strong>Location</strong>
                <p>Purok 3, Brgy. San Juan, Kalayaan, Laguna, Philippines.</p>
              </div>
            </div>
          </div>

          <div className="lp-contact__img-wrap">
            <img
              src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&q=80"
              alt="Laundry machines"
              className="lp-contact__img"
            />
            <div className="lp-contact__img-caption">
              Visit us at our store in Kalayaan, Laguna. We are open Monday
              through Saturday and ready to serve you with the finest laundry
              service in the area.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
