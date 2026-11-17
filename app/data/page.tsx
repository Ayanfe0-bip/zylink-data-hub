"use client";

import { useEffect, useState } from "react";
import {
  MELE_DATA_PLANS,
  NetworkCode,
  DataPlan,
} from "@/lib/mele-data-plans";

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

type Section =
  | "Dashboard"
  | "Buy Data"
  | "Transaction History"
  | "My Profile"
  | "Settings"
  | "Documentation";

const networks: NetworkCode[] = ["MTN", "AIRTEL", "GLO", "9MOBILE"];

const menuItems = [
  { name: "Dashboard" as Section, icon: "▦" },
  { name: "Buy Data" as Section, icon: "▤" },
  { name: "Transaction History" as Section, icon: "↔" },
];

const accountItems = [
  { name: "My Profile" as Section, icon: "♙" },
  { name: "Settings" as Section, icon: "⚙" },
];

const supportItems = [
  { name: "Documentation" as Section, icon: "▧" },
];

export default function DataPage() {
  const [activeSection, setActiveSection] =
    useState<Section>("Dashboard");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [network, setNetwork] = useState<NetworkCode | "">("");
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [phone, setPhone] = useState("");

  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"success" | "error">("success");
  const [isPurchasing, setIsPurchasing] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  const plans = network
    ? MELE_DATA_PLANS.filter((plan) => plan.network === network)
    : [];

  const validPhone = /^(0\d{10}|234\d{10})$/.test(phone);

  useEffect(() => {
    try {
      const savedTransactions = localStorage.getItem("zylink_transactions");

      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }

      const savedName = localStorage.getItem("zylink_profile_name");
      const savedEmail = localStorage.getItem("zylink_profile_email");

      if (savedName) setProfileName(savedName);
      if (savedEmail) setProfileEmail(savedEmail);
    } catch {
      console.error("Unable to load saved Zylink information.");
    }
  }, []);

  function saveTransactions(items: Transaction[]) {
    setTransactions(items);

    try {
      localStorage.setItem("zylink_transactions", JSON.stringify(items));
    } catch {
      setNotice("Unable to save transaction history on this device.");
      setNoticeType("error");
    }
  }

  function navigate(section: Section) {
    setActiveSection(section);
    setSidebarOpen(false);
    setNotice("");
  }

  function handleNetworkChange(item: NetworkCode) {
    setNetwork(item);
    setSelectedPlan(null);
    setPhone("");
    setNotice("");
  }

  async function handlePurchaseClick() {
    if (!network || !selectedPlan || !validPhone || isPurchasing) {
      return;
    }

    setIsPurchasing(true);
    setNotice("Submitting your test order. Please wait...");
    setNoticeType("success");

    const transactionId =
      "ZYL-" + Date.now().toString(36).toUpperCase();

    try {
      const response = await fetch("/api/mele/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network,
          planId: selectedPlan.planId,
          phone,
        }),
      });

      const result = await response.json();

      const providerResult = result.result || {};

      const reference =
        providerResult.reference ||
        providerResult.ref ||
        providerResult.transaction_id ||
        providerResult.id ||
        transactionId;

      const transaction: Transaction = {
        id: transactionId,
        reference: String(reference),
        network,
        plan: selectedPlan.name,
        phone,
        amount: selectedPlan.providerPrice,
        status: response.ok && result.ok ? "Successful" : "Failed",
        date: new Date().toISOString(),
      };

      saveTransactions([transaction, ...transactions]);

      if (!response.ok || !result.ok) {
        setNotice(
          result.message ||
            "The test order could not be processed. Please try again."
        );
        setNoticeType("error");
        return;
      }

      setNotice(
        "Test order submitted successfully. " +
          (providerResult.message || "Provider request accepted.") +
          " This is a simulated test transaction, not a live purchase."
      );

      setNoticeType("success");
    } catch {
      setNotice(
        "We could not reach the purchase service. Please check your connection."
      );
      setNoticeType("error");
    } finally {
      setIsPurchasing(false);
    }
  }

  function saveProfile() {
    try {
      localStorage.setItem("zylink_profile_name", profileName);
      localStorage.setItem("zylink_profile_email", profileEmail);

      setNotice("Your profile details have been saved on this device.");
      setNoticeType("success");
    } catch {
      setNotice("Unable to save your profile details.");
      setNoticeType("error");
    }
  }

  function handleSignOut() {
    setNotice(
      "Customer authentication is not yet connected. Sign out will become available when we implement secure accounts."
    );
    setNoticeType("error");
  }

  const successfulTransactions = transactions.filter(
    (item) => item.status === "Successful"
  ).length;

  const totalSpent = transactions
    .filter((item) => item.status === "Successful")
    .reduce((total, item) => total + item.amount, 0);

  function renderSidebarItem(item: {
    name: Section;
    icon: string;
  }) {
    return (
      <button
        key={item.name}
        className={`sidebar-link ${
          activeSection === item.name ? "active" : ""
        }`}
        onClick={() => navigate(item.name)}
      >
        <span className="sidebar-icon">{item.icon}</span>
        <span>{item.name}</span>
        {activeSection === item.name && (
          <span className="sidebar-active-mark" />
        )}
      </button>
    );
  }

  function renderDashboard() {
    return (
      <>
        <div className="page-heading">
          <div>
            <span className="page-kicker">OVERVIEW</span>
            <h1>Welcome to Zylink</h1>
            <p>Manage your data purchases and transactions.</p>
          </div>

          <button
            className="primary-button"
            onClick={() => navigate("Buy Data")}
          >
            + Buy Data
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon blue">▤</span>
            <p>Total Transactions</p>
            <h2>{transactions.length}</h2>
            <small>All recorded orders</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon green">✓</span>
            <p>Successful Orders</p>
            <h2>{successfulTransactions}</h2>
            <small>Successfully processed</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon purple">₦</span>
            <p>Recorded Spending</p>
            <h2>₦{totalSpent.toLocaleString("en-NG")}</h2>
            <small>Successful test orders</small>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Quick Services</h2>
              <p>Choose a service to continue.</p>
            </div>
          </div>

          <button
            className="quick-service"
            onClick={() => navigate("Buy Data")}
          >
            <span className="quick-icon">▤</span>
            <span>
              <strong>Buy Mobile Data</strong>
              <small>MTN, Airtel, Glo and 9mobile</small>
            </span>
            <span className="quick-arrow">→</span>
          </button>

          <div className="coming-services">
            <span>Coming later</span>
            Airtime · TV Subscription · Electricity · Education
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Transactions</h2>
              <p>Your latest recorded orders.</p>
            </div>

            <button
              className="text-button"
              onClick={() => navigate("Transaction History")}
            >
              View all →
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-state">
              <span>▤</span>
              <h3>No transactions yet</h3>
              <p>Your data purchase history will appear here.</p>
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.slice(0, 5).map((item) => (
                <TransactionRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  function renderBuyData() {
    return (
      <>
        <div className="page-heading">
          <div>
            <span className="page-kicker">ZYLINK DATA HUB</span>
            <h1>Buy Data</h1>
            <p>Choose your network and bundle. We'll take care of the rest.</p>
          </div>
        </div>

        <section className="purchase-card">
          <div className="purchase-step-heading">
            <span className="step-number">1</span>
            <div>
              <h2>Choose your network</h2>
              <p>Select the mobile network you want to recharge.</p>
            </div>
          </div>

          <div className="data-network-grid">
            {networks.map((item) => (
              <button
                key={item}
                type="button"
                className={`data-network-option ${
                  network === item ? "active" : ""
                }`}
                onClick={() => handleNetworkChange(item)}
                aria-pressed={network === item}
              >
                <span className={`network-symbol ${item.toLowerCase()}`}>
                  {item === "9MOBILE" ? "9" : item.charAt(0)}
                </span>

                <span>{item}</span>

                {network === item && (
                  <span className="selected-check">✓</span>
                )}
              </button>
            ))}
          </div>

          {network && (
            <div className="purchase-step">
              <div className="purchase-step-heading">
                <span className="step-number">2</span>
                <div>
                  <h2>Select a data plan</h2>
                  <p>
                    {plans.length} available bundles for {network}.
                  </p>
                </div>
              </div>

              <label className="field-label" htmlFor="data-plan">
                Available {network} bundles
              </label>

              <select
                id="data-plan"
                className="data-plan-select"
                value={selectedPlan?.planId ?? ""}
                onChange={(event) => {
                  const plan = plans.find(
                    (item) => item.planId === Number(event.target.value)
                  );

                  setSelectedPlan(plan || null);
                  setNotice("");
                }}
              >
                <option value="">Choose your preferred data plan</option>

                {plans.map((plan) => (
                  <option key={plan.planId} value={plan.planId}>
                    {plan.name} • {plan.validity} • ₦
                    {plan.providerPrice.toLocaleString("en-NG")} (
                    {plan.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedPlan && (
            <>
              <div className="purchase-step">
                <div className="purchase-step-heading">
                  <span className="step-number">3</span>
                  <div>
                    <h2>Recipient phone number</h2>
                    <p>Enter the number that should receive this bundle.</p>
                  </div>
                </div>

                <label className="field-label" htmlFor="phone-number">
                  Phone number
                </label>

                <input
                  id="phone-number"
                  className="data-phone-input"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="e.g. 08012345678"
                  value={phone}
                  maxLength={13}
                  onChange={(event) => {
                    setPhone(event.target.value.replace(/\s/g, ""));
                    setNotice("");
                  }}
                />

                <small className="field-hint">
                  Use an 11-digit Nigerian number or the 234 international
                  format.
                </small>

                {phone.length > 0 && !validPhone && (
                  <span className="input-error">
                    Please enter a valid phone number.
                  </span>
                )}
              </div>

              {validPhone && (
                <div className="purchase-amount-card">
                  <div>
                    <span className="amount-label">Amount to pay</span>

                    <strong className="amount-value">
                      ₦{selectedPlan.providerPrice.toLocaleString("en-NG")}
                    </strong>

                    <small>
                      {network} · {selectedPlan.name} ·{" "}
                      {selectedPlan.validity}
                    </small>
                  </div>

                  <span className="amount-check">✓</span>
                </div>
              )}

              {validPhone && (
                <button
                  type="button"
                  className="data-purchase-button"
                  onClick={handlePurchaseClick}
                  disabled={isPurchasing}
                >
                  {isPurchasing ? "Processing test order..." : "Purchase Now"}
                  <span>{isPurchasing ? "…" : "→"}</span>
                </button>
              )}
            </>
          )}

          {notice && (
            <div
              className={`purchase-feedback ${noticeType}`}
              role="status"
              aria-live="polite"
            >
              {notice}
            </div>
          )}

          <div className="testing-notice">
            <span>ⓘ</span>
            <p>
              Test mode is enabled. No customer payment is collected. Only
              the provider's simulated test service is called; live purchases
              are disabled.
            </p>
          </div>
        </section>
      </>
    );
  }

  function renderHistory() {
    return (
      <>
        <div className="page-heading">
          <div>
            <span className="page-kicker">YOUR ACTIVITY</span>
            <h1>Transaction History</h1>
            <p>View your recorded data purchase orders.</p>
          </div>
        </div>

        <div className="dashboard-panel">
          {transactions.length === 0 ? (
            <div className="empty-state">
              <span>▤</span>
              <h3>No transactions yet</h3>
              <p>Your orders will appear here after a purchase attempt.</p>
              <button
                className="primary-button"
                onClick={() => navigate("Buy Data")}
              >
                Buy Data
              </button>
            </div>
          ) : (
            <>
              <div className="history-summary">
                <div>
                  <strong>{transactions.length}</strong>
                  <small>Total orders</small>
                </div>

                <div>
                  <strong>{successfulTransactions}</strong>
                  <small>Successful orders</small>
                </div>

                <div>
                  <strong>
                    ₦{totalSpent.toLocaleString("en-NG")}
                  </strong>
                  <small>Recorded spending</small>
                </div>
              </div>

              <div className="transaction-list">
                {transactions.map((item) => (
                  <TransactionRow key={item.id} item={item} />
                ))}
              </div>

              <p className="local-storage-note">
                These records are currently stored on this device.
              </p>
            </>
          )}
        </div>
      </>
    );
  }

  function renderProfile() {
    return (
      <>
        <div className="page-heading">
          <div>
            <span className="page-kicker">ACCOUNT</span>
            <h1>My Profile</h1>
            <p>Manage your basic profile information.</p>
          </div>
        </div>

        <div className="dashboard-panel form-panel">
          <div className="profile-avatar">Z</div>

          <label className="field-label" htmlFor="profile-name">
            Full name
          </label>

          <input
            id="profile-name"
            className="dashboard-input"
            value={profileName}
            onChange={(event) => setProfileName(event.target.value)}
            placeholder="Enter your full name"
          />

          <label className="field-label" htmlFor="profile-email">
            Email address
          </label>

          <input
            id="profile-email"
            className="dashboard-input"
            type="email"
            value={profileEmail}
            onChange={(event) => setProfileEmail(event.target.value)}
            placeholder="Enter your email address"
          />

          <button className="primary-button save-button" onClick={saveProfile}>
            Save Profile
          </button>

          <p className="local-storage-note">
            Profile information is currently saved only on this device.
            Secure account registration will be added later.
          </p>
        </div>
      </>
    );
  }

  function renderSettings() {
    return (
      <>
        <div className="page-heading">
          <div>
            <span className="page-kicker">PREFERENCES</span>
            <h1>Settings</h1>
            <p>Manage your Zylink preferences.</p>
          </div>
        </div>

        <div className="dashboard-panel settings-panel">
          <div className="settings-row">
            <div>
              <strong>Account security</strong>
              <p>Secure customer login is coming soon.</p>
            </div>
            <span className="coming-badge">Coming soon</span>
          </div>

          <div className="settings-row">
            <div>
              <strong>Notifications</strong>
              <p>Transaction notifications will be available later.</p>
            </div>
            <span className="coming-badge">Coming soon</span>
          </div>

          <div className="settings-row">
            <div>
              <strong>Payment preferences</strong>
              <p>Payment methods will be configured after integration.</p>
            </div>
            <span className="coming-badge">Coming soon</span>
          </div>
        </div>
      </>
    );
  }

  function renderDocumentation() {
    return (
      <>
        <div className="page-heading">
          <div>
            <span className="page-kicker">HELP CENTRE</span>
            <h1>Zylink Documentation</h1>
            <p>Learn how to use the Zylink Data Hub.</p>
          </div>
        </div>

        <div className="dashboard-panel documentation-panel">
          <div className="doc-item">
              <span className="doc-icon">01</span>
            <div>
              <h3>How to buy data</h3>
              <p>
                Select your network, choose a data bundle, enter the
                recipient's phone number and continue.
              </p>
            </div>
          </div>

          <div className="doc-item">
            <span className="doc-icon">02</span>
            <div>
              <h3>Transaction history</h3>
              <p>
                Visit Transaction History to review purchase attempts
                recorded on your device.
              </p>
            </div>
          </div>

          <div className="doc-item">
            <span className="doc-icon">03</span>
            <div>
              <h3>Supported networks</h3>
              <p>MTN, Airtel, Glo and 9mobile data bundles are available.</p>
            </div>
          </div>

          <div className="doc-item">
            <span className="doc-icon">04</span>
            <div>
              <h3>Testing mode</h3>
              <p>
                Current purchases use the provider's simulated test
                environment. They are not live customer purchases.
              </p>
            </div>
          </div>

          <div className="doc-item">
            <span className="doc-icon">05</span>
            <div>
              <h3>More services</h3>
              <p>
                Airtime, electricity, TV subscriptions and other services
                are planned for future releases.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <main className="zylink-dashboard">
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <a href="/" className="sidebar-brand">
          <span className="brand-symbol">Z</span>
          <span>zylink</span>
        </a>

        <div className="sidebar-section">
          <span className="sidebar-label">MAIN MENU</span>
          {menuItems.map(renderSidebarItem)}
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">MY ACCOUNT</span>
          {accountItems.map(renderSidebarItem)}
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">SUPPORT</span>
          {supportItems.map(renderSidebarItem)}
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span>ⓘ</span>
            <div>
              <strong>Need help?</strong>
              <small>We're here to help.</small>
            </div>
          </div>

          <button className="sidebar-link signout-link" onClick={handleSignOut}>
            <span className="sidebar-icon">⇥</span>
            <span>Sign Out</span>
          </button>

          <div className="sidebar-version">Zylink Data Hub · Test Mode</div>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            ☰
          </button>

          <div className="topbar-title">
            <span>ZYLINK DATA HUB</span>
            <strong>{activeSection}</strong>
          </div>

          <button
            className="topbar-profile"
            onClick={() => navigate("My Profile")}
          >
            <span className="topbar-avatar">Z</span>
            <span className="topbar-profile-name">
              {profileName || "My Account"}
            </span>
          </button>
        </header>

        <div className="dashboard-content">
          {activeSection === "Dashboard" && renderDashboard()}
          {activeSection === "Buy Data" && renderBuyData()}
          {activeSection === "Transaction History" && renderHistory()}
          {activeSection === "My Profile" && renderProfile()}
          {activeSection === "Settings" && renderSettings()}
          {activeSection === "Documentation" && renderDocumentation()}
        </div>

        <footer className="dashboard-footer">
          <span>© {new Date().getFullYear()} Zylink Data Hub</span>
          <span>Where connections begin.</span>
        </footer>
      </section>

      <style jsx global>
        .zylink-dashboard {
          min-height: 100vh;
          display: flex;
          background: #f4f7fc;
          color: #193451;
          font-family: Arial, sans-serif;
        }

        .dashboard-sidebar {
          width: 255px;
          min-width: 255px;
          min-height: 100vh;
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 25px 17px 17px;
          background: #fff;
          border-right: 1px solid #e8eef6;
          z-index: 30;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          margin: 0 0 38px 7px;
          color: #0756b8;
          text-decoration: none;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: -1.3px;
        }

        .brand-symbol {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: white;
          background: linear-gradient(135deg, #087be0, #06418e);
          box-shadow: 0 6px 14px #0875df30;
        }

        .sidebar-section {
          margin-bottom: 27px;
        }

        .sidebar-label {
          display: block;
          margin: 0 0 11px 11px;
          color: #98a7b9;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .sidebar-link {
          width: 100%;
          min-height: 45px;
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 5px;
          padding: 0 12px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #687b91;
          text-align: left;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .sidebar-link:hover {
          background: #f1f6fd;
          color: #0756b8;
        }

        .sidebar-link.active {
          background: #eaf3ff;
          color: #0756b8;
          font-weight: 800;
        }

        .sidebar-icon {
          width: 23px;
          font-size: 19px;
          text-align: center;
        }

        .sidebar-active-mark {
          width: 4px;
          height: 24px;
          position: absolute;
          right: 0;
          border-radius: 5px 0 0 5px;
          background: #0875df;
        }

        .sidebar-bottom {
          margin-top: auto;
        }

        .sidebar-help {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding: 14px 10px;
          border-radius: 12px;
          background: #f1f7ff;
          color: #0756b8;
        }

        .sidebar-help > span {
          font-size: 22px;
        }

        .sidebar-help strong,
        .sidebar-help small {
          display: block;
        }

        .sidebar-help strong {
          font-size: 12px;
        }

        .sidebar-help small {
          margin-top: 4px;
          color: #8292a6;
          font-size: 10px;
        }

        .signout-link {
          color: #d14c55;
        }

        .signout-link:hover {
          background: #fff0f0;
          color: #bd303b;
        }

        .sidebar-version {
          margin: 15px 5px 0;
          color: #a2adbb;
          font-size: 10px;
        }

        .dashboard-main {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .dashboard-topbar {
          height: 75px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 35px;
          background: #fff;
          border-bottom: 1px solid #e8eef6;
        }

        .topbar-title span,
        .topbar-title strong {
          display: block;
        }

        .topbar-title span {
          margin-bottom: 5px;
          color: #98a7b9;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .topbar-title strong {
          color: #193451;
          font-size: 15px;
        }

        .topbar-profile {
          display: flex;
          align-items: center;
          gap: 9px;
          border: 0;
          background: transparent;
          color: #40546c;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .topbar-avatar {
          width: 35px;
          height: 35px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #e5f1ff;
          color: #0756b8;
          font-weight: 900;
        }

        .mobile-menu-button {
          display: none;
          border: 0;
          background: transparent;
          color: #0756b8;
          font-size: 23px;
          cursor: pointer;
        }

        .dashboard-content {
          width: 100%;
          max-width: 1250px;
          flex: 1;
          margin: 0 auto;
          padding: 36px;
        }

        .page-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
        }

        .page-kicker {
          color: #0875df;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.7px;
        }

        .page-heading h1 {
          margin: 9px 0;
          color: #193451;
          font-size: clamp(25px, 4vw, 34px);
          font-weight: 900;
          letter-spacing: -1.2px;
        }

        .page-heading p {
          margin: 0;
          color: #8392a5;
          font-size: 13px;
          line-height: 1.7;
        }

        .primary-button {
          min-height: 43px;
          padding: 0 19px;
          border: 0;
          border-radius: 10px;
          background: linear-gradient(120deg, #087be0, #0756b8);
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 6px 15px #0756b829;
        }

        .primary-button:hover {
          filter: brightness(1.07);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 17px;
          margin-bottom: 23px;
        }

        .stat-card,
        .dashboard-panel {
          border: 1px solid #e7edf5;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 7px 22px #173b5c08;
        }

        .stat-card {
          min-width: 0;
          padding: 21px;
        }

        .stat-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          font-size: 17px;
          font-weight: 900;
        }

        .stat-icon.blue {
          background: #eaf3ff;
          color: #0875df;
        }

        .stat-icon.green {
          background: #e6f8ef;
          color: #14945c;
        }

        .stat-icon.purple {
          background: #f1eaff;
          color: #8655d8;
        }

        .stat-card p {
          margin: 16px 0 7px;
          color: #7b8ca1;
          font-size: 12px;
        }

        .stat-card h2 {
          margin: 0;
          color: #193451;
          font-size: 25px;
          overflow-wrap: anywhere;
        }

        .stat-card small {
          display: block;
          margin-top: 7px;
          color: #a1adbb;
          font-size: 10px;
        }

        .dashboard-panel {
          margin-bottom: 22px;
          padding: 24px;
        }

        .panel-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .panel-heading h2 {
          margin: 0;
          color: #193451;
          font-size: 17px;
        }

        .panel-heading p {
          margin: 6px 0 0;
          color: #91a0b1;
          font-size: 11px;
        }

        .text-button {
          border: 0;
          background: transparent;
          color: #0875df;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .quick-service {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 15px;
          border: 1px solid #e7edf5;
          border-radius: 12px;
          background: #fff;
          text-align: left;
          cursor: pointer;
        }

        .quick-service:hover {
          border-color: #9fc8f4;
          background: #f7fbff;
        }

        .quick-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #eaf3ff;
          color: #0875df;
          font-size: 20px;
        }

        .quick-service strong,
        .quick-service small {
          display: block;
        }

        .quick-service strong {
          color: #193451;
          font-size: 13px;
        }

        .quick-service small {
          margin-top: 5px;
          color: #92a0b0;
          font-size: 10px;
        }

        .quick-arrow {
          margin-left: auto;
          color: #0875df;
          font-size: 20px;
        }

        .coming-services {
          margin-top: 15px;
          color: #93a0af;
          font-size: 11px;
          line-height: 1.8;
        }

        .coming-services span {
          display: inline-block;
          margin-right: 9px;
          padding: 4px 8px;
          border-radius: 20px;
          background: #fff5df;
          color: #a87921;
          font-size: 9px;
          font-weight: 800;
        }

        .empty-state {
          padding: 36px 15px;
          text-align: center;
        }

        .empty-state > span {
          color: #a9c9ed;
          font-size: 35px;
        }

        .empty-state h3 {
          margin: 12px 0 7px;
          color: #193451;
          font-size: 15px;
        }

        .empty-state p {
          margin: 0 0 17px;
          color: #8b9aab;
          font-size: 11px;
          line-height: 1.7;
        }

        .transaction-list {
          display: flex;
          flex-direction: column;
        }

        .transaction-row {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px 0;
          border-bottom: 1px solid #edf1f6;
        }

        .transaction-row:last-child {
          border-bottom: 0;
        }

        .transaction-network-icon {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 12px;
          background: #edf5ff;
          color: #0756b8;
          font-size: 12px;
          font-weight: 900;
        }

        .transaction-details {
          min-width: 0;
          flex: 1;
        }

        .transaction-details strong {
          display: block;
          color: #28425f;
          font-size: 12px;
        }

        .transaction-details small {
          display: block;
          margin-top: 5px;
          color: #9aa7b6;
          font-size: 10px;
          overflow-wrap: anywhere;
        }

        .transaction-right {
          text-align: right;
        }

        .transaction-right strong {
          display: block;
          color: #193451;
          font-size: 12px;
        }

        .status-badge {
          display: inline-block;
          margin-top: 6px;
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 800;
        }

        .status-badge.success {
          background: #e7f8ef;
          color: #168452;
        }

        .status-badge.failed {
          background: #fff0f0;
          color: #cb414b;
        }

        .history-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 15px;
          padding-bottom: 20px;
          border-bottom: 1px solid #edf1f6;
        }

        .history-summary div {
          min-width: 0;
        }

        .history-summary strong,
        .history-summary small {
          display: block;
        }

        .history-summary strong {
          color: #0756b8;
          font-size: 19px;
          overflow-wrap: anywhere;
        }

        .history-summary small {
          margin-top: 6px;
          color: #95a2b1;
          font-size: 10px;
        }

        .local-storage-note {
          margin: 18px 0 0;
          color: #9aa7b6;
          font-size: 10px;
          line-height: 1.7;
        }

        .purchase-card {
          max-width: 760px;
          padding: 30px;
          border: 1px solid #e5edf7;
          border-radius: 19px;
          background: #fff;
          box-shadow: 0 12px 35px #102c500c;
        }

        .purchase-step-heading {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 21px;
        }

        .step-number {
          width: 37px;
          height: 37px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 12px;
          background: #eaf3ff;
          color: #0756b8;
          font-size: 15px;
          font-weight: 800;
        }

        .purchase-step-heading h2 {
          margin: 0;
          color: #193451;
          font-size: 16px;
          font-weight: 800;
        }

        .purchase-step-heading p {
          margin: 5px 0 0;
          color: #8290a3;
          font-size: 11px;
          line-height: 1.6;
        }

        .data-network-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 30px;
        }

        .data-network-option {
          min-width: 0;
          min-height: 96px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 1px solid #e4ebf4;
          border-radius: 13px;
          background: #fff;
          color: #43556e;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .data-network-option:hover {
          border-color: #8bbcf0;
          background: #f8fbff;
        }

        .data-network-option.active {
          border: 2px solid #0875df;
          background: #f0f7ff;
          color: #0756b8;
        }

        .network-symbol {
          width: 35px;
          height: 35px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          font-size: 16px;
          font-weight: 900;
        }

        .network-symbol.mtn {
          background: #fff1bd;
          color: #d99a00;
        }

        .network-symbol.airtel {
          background: #ffe8e9;
          color: #df2938;
        }

        .network-symbol.glo {
          background: #e4f8e9;
          color: #159443;
        }

        .network-symbol[class~="9mobile"] {
          background: #e2f7ef;
          color: #078d66;
        }

        
        .selected-check {
          position: absolute;
          top: 6px;
          right: 7px;
          color: #0875df;
          font-size: 12px;
        }

        .purchase-step {
          margin-top: 27px;
          padding-top: 25px;
          border-top: 1px solid #edf1f7;
        }

        .field-label {
          display: block;
          margin: 0 0 10px;
          color: #344a65;
          font-size: 12px;
          font-weight: 800;
        }

        .data-plan-select,
        .data-phone-input,
        .dashboard-input {
          width: 100%;
          min-height: 52px;
          padding: 0 14px;
          border: 1px solid #dce6f1;
          border-radius: 11px;
          outline: none;
          background: #fbfdff;
          color: #203a59;
          font-family: inherit;
          font-size: 13px;
        }

        .data-plan-select:focus,
        .data-phone-input:focus,
        .dashboard-input:focus {
          border-color: #0875df;
          box-shadow: 0 0 0 3px #0875df15;
        }

        .field-hint {
          display: block;
          margin-top: 9px;
          color: #8a98aa;
          font-size: 10px;
          line-height: 1.6;
        }

        .input-error {
          display: block;
          margin-top: 8px;
          color: #d73535;
          font-size: 11px;
        }

        .purchase-amount-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 25px;
          padding: 20px;
          border: 1px solid #cfe3fa;
          border-radius: 14px;
          background: linear-gradient(135deg, #f0f7ff, #e5f2ff);
        }

        .amount-label {
          display: block;
          margin-bottom: 7px;
          color: #647b96;
          font-size: 11px;
          font-weight: 700;
        }

        .amount-value {
          display: block;
          color: #0756b8;
          font-size: 29px;
          font-weight: 900;
        }

        .purchase-amount-card small {
          display: block;
          margin-top: 7px;
          color: #718096;
          font-size: 10px;
        }

        .amount-check {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #d9f7e9;
          color: #11945e;
          font-size: 17px;
          font-weight: 800;
        }

        .data-purchase-button {
          width: 100%;
          min-height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 18px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(120deg, #087be0, #0756b8);
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .data-purchase-button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .data-purchase-button span {
          font-size: 19px;
        }

        .purchase-feedback {
          margin-top: 16px;
          padding: 13px;
          border-radius: 10px;
          font-size: 11px;
          line-height: 1.7;
        }

        .purchase-feedback.success {
          border: 1px solid #ccebd9;
          background: #effbf4;
          color: #187347;
        }

        .purchase-feedback.error {
          border: 1px solid #f4d1d1;
          background: #fff3f3;
          color: #bd3942;
        }

        .testing-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 23px;
          padding: 14px;
          border: 1px solid #dceaff;
          border-radius: 11px;
          background: #f2f7ff;
          color: #58718d;
          font-size: 10px;
          line-height: 1.7;
        }

        .testing-notice > span {
          color: #0875df;
          font-size: 15px;
        }

        .testing-notice p {
          margin: 0;
        }

        .form-panel {
          max-width: 580px;
        }

        .profile-avatar {
          width: 65px;
          height: 65px;
          display: grid;
          place-items: center;
          margin-bottom: 24px;
          border-radius: 20px;
          background: #eaf3ff;
          color: #0756b8;
          font-size: 30px;
          font-weight: 900;
        }

        .form-panel .field-label {
          margin-top: 19px;
        }

        .save-button {
          margin-top: 22px;
        }

        .settings-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 19px 0;
          border-bottom: 1px solid #edf1f6;
        }

        .settings-row:last-child {
          border-bottom: 0;
        }

        .settings-row strong {
          color: #29425e;
          font-size: 13px;
        }

        .settings-row p {
          margin: 6px 0 0;
          color: #93a0af;
          font-size: 11px;
          line-height: 1.6;
        }

        .coming-badge {
          flex-shrink: 0;
          padding: 7px 9px;
          border-radius: 20px;
          background: #fff5df;
          color: #a87921;
          font-size: 9px;
          font-weight: 800;
        }

        .doc-item {
          display: flex;
          gap: 15px;
          padding: 17px 0;
          border-bottom: 1px solid #edf1f6;
        }

        .doc-item:last-child {
          border-bottom: 0;
        }

        .doc-icon {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 11px;
          background: #eaf3ff;
          color: #0756b8;
          font-size: 12px;
          font-weight: 900;
        }

        .doc-item h3 {
          margin: 0;
          color: #29425e;
          font-size: 13px;
        }

        .doc-item p {
          margin: 6px 0 0;
          color: #8796a8;
          font-size: 11px;
          line-height: 1.8;
        }

        .dashboard-footer {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 35px;
          border-top: 1px solid #e8eef6;
          background: #fff;
          color: #9aa7b6;
          font-size: 10px;
        }

        .sidebar-overlay {
          display: none;
        }

        @media (max-width: 850px) {
          .dashboard-sidebar {
            width: 235px;
            min-width: 235px;
          }

          .dashboard-content {
            padding: 25px 20px;
          }

          .dashboard-topbar {
            padding: 0 20px;
          }

          .stats-grid {
            gap: 10px;
          }

          .stat-card {
            padding: 16px;
          }
        }

        @media (max-width: 650px) {
          .dashboard-sidebar {
            width: 270px;
            min-width: 270px;
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            height: 100dvh;
            transform: translateX(-105%);
            transition: transform 0.25s ease;
            box-shadow: 12px 0 35px #102c5015;
          }

            .dashboard-sidebar.open {
            transform: translateX(0);
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 29;
            border: 0;
            background: #102c5066;
          }

          .mobile-menu-button {
            display: block;
          }

          .dashboard-topbar {
            height: 68px;
            justify-content: flex-start;
            gap: 14px;
            padding: 0 15px;
          }

          .topbar-title {
            flex: 1;
          }

          .topbar-profile-name {
            display: none;
          }

          .dashboard-content {
            padding: 25px 15px;
          }

          .page-heading {
            align-items: flex-start;
          }

          .page-heading h1 {
            font-size: 27px;
          }

          .page-heading p {
            font-size: 11px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 17px;
          }

          .stat-card p {
            margin-top: 10px;
          }

          .dashboard-panel {
            padding: 18px 15px;
          }

          .purchase-card {
            padding: 21px 15px;
          }

          .data-network-grid {
            gap: 7px;
          }

          .data-network-option {
            min-height: 85px;
            font-size: 9px;
          }

          .network-symbol {
            width: 31px;
            height: 31px;
          }

          .history-summary {
            gap: 7px;
          }

          .history-summary strong {
            font-size: 15px;
          }

          .history-summary small {
            font-size: 9px;
          }

          .transaction-row {
            gap: 9px;
          }

          .transaction-network-icon {
            width: 34px;
            height: 34px;
          }

          .transaction-details strong,
          .transaction-right strong {
            font-size: 10px;
          }

          .transaction-details small {
            font-size: 9px;
          }

          .dashboard-footer {
            padding: 16px;
            font-size: 9px;
          }
        }

        @media (max-width: 370px) {
          .dashboard-content {
            padding: 20px 11px;
          }

          .purchase-card {
            padding: 18px 12px;
          }

          .page-heading h1 {
            font-size: 24px;
          }

          .data-network-grid {
            gap: 5px;
          }

          .data-network-option {
            min-height: 78px;
            font-size: 8px;
          }

          .history-summary strong {
            font-size: 13px;
          }
        }
      `}</style>
    </main>
  );
}

function TransactionRow({ item }: { item: Transaction }) {
  return (
    <div className="transaction-row">
      <span className="transaction-network-icon">
        {item.network === "9MOBILE" ? "9" : item.network.charAt(0)}
      </span>

      <div className="transaction-details">
        <strong>
          {item.network} · {item.plan}
        </strong>

        <small>
          {item.phone} · {item.reference}
        </small>

        <small>
          {new Date(item.date).toLocaleString("en-NG")}
        </small>
      </div>

      <div className="transaction-right">
        <strong>₦{item.amount.toLocaleString("en-NG")}</strong>

        <span
          className={`status-badge ${
            item.status === "Successful" ? "success" : "failed"
          }`}
        >
          {item.status}
        </span>
      </div>
    </div>
  );
}
          
       
