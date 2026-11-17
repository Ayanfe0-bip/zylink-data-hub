"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Transaction = {
  id: string;
  reference: string;
  network: string;
  plan: string;
  phone: string;
  amount: number;
  status: "Successful" | "Failed";
  date: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("zylink_transactions");
      setTransactions(saved ? JSON.parse(saved) : []);
    } catch {
      setTransactions([]);
    }

    setLoaded(true);
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <main className="transactions-page">
      <header className="transactions-header">
        <Link href="/dashboard" className="transactions-brand">
          <span className="brand-mark">Z</span>
          <span>zy<span>link</span></span>
        </Link>

        <Link href="/dashboard" className="dashboard-link">
          ← Dashboard
        </Link>
      </header>

      <section className="transactions-content">
        <div className="transactions-intro">
          <span className="transactions-kicker">
            YOUR ACCOUNT
          </span>

          <h1>Transaction History</h1>

          <p>
            View and track your previous data purchases.
          </p>
        </div>

        <div className="transactions-summary">
          <div>
            <span>TOTAL TRANSACTIONS</span>
            <strong>{loaded ? transactions.length : "..."}</strong>
          </div>

          <div>
            <span>SUCCESSFUL</span>
            <strong>
              {loaded
                ? transactions.filter(
                    (item) => item.status === "Successful"
                  ).length
                : "..."}
            </strong>
          </div>

          <div>
            <span>FAILED</span>
            <strong>
              {loaded
                ? transactions.filter(
                    (item) => item.status === "Failed"
                  ).length
                : "..."}
            </strong>
          </div>
        </div>

        <section className="transactions-card">
          <div className="transactions-card-heading">
            <div>
              <h2>Recent transactions</h2>
              <p>Your data purchase records.</p>
            </div>

            <span className="history-icon">↔</span>
          </div>

          {!loaded ? (
            <div className="history-empty">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="history-empty">
              <div className="empty-icon">📄</div>

              <h3>No transactions yet</h3>

              <p>
                Your data purchases will appear here
                after you make your first order.
              </p>

              <Link href="/data" className="history-buy-button">
                Buy Data Now →
              </Link>
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.map((item) => (
                <article
                  className="transaction-item"
                  key={item.id}
                >
                  <div className="transaction-top">
                    <div className="transaction-network">
                      <span className={`network-badge ${item.network.toLowerCase()}`}>
                        {item.network === "9MOBILE"
                          ? "9"
                          : item.network.charAt(0)}
                      </span>

                      <div>
                        <strong>{item.network} Data</strong>
                        <small>{item.plan}</small>
                      </div>
                    </div>

                    <strong className="transaction-amount">
                      ₦{Number(item.amount).toLocaleString("en-NG")}
                    </strong>
                  </div>

                  <div className="transaction-details">
                    <div>
                      <span>PHONE NUMBER</span>
                      <strong>{item.phone}</strong>
                    </div>

                    <div>
                      <span>REFERENCE</span>
                      <strong>{item.reference}</strong>
                    </div>

                    <div>
                      <span>DATE</span>
                      <strong>{formatDate(item.date)}</strong>
                    </div>
                  </div>

                  <div className="transaction-bottom">
                    <span className={`transaction-status ${
                      item.status === "Successful"
                        ? "status-success"
                        : "status-failed"
                    }`}>
                      ● {item.status}
                    </span>

                    <span className="transaction-test-label">
                      TEST TRANSACTION
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="history-notice">
          <span>ⓘ</span>
          <p>
            These records are currently stored on this
            browser. Purchases are still in test mode
            and do not represent live data delivery.
          </p>
        </div>

        <footer className="transactions-footer">
          © {new Date().getFullYear()} Zylink Data Hub ·
          A product of Ayanfe Innovation Labs Limited.
        </footer>
      </section>

      <style jsx>{`
        .transactions-page {
          min-height: 100vh;
          background: #f3f7fc;
          color: #193451;
          font-family: Arial, sans-serif;
        }

        .transactions-header {
          min-height: 75px;
          padding: 0 7%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          border-bottom: 1px solid #e6edf6;
        }

        .transactions-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #193451;
          text-decoration: none;
          font-size: 23px;
          font-weight: 900;
        }

        .transactions-brand > span:last-child > span {
          color: #0875df;
        }

        .brand-mark {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: linear-gradient(135deg, #087be0, #0756b8);
          color: white;
        }

        .dashboard-link {
          color: #0875df;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }

        .transactions-content {
          width: min(100% - 32px, 900px);
          margin: auto;
          padding: 48px 0 25px;
        }

        .transactions-kicker {
          color: #0875df;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .transactions-intro h1 {
          margin: 10px 0;
          font-size: clamp(27px, 5vw, 36px);
          font-weight: 900;
        }

        .transactions-intro p {
          color: #8291a4;
          font-size: 13px;
          line-height: 1.7;
        }

        .transactions-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin: 27px 0;
        }

        .transactions-summary > div {
          padding: 21px;
          border: 1px solid #e4ecf6;
          border-radius: 15px;
          background: white;
        }

        .transactions-summary span {
          display: block;
          color: #8493a6;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .7px;
        }

        .transactions-summary strong {
          display: block;
          margin-top: 12px;
          color: #193451;
          font-size: 26px;
          font-weight: 900;
        }

        .transactions-card {
          padding: 25px;
          border: 1px solid #e4ecf6;
          border-radius: 18px;
          background: white;
          box-shadow: 0 10px 30px #102c5008;
        }

        .transactions-card-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 20px;
          border-bottom: 1px solid #edf1f7;
        }

        .transactions-card-heading h2 {
          margin: 0 0 7px;
          font-size: 17px;
        }

        .transactions-card-heading p {
          margin: 0;
          color: #8a98aa;
          font-size: 11px;
        }

        .history-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #eaf3ff;
          color: #0875df;
          font-size: 20px;
        }

        .history-empty {
          padding: 55px 15px;
          text-align: center;
          color: #8493a6;
          font-size: 13px;
        }

        .empty-icon {
          margin-bottom: 15px;
          font-size: 35px;
        }

        .history-empty h3 {
          margin: 0 0 10px;
          color: #193451;
          font-size: 18px;
        }

        .history-empty p {
          max-width: 350px;
          margin: 0 auto 20px;
          line-height: 1.8;
          font-size: 12px;
        }

        .history-buy-button {
          display: inline-block;
          padding: 13px 20px;
          border-radius: 10px;
          background: #0875df;
          color: white;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
        }

        .transaction-item {
          padding: 22px 0;
          border-bottom: 1px solid #edf1f7;
        }

        .transaction-item:last-child {
          border-bottom: none;
        }

        .transaction-top,
        .transaction-network,
        .transaction-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .transaction-network {
          justify-content: flex-start;
        }

        .network-badge {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #eaf3ff;
          color: #0875df;
          font-size: 17px;
          font-weight: 900;
        }

        .network-badge.mtn {
          background: #fff1bd;
          color: #d99a00;
        }

        .network-badge.airtel {
          background: #ffe8e9;
          color: #df2938;
        }

        .network-badge.glo {
          background: #e4f8e9;
          color: #159443;
        }

        .network-badge.9mobile {
          background: #e2f7ef;
          color: #078d66;
        }

        .transaction-network strong,
        .transaction-network small {
          display: block;
        }

        .transaction-network strong {
          font-size: 13px;
        }

        .transaction-network small {
          margin-top: 5px;
          color: #8493a6;
          font-size: 10px;
        }

        .transaction-amount {
          color: #0756b8;
          font-size: 17px;
        }

        .transaction-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin: 20px 0;
          padding: 15px;
          border-radius: 11px;
          background: #f7f9fc;
        }

        .transaction-details span,
        .transaction-details strong {
          display: block;
          overflow-wrap: anywhere;
        }

        .transaction-details span {
          margin-bottom: 7px;
          color: #8997a9;
          font-size: 8px;
          font-weight: 800;
        }

        .transaction-details strong {
          color: #354b65;
          font-size: 10px;
        }

        .transaction-status {
          font-size: 10px;
          font-weight: 800;
        }

        .status-success {
          color: #15945d;
        }

        .status-failed {
          color: #d73535;
        }

        .transaction-test-label {
          color: #91a0b2;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .7px;
        }

        .history-notice {
          display: flex;
          gap: 10px;
          margin-top: 22px;
          padding: 15px;
          border: 1px solid #dceaff;
          border-radius: 11px;
          background: #f2f7ff;
          color: #58718d;
          font-size: 10px;
          line-height: 1.8;
        }

        .history-notice span {
          color: #0875df;
        }

        .history-notice p {
          margin: 0;
        }

        .transactions-footer {
          padding: 30px 5px 10px;
          color: #9aa7b6;
          text-align: center;
          font-size: 10px;
        }

        @media (max-width: 600px) {
          .transactions-header {
            min-height: 66px;
            padding: 0 16px;
          }

          .transactions-content {
            padding-top: 35px;
          }

          .transactions-summary {
            gap: 7px;
          }

          .transactions-summary > div {
            padding: 13px 9px;
          }

          .transactions-summary span {
            font-size: 7px;
          }

          .transactions-summary strong {
            font-size: 21px;
          }

          .transactions-card {
            padding: 17px 13px;
          }

          .transaction-details {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </main>
  );
                  }
