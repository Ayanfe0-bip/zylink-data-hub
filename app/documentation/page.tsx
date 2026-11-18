"use client";
import Link from "next/link";

export default function DocumentationPage() {
  const sections = [
    {
      number: "01",
      title: "Getting Started",
      text: "Create an account or sign in to access your Zylink Data Hub dashboard. Your dashboard gives you access to data purchases, transactions, your profile and account settings.",
      steps: [
        "Open the Zylink website.",
        "Register with your details if you are a new customer.",
        "Sign in with your registered email and password.",
        "You will be taken to your dashboard.",
      ],
    },
    {
      number: "02",
      title: "How to Buy Data",
      text: "Buying data is simple. Follow these steps to submit a data purchase.",
      steps: [
        "Click Buy Data from your dashboard.",
        "Choose your preferred network: MTN, Airtel, Glo or 9mobile.",
        "Select the data bundle you want.",
        "Enter the recipient's phone number correctly.",
        "Review the network, plan, phone number and amount.",
        "Click Purchase Now to submit your order.",
      ],
    },
    {
      number: "03",
      title: "Transaction History",
      text: "Your Transaction History page helps you review data purchase records made on your device.",
      steps: [
        "Open Transaction History from the sidebar.",
        "Review your recorded transactions.",
        "Check the network, data plan, phone number and transaction status.",
      ],
    },
    {
      number: "04",
      title: "Managing Your Profile",
      text: "Keep your personal information up to date.",
      steps: [
        "Open My Profile from the sidebar.",
        "Update your full name or phone number.",
        "Save your changes.",
        "Your registered email address is displayed as your account email.",
      ],
    },
    {
      number: "05",
      title: "Account Settings",
      text: "Your Settings page helps you manage your account security.",
      steps: [
        "Open Settings from the sidebar.",
        "Enter your new password.",
        "Confirm your new password.",
        "Click Update Password to save it.",
        "Use Sign Out when you want to leave your account.",
      ],
    },
    {
      number: "06",
      title: "Understanding Test Mode",
      text: "Zylink currently uses a test-mode data purchase integration. This allows us to test the purchase process before launching real transactions.",
      steps: [
        "Test purchases are simulated.",
        "No real data bundle is delivered through test mode.",
        "No real customer payment is collected through the test purchase flow.",
        "A successful test transaction does not mean a live data purchase has occurred.",
      ],
    },
  ];

  return (
    <main className="doc-page">
      <header className="doc-header">
        <Link href="/dashboard" className="doc-brand">
          <span className="doc-logo">Z</span>
          <span>
            <strong>Zylink</strong>
            <small>DATA HUB</small>
          </span>
        </Link>

        <Link href="/dashboard" className="doc-back">
          ← Back to Dashboard
        </Link>
      </header>

      <section className="doc-hero">
        <span className="doc-label">HELP CENTRE</span>
        <h1>How can we help you?</h1>
        <p>
          Everything you need to know about using Zylink Data Hub,
          managing your account and purchasing data.
        </p>
      </section>

      <section className="doc-content">
        <div className="doc-intro">
          <div>
            <span className="doc-label">USER GUIDE</span>
            <h2>Welcome to Zylink Documentation</h2>
            <p>
              Follow these simple guides to get the best experience
              from Zylink Data Hub.
            </p>
          </div>
          <div className="doc-book">▤</div>
        </div>

        <div className="doc-grid">
          {sections.map((section) => (
            <article className="doc-card" key={section.number}>
              <div className="doc-card-top">
                <span className="doc-number">{section.number}</span>
                <span className="doc-icon">✓</span>
              </div>

              <h3>{section.title}</h3>
              <p>{section.text}</p>

              <ol>
                {section.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>

        <div className="doc-notice">
          <span>ⓘ</span>
          <div>
            <strong>Important Notice</strong>
            <p>
              Zylink is currently undergoing testing. Data purchases
              are simulated, and live vending and payment services
              will be introduced after testing and integration are
              completed.
            </p>
          </div>
        </div>

        <div className="doc-support">
          <div>
            <span className="doc-label">NEED MORE HELP?</span>
            <h2>We're here to help.</h2>
            <p>
              If you experience difficulties using Zylink, contact
              our support team for assistance.
            </p>
          </div>

          <a href="mailto:bizstarter.support@gmail.com">
            Contact Support →
          </a>
        </div>
      </section>

      <footer className="doc-footer">
        <strong>Zylink Data Hub</strong>
        <span>Created by Ayanfe Innovation Labs Limited.</span>
        <small>© 2026 Zylink. All rights reserved.</small>
      </footer>

      <style jsx>{`
        .doc-page {
          min-height: 100vh;
          background: #f4f8fc;
          color: #152b45;
          font-family: Arial, sans-serif;
        }

        .doc-header {
          height: 76px;
          padding: 0 7%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border-bottom: 1px solid #e5edf5;
        }

        .doc-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #123c70;
        }

        .doc-logo {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #0866c6;
          color: white;
          display: grid;
          place-items: center;
          font-size: 23px;
          font-weight: 800;
        }

        .doc-brand strong {
          display: block;
          font-size: 19px;
        }

        .doc-brand small {
          display: block;
          font-size: 9px;
          letter-spacing: 2px;
          color: #66809d;
        }

        .doc-back {
          color: #0866c6;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }

        .doc-hero {
          padding: 65px 20px 75px;
          text-align: center;
          background: linear-gradient(130deg, #0756a8, #087ee0);
          color: white;
        }

        .doc-label {
          display: inline-block;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #1680dc;
        }

        .doc-hero .doc-label {
          color: #c5e4ff;
        }

        .doc-hero h1 {
          margin: 17px 0 12px;
          font-size: clamp(29px, 5vw, 43px);
        }

        .doc-hero p {
          max-width: 590px;
          margin: auto;
          line-height: 1.8;
          color: #e2f1ff;
          font-size: 14px;
        }

        .doc-content {
          max-width: 1100px;
          margin: -25px auto 0;
          padding: 0 20px 55px;
        }

        .doc-intro {
          background: white;
          border-radius: 16px;
          padding: 27px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          box-shadow: 0 8px 30px #123c7010;
        }

        .doc-intro h2 {
          margin: 10px 0;
          font-size: 23px;
        }

        .doc-intro p {
          color: #71849a;
          font-size: 13px;
          line-height: 1.7;
        }

        .doc-book {
          width: 65px;
          height: 65px;
          border-radius: 16px;
          background: #eaf4ff;
          color: #0866c6;
          display: grid;
          place-items: center;
          font-size: 30px;
          flex-shrink: 0;
        }

        .doc-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-top: 25px;
        }

        .doc-card {
          background: white;
          padding: 25px;
          border-radius: 15px;
          border: 1px solid #e7eef6;
          box-shadow: 0 5px 20px #123c7008;
        }

        .doc-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .doc-number {
          color: #0871cf;
          font-size: 12px;
          font-weight: 800;
          background: #eaf4ff;
          padding: 8px 12px;
          border-radius: 8px;
        }

        .doc-icon {
          color: #168b63;
          background: #e8f8f1;
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 50%;
        }

        .doc-card h3 {
          margin: 19px 0 10px;
          font-size: 18px;
        }

        .doc-card p {
          color: #6e8095;
          font-size: 13px;
          line-height: 1.7;
        }

        .doc-card ol {
          padding-left: 20px;
          margin-top: 17px;
        }

        .doc-card li {
          padding: 5px 0 5px 4px;
          color: #344d68;
          font-size: 12px;
          line-height: 1.7;
        }

        .doc-notice {
          display: flex;
          gap: 15px;
          padding: 22px;
          margin-top: 25px;
          border-radius: 13px;
          background: #fff8e8;
          border: 1px solid #f4e4bd;
          color: #795718;
        }

        .doc-notice > span {
          font-size: 22px;
        }

        .doc-notice p {
          font-size: 12px;
          line-height: 1.8;
          margin: 8px 0 0;
        }

        .doc-support {
          margin-top: 25px;
          padding: 30px;
          background: #eaf4ff;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .doc-support h2 {
          margin: 10px 0;
        }

        .doc-support p {
          color: #60758c;
          font-size: 13px;
          line-height: 1.7;
        }

        .doc-support a {
          display: inline-block;
          padding: 13px 19px;
          background: #0866c6;
          color: white;
          text-decoration: none;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .doc-footer {
          background: white;
          border-top: 1px solid #e5edf5;
          padding: 25px 7%;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          color: #71849a;
          font-size: 11px;
        }

        .doc-footer strong {
          color: #0866c6;
        }

        @media (max-width: 650px) {
          .doc-header {
            padding: 0 18px;
          }

          .doc-hero {
            padding: 50px 20px 65px;
          }

          .doc-grid {
            grid-template-columns: 1fr;
          }

          .doc-intro {
            padding: 22px;
          }

          .doc-support {
            align-items: flex-start;
            flex-direction: column;
          }

          .doc-footer {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </main>
  );
}
