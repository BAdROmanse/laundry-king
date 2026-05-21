// pages/auth/Confirmation.tsx
// Converted from: p5_confirmation.html
// Shown after signup — tells the user to check their email.

import { Link } from "wouter";

const LogoIcon = () => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="13" stroke="#ffffff" strokeWidth="2"/>
    <circle cx="14" cy="14" r="8"  stroke="#ffffff" strokeWidth="1.5"/>
    <circle cx="14" cy="14" r="3"  fill="#ffffff"/>
    <path d="M14 5 A9 9 0 0 1 23 14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CrownIcon = () => (
  <svg width="54" height="42" viewBox="0 0 54 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 36 L10 12 L27 28 L44 12 L50 36 Z" fill="white"/>
    <circle cx="4"  cy="12" r="4" fill="white"/>
    <circle cx="27" cy="6"  r="4" fill="white"/>
    <circle cx="50" cy="12" r="4" fill="white"/>
  </svg>
);

const EnvelopeIcon = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
    <rect x="8" y="22" width="84" height="60" rx="12" stroke="#1a3a6b" strokeWidth="6"/>
    <path d="M8 34 L50 58 L92 34" stroke="#1a3a6b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Confirmation() {
  return (
    <div className="auth-layout">

      {/* ── LEFT ── */}
      <div className="auth-left">
        <Link href="/" className="auth-logo">
          <LogoIcon />
          Laundry King
        </Link>
        <div className="auth-brand">
          <p className="auth-brand__welcome">Welcome to</p>
          <h1 className="auth-brand__name">
            Laundry King
            <CrownIcon />
          </h1>
          <p className="auth-brand__tagline">Ang hari ng labada</p>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="auth-right">
        <div className="auth-form-wrap" style={{ textAlign: "center" }}>
          <h2 className="auth-title">Check your Email</h2>
          <p className="auth-subtitle">
            We've sent a confirmation link to your email address.
            Click the link to activate your account and get started.
          </p>

          <div className="auth-icon">
            <EnvelopeIcon />
          </div>

          <Link href="/login">
            <button className="btn btn--primary btn--full">
              Back to Log In
            </button>
          </Link>
        </div>
      </div>

    </div>
  );
}
