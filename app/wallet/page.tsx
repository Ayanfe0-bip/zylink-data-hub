import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountGenerator from "./account-generator";

export default async function WalletPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance_kobo")
    .eq("customer_id", user.id)
    .maybeSingle();

  const { data: bankAccount } = await supabase
    .from("customer_bank_accounts")
    .select("account_number, account_name, bank_name, status")
    .eq("customer_id", user.id)
    .maybeSingle();

  const balanceKobo = Number(wallet?.balance_kobo ?? 0);

  const formattedBalance = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(balanceKobo / 100);

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
          <h2>{formattedBalance}</h2>
          <small>Your current wallet balance</small>
        </div>

        {bankAccount ? (
          <div className="wallet-account-card">
            <div className="wallet-icon">🏦</div>

            <h2>Your dedicated bank account</h2>

            <p>Use these details to fund your Zylink wallet.</p>

            <div className="wallet-status">
              ACCOUNT STATUS: {bankAccount.status}
            </div>

            <p>
              <strong>Account name:</strong><br />
              {bankAccount.account_name}
            </p>

            <p>
              <strong>Account number:</strong><br />
              {bankAccount.account_number}
            </p>

            <p>
              <strong>Bank:</strong><br />
              {bankAccount.bank_name}
            </p>
          </div>
        ) : (
          <AccountGenerator />
        )}

        <div className="wallet-notice">
          <strong>Important</strong>

          <p>
            Zylink is currently testing its Monnify payment
            integration. Real wallet funding is not yet enabled.
            Never enter your real BVN or NIN during Sandbox testing.
          </p>
        </div>
      </section>
    </main>
  );
}
