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
  
