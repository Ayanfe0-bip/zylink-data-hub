import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function WalletPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="wallet-page">
      <header className="wallet-header">
        <Link href="/dashboard" className="wallet-brand">
          <span>Z</span> zylink
        </Link>

        <Link href="/dashboard" className="wallet-back">
          ← Dashboard
        </Link>
      </header>

      <section className="wallet-container">
        <span className="wallet-kicker">
          ZYLINK DIGITAL WALLET
        </span>

        <h1>Fund your wallet</h1>

        <p className="wallet-description">
          Fund your Zylink wallet securely and use your
          balance to purchase affordable mobile data.
        </p>

        <div className="wallet-balance-card">
          <span>AVAILABLE BALANCE</span>
          <h2>₦0.00</h2>
          <small>Your current wallet balance</small>
        </div>

        <div className="wallet-account-card">
          <div className="wallet-icon">🏦</div>

          <h2>Your dedicated bank account</h2>

          <p>
            We are preparing your personal Zylink bank
            account through our Monnify payment integration.
          </p>

          <div className="wallet-security">
            <span>🔒</span>
            Your BVN or NIN will be sent securely to
            Monnify when account generation becomes available.
            Zylink will not store your identity number.
          </div>

          <div className="wallet-status">
            PAYMENT INTEGRATION: SANDBOX TESTING
          </div>
        </div>

        <div className="wallet-notice">
          <strong>Important</strong>

          <p>
            We are currently testing the payment system.
            Real wallet funding is not yet enabled.
            Do not submit your real BVN or NIN during
            Sandbox testing.
          </p>
        </div>
      </section>
    </main>
  );
}
