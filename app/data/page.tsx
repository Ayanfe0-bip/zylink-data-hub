"use client";

import { useState } from "react";
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

const networks: NetworkCode[] = [
"MTN",
"AIRTEL",
"GLO",
"9MOBILE",
];

export default function DataPage() {
const [network, setNetwork] = useState<NetworkCode | "">("");
const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
const [phone, setPhone] = useState("");
const [notice, setNotice] = useState("");
const [noticeType, setNoticeType] = useState<"success" | "error">("success");
const [isPurchasing, setIsPurchasing] = useState(false);

const plans = network
? MELE_DATA_PLANS.filter((plan) => plan.network === network)
: [];

const validPhone = /^(0\d{10}|234\d{10})$/.test(phone);

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

  try {
    const saved = localStorage.getItem("zylink_transactions");
    const previous: Transaction[] = saved ? JSON.parse(saved) : [];

    localStorage.setItem(
      "zylink_transactions",
      JSON.stringify([transaction, ...previous])
    );
  } catch {
    console.error("Unable to save transaction history.");
  }

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

return (
<main className="zy-data-page">
<header className="data-header">
<Link href="/dashboard" className="data-brand">
<span className="data-brand-mark">Z</span>
<span>zy<span>link</span></span>
</Link>

    <div className="data-header-right">
      <span>DATA HUB</span>
      <Link href="/dashboard" className="back-dashboard">
        ← Dashboard
      </Link>
    </div>
  </header>

  <section className="data-content">
    <div className="data-intro">
      <span className="data-kicker">ZYLINK DATA SERVICES</span>
      <h1>Buy Mobile Data</h1>
      <p>
        Choose your network, select a bundle and enter the
        recipient's phone number.
      </p>
    </div>

    <section className="data-purchase-card">
      <div className="data-card-heading">
        <div>
          <span className="data-step-label">STEP 1</span>
          <h2>Choose your network</h2>
          <p>Select the network you want to recharge.</p>
        </div>
        <span className="data-heading-icon">📱</span>
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

            <strong>{item}</strong>

            {network === item && (
              <span className="network-check">✓</span>
            )}
          </button>
        ))}
      </div>

      {network && (
        <div className="data-form-section">
          <div className="data-section-heading">
            <span className="data-step-label">STEP 2</span>
            <div>
              <h2>Select a data plan</h2>
              <p>
                {plans.length} available bundles for {network}.
              </p>
            </div>
          </div>

          <label htmlFor="data-plan">Available {network} plans</label>

          <select
            id="data-plan"
            className="data-input"
            value={selectedPlan?.planId ?? ""}
            onChange={(event) => {
              const plan = plans.find(
                (item) => item.planId === Number(event.target.value)
              );

              setSelectedPlan(plan || null);
              setPhone("");
              setNotice("");
            }}
          >
            <option value="">Choose your preferred data plan</option>

            {plans.map((plan) => (
              <option key={plan.planId} value={plan.planId}>
                {plan.name} · {plan.validity} · ₦
                {plan.providerPrice.toLocaleString("en-NG")} (
                {plan.category})
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedPlan && (
        <div className="data-form-section">
          <div className="data-section-heading">
            <span className="data-step-label">STEP 3</span>
            <div>
              <h2>Recipient phone number</h2>
              <p>Enter the number that will receive the data.</p>
            </div>
          </div>

          <label htmlFor="phone-number">Phone number</label>

          <input
            id="phone-number"
            className="data-input"
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

          <small className="data-hint">
            Enter an 11-digit Nigerian number or the 234
            international format.
          </small>

          {phone.length > 0 && !validPhone && (
            <span className="data-error">
              Please enter a valid phone number.
            </span>
          )}
        </div>
      )}

      {selectedPlan && validPhone && (
        <div className="data-amount-card">
          <div>
            <span>AMOUNT TO PAY</span>
            <strong>
              ₦{selectedPlan.providerPrice.toLocaleString("en-NG")}
            </strong>
            <small>
              {network} · {selectedPlan.name} · {selectedPlan.validity}
            </small>
          </div>
          <span className="amount-check">✓</span>
        </div>
      )}

      {selectedPlan && validPhone && (
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

      {notice && (
        <div
          className={`data-feedback ${noticeType}`}
          role="status"
          aria-live="polite"
        >
          {notice}
        </div>
      )}

      <div className="data-test-notice">
        <span>ⓘ</span>
        <p>
          Test mode is enabled. No customer payment is collected.
          Purchases are simulated and are not live data deliveries.
        </p>
      </div>
    </section>

    <footer className="data-footer">
      © {new Date().getFullYear()} Zylink Data Hub ·
      A product of Ayanfe Innovation Labs Limited.
    </footer>
  </section>

  <style jsx>{`
    .zy-data-page {
      min-height: 100vh;
      background: #f3f7fc;
      color: #193451;
      font-family: Arial, Helvetica, sans-serif;
    }

    .data-header {
      min-height: 76px;
      padding: 0 7%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      background: #fff;
      border-bottom: 1px solid #e6edf6;
    }

    .data-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #193451;
      text-decoration: none;
      font-size: 23px;
      font-weight: 900;
    }

    .data-brand > span:last-child > span {
      color: #0875df;
    }

    .data-brand-mark {
      width: 39px;
      height: 39px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: linear-gradient(135deg, #087be0, #0756b8);
      color: #fff;
    }

    .data-header-right {
      display: flex;
      align-items: center;
      gap: 22px;
      color: #8293a8;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .back-dashboard {
      color: #0875df;
      text-decoration: none;
      font-size: 12px;
      letter-spacing: 0;
    }

    .data-content {
      width: min(100% - 32px, 850px);
      margin: 0 auto;
      padding: 52px 0 25px;
    }

    .data-intro {
      margin-bottom: 28px;
    }

    .data-kicker,
    .data-step-label {
      color: #0875df;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 1.3px;
    }

    .data-intro h1 {
      margin: 10px 0;
      color: #193451;
      font-size: clamp(27px, 5vw, 37px);
      font-weight: 900;
    }

    .data-intro p {
      max-width: 550px;
      margin: 0;
      color: #8191a5;
      font-size: 13px;
      line-height: 1.8;
    }

    .data-purchase-card {
      padding: 30px;
      border: 1px solid #e4ecf6;
      border-radius: 20px;
      background: #fff;
      box-shadow: 0 12px 35px #102c500b;
    }

    .data-card-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
    }

    .data-card-heading h2,
    .data-section-heading h2 {
      margin: 7px 0 5px;
      color: #193451;
      font-size: 17px;
      font-weight: 900;
    }

    .data-card-heading p,
    .data-section-heading p {
      margin: 0;
      color: #8a99aa;
      font-size: 11px;
      line-height: 1.7;
    }

    .data-heading-icon {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 15px;
      background: #eaf3ff;
      font-size: 23px;
    }

    .data-network-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-top: 25px;
    }

    .data-network-option {
      min-width: 0;
      min-height: 105px;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      border: 1px solid #e4ebf4;
      border-radius: 14px;
      background: #fff;
      color: #43556e;
      font-size: 11px;
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
      width: 37px;
      height: 37px;
      display: grid;
      place-items: center;
      border-radius: 11px;
      font-size: 17px;
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

    .network-symbol.9mobile {
      background: #e2f7ef;
      color: #078d66;
    }

    .network-check {
      position: absolute;
      top: 7px;
      right: 9px;
      color: #0875df;
      font-weight: 900;
    }

    .data-form-section {
      margin-top: 29px;
      padding-top: 25px;
      border-top: 1px solid #edf1f7;
    }

    .data-section-heading {
      display: flex;
      align-items: center;
      gap: 13px;
      margin-bottom: 20px;
    }

    .data-section-heading .data-step-label {
      min-width: 48px;
    }

    .data-form-section label {
      display: block;
      margin-bottom: 9px;
      color: #344a65;
      font-size: 12px;
      font-weight: 800;
    }

    .data-input {
      width: 100%;
      min-height: 53px;
      padding: 0 14px;
      border: 1px solid #dce6f1;
      border-radius: 11px;
      outline: none;
      background: #fbfdff;
      color: #203a59;
      font-family: inherit;
      font-size: 13px;
    }

    .data-input:focus {
      border-color: #0875df;
      box-shadow: 0 0 0 3px #0875df15;
    }

    .data-hint {
      display: block;
      margin-top: 9px;
      color: #8a98aa;
      font-size: 10px;
      line-height: 1.7;
    }

    .data-error {
      display: block;
      margin-top: 8px;
      color: #d73535;
      font-size: 11px;
    }

    .data-amount-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      margin-top: 25px;
      padding: 21px;
      border: 1px solid #cfe3fa;
      border-radius: 14px;
      background: linear-gradient(135deg, #f0f7ff, #e5f2ff);
    }

    .data-amount-card div > span {
      display: block;
      margin-bottom: 8px;
      color: #647b96;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .data-amount-card strong {
      display: block;
      color: #0756b8;
      font-size: 29px;
      font-weight: 900;
    }

    .data-amount-card small {
      display: block;
      margin-top: 7px;
      color: #718096;
      font-size: 10px;
    }

    .amount-check {
      width: 37px;
      height: 37px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: #d9f7e9;
      color: #11945e;
      font-size: 17px;
      font-weight: 900;
    }

    .data-purchase-button {
      width: 100%;
      min-height: 56px;
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
      font-weight: 900;
      cursor: pointer;
    }

    .data-purchase-button:disabled {
      opacity: 0.65;
      cursor: wait;
    }

    .data-purchase-button span {
      font-size: 20px;
    }

    .data-feedback {
      margin-top: 16px;
      padding: 14px;
      border-radius: 10px;
      font-size: 11px;
      line-height: 1.8;
    }

    .data-feedback.success {
      border: 1px solid #ccebd9;
      background: #effbf4;
      color: #187347;
    }

    .data-feedback.error {
      border: 1px solid #f4d1d1;
      background: #fff3f3;
      color: #bd3942;
    }

    .data-test-notice {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-top: 24px;
      padding: 14px;
      border: 1px solid #dceaff;
      border-radius: 11px;
      background: #f2f7ff;
      color: #58718d;
      font-size: 10px;
      line-height: 1.8;
    }

    .data-test-notice > span {
      color: #0875df;
      font-size: 15px;
    }

    .data-test-notice p {
      margin: 0;
    }

    .data-footer {
      padding: 27px 5px 10px;
      color: #9aa7b6;
      text-align: center;
      font-size: 10px;
    }

    @media (max-width: 600px) {
      .data-header {
        min-height: 66px;
        padding: 0 16px;
      }

      .data-brand {
        font-size: 20px;
      }

      .data-header-right {
        gap: 10px;
        font-size: 8px;
      }

      .back-dashboard {
        font-size: 10px;
      }

      .data-content {
        padding-top: 35px;
      }

      .data-purchase-card {
        padding: 21px 15px;
      }

      .data-network-grid {
        gap: 7px;
      }

      .data-network-option {
        min-height: 88px;
        font-size: 9px;
      }

      .network-symbol {
        width: 32px;
        height: 32px;
      }
    }

    @media (max-width: 370px) {
      .data-network-grid {
        gap: 5px;
      }

      .data-network-option {
        min-height: 80px;
        font-size: 8px;
      }

      .data-header-right > span {
        display: none;
      }
    }
  `}</style>
</main>

);
}

import Link from "next/link";
