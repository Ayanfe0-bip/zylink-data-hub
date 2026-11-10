import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { claims },
    error
  } = await supabase.auth.getClaims();

  if (error || !claims) {
    redirect("/login");
  }

  const email =
    typeof claims.email === "string"
      ? claims.email
      : "Zylink customer";

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link href="/" className="auth-brand">
          <span className="brand-mark">Z</span>
          <span className="brand-name">
            zy<span>link</span>
          </span>
        </Link>

        <div className="dashboard-header-actions">
          <span className="dashboard-user">
            {email}
          </span>

          <LogoutButton />
        </div>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <span className="section-kicker">
            CUSTOMER DASHBOARD
          </span>

          <h1>Welcome to Zylink!</h1>

          <p>
            Manage your account, explore services
            and stay connected.
          </p>
        </div>

        <div className="dashboard-wallet">
          <div>
            <span className="wallet-label">
              Wallet balance
            </span>

            <h2>₦0.00</h2>

            <span className="wallet-note">
              Your wallet is ready for funding.
            </span>
          </div>

          <button type="button" disabled>
            Fund wallet
          </button>

          <p className="wallet-notice">
            Wallet funding will become available
            after payment integration is completed.
          </p>
        </div>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Quick services</h2>
              <p>Choose what you want to do.</p>
            </div>
          </div>

          <div className="dashboard-services">
            <article className="dashboard-service">
              <span className="service-icon">📱</span>
              <h3>Buy Data</h3>
              <p>Purchase affordable mobile data.</p>
              <span className="service-status">
                Coming soon
              </span>
            </article>

            <article className="dashboard-service">
              <span className="service-icon">☎️</span>
              <h3>Buy Airtime</h3>
              <p>Recharge your mobile line easily.</p>
              <span className="service-status">
                Coming soon
              </span>
            </article>

            <article className="dashboard-service">
              <span className="service-icon">💳</span>
              <h3>Fund Wallet</h3>
              <p>Add money to your Zylink wallet.</p>
              <span className="service-status">
                Coming soon
              </span>
            </article>

            <article className="dashboard-service">
              <span className="service-icon">📄</span>
              <h3>Transactions</h3>
              <p>View your purchase history.</p>
              <span className="service-status">
                Coming soon
              </span>
            </article>
          </div>
        </section>

        <div className="dashboard-notice">
          <strong>Welcome aboard!</strong>
          <p>
            We're preparing Zylink's payment and
            data services. You'll be able to make
            real purchases once the integrations
            are ready.
          </p>
        </div>
      </section>

      <footer className="dashboard-footer">
        A product of Ayanfe Innovation Labs Limited.
      </footer>
    </main>
  );
}
