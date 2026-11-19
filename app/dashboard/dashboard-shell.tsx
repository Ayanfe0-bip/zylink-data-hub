"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";

type Props = {
  email: string;
  balanceKobo: number;
};

type Section =
  | "Dashboard"
  | "Transaction History"
  | "My Profile"
  | "Settings"
  | "Documentation";

export default function DashboardShell({
  email,
  balanceKobo,
}: Props) {
  const [active, setActive] = useState<Section>("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const formattedBalance = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(balanceKobo / 100);

  function navigate(section: Section) {
    setActive(section);
    setSidebarOpen(false);
  }

  return (
    <main className="zy-dashboard">
      <header className="zy-topbar">
        <button
          className="zy-menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>

        <Link href="/dashboard" className="zy-top-brand">
          <span className="zy-brand-mark">Z</span>
          <span>
            zy<span>link</span>
          </span>
        </Link>

        <div className="zy-top-user">
          <span className="zy-user-email">{email}</span>
          <span className="zy-avatar">Z</span>
        </div>
      </header>

      {sidebarOpen && (
        <button
          className="zy-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`zy-sidebar ${sidebarOpen ? "is-open" : ""}`}
      >
        <div className="zy-sidebar-brand">
          <span className="zy-brand-mark">Z</span>

          <div>
            <strong>zylink</strong>
            <small>DATA HUB</small>
          </div>
        </div>

        <div className="zy-nav-label">MAIN MENU</div>

        <Link
          href="/dashboard"
          className={`zy-nav-link ${
            active === "Dashboard" ? "active" : ""
          }`}
          onClick={() => {
            setActive("Dashboard");
            setSidebarOpen(false);
          }}
        >
          <span>▦</span>
          Dashboard
        </Link>

        <Link
          href="/data"
          className="zy-nav-link"
          onClick={() => setSidebarOpen(false)}
        >
          <span>▤</span>
          Buy Data
          <b className="zy-nav-arrow">↗</b>
        </Link>

        <Link
          href="/transactions"
          className="zy-nav-link"
          onClick={() => setSidebarOpen(false)}
        >
          <span>↔</span>
          Transaction History
          <b className="zy-nav-arrow">↗</b>
        </Link>

        <div className="zy-nav-label">MY ACCOUNT</div>

        <Link
          href="/profile"
          className="zy-nav-link"
          onClick={() => setSidebarOpen(false)}
        >
          <span>♙</span>
          My Profile
          <b className="zy-nav-arrow">↗</b>
        </Link>

        <Link
          href="/settings"
          className="zy-nav-link"
          onClick={() => setSidebarOpen(false)}
        >
          <span>⚙</span>
          Settings
          <b className="zy-nav-arrow">↗</b>
        </Link>

        <div className="zy-nav-label">SUPPORT</div>

        <Link
          href="/documentation"
          className="zy-nav-link"
          onClick={() => setSidebarOpen(false)}
        >
          <span>▧</span>
          Documentation
          <b className="zy-nav-arrow">↗</b>
        </Link>

        <div className="zy-sidebar-help">
          <span className="zy-help-icon">ⓘ</span>
          <strong>Need help?</strong>
          <p>We're here to help you stay connected.</p>

          <a href="mailto:bizstarter.support@gmail.com">
            Contact support →
          </a>
        </div>

        <div className="zy-sidebar-logout">
          <LogoutButton />
        </div>
      </aside>

      <section className="zy-main">
        {active === "Dashboard" ? (
          <>
            <div className="zy-welcome-row">
              <div>
                <span className="zy-eyebrow">
                  CUSTOMER DASHBOARD
                </span>

                <h1>Welcome to Zylink!</h1>

                <p>
                  Manage your account, explore services and stay
                  connected.
                </p>
              </div>

              <Link href="/data" className="zy-buy-button">
                ＋ Buy Data
              </Link>
            </div>

            <section className="zy-wallet-card">
              <div className="zy-wallet-top">
                <div>
                  <span>WALLET BALANCE</span>
                  <h2>{formattedBalance}</h2>
                </div>

                <Link href="/wallet" className="zy-fund-button">
                  Fund wallet →
                </Link>
              </div>

              <p>Your Zylink wallet balance.</p>

              <div className="zy-wallet-divider" />

              <small>
                Your wallet balance updates when a payment is
                successfully confirmed.
              </small>
            </section>

            <section className="zy-section">
              <div className="zy-section-heading">
                <div>
                  <h2>Quick services</h2>
                  <p>Choose what you want to do.</p>
                </div>

                <span className="zy-section-tag">
                  YOUR SERVICES
                </span>
              </div>

              <div className="zy-service-grid">
                <Link
                  href="/data"
                  className="zy-service-card"
                >
                  <span className="zy-service-icon">📱</span>
                  <h3>Buy Data</h3>
                  <p>Purchase affordable mobile data.</p>

                  <span className="zy-service-status ready">
                    Available now <b>→</b>
                  </span>
                </Link>

                <article className="zy-service-card">
                  <span className="zy-service-icon">☎️</span>
                  <h3>Buy Airtime</h3>
                  <p>Recharge your mobile line easily.</p>

                  <span className="zy-service-status">
                    Coming soon
                  </span>
                </article>

                <Link
                  href="/wallet"
                  className="zy-service-card"
                >
                  <span className="zy-service-icon">💳</span>
                  <h3>Fund Wallet</h3>
                  <p>Add money to your Zylink wallet.</p>

                  <span className="zy-service-status ready">
                    Open wallet →
                  </span>
                </Link>

                <Link
                  href="/transactions"
                  className="zy-service-card"
                >
                  <span className="zy-service-icon">📄</span>
                  <h3>Transactions</h3>
                  <p>Keep track of your purchases.</p>

                  <span className="zy-service-status">
                    View history →
                  </span>
                </Link>
              </div>
            </section>

            <div className="zy-notice">
              <span>✦</span>

              <div>
                <strong>Welcome aboard!</strong>
                <p>
                  Your Zylink account is ready. You can explore
                  available data services and manage your wallet
                  from this dashboard. Some services are still
                  being prepared.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="zy-placeholder-panel">
            <span className="zy-eyebrow">ZYLINK DATA HUB</span>

            <h1>{active}</h1>

            <p>
              This section is being prepared. Your account
              dashboard and data purchase service remain available.
            </p>

            {active === "Transaction History" && (
              <Link href="/transactions" className="zy-buy-button">
                View transactions →
              </Link>
            )}
          </div>
        )}

        <footer className="zy-footer">
          © {new Date().getFullYear()} Zylink Data Hub · A product
          of Ayanfe Innovation Labs Limited.
        </footer>
      </section>
    </main>
  );
}
