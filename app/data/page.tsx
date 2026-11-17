"use client";

import { useState } from "react";
import {
  MELE_DATA_PLANS,
  NetworkCode,
  DataPlan,
} from "@/lib/mele-data-plans";

const networks: NetworkCode[] = ["MTN", "AIRTEL", "GLO", "9MOBILE"];

export default function DataPage() {
  const [network, setNetwork] = useState<NetworkCode | "">("");
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [phone, setPhone] = useState("");
  const [notice, setNotice] = useState("");

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

  function handlePurchaseClick() {
    setNotice(
      "Your order details are ready. Purchase testing will be connected next; no data has been purchased."
    );
  }

  return (
    <main className="data-page">
      <header className="data-header">
        <a href="/" className="data-brand">
          <span className="data-brand-mark">Z</span>
          <span>zylink</span>
        </a>
        <a href="/" className="back-home">← Back home</a>
      </header>

      <section className="data-container">
        <div className="data-intro">
          <span className="data-kicker">ZYLINK DATA HUB</span>
          <h1>Buy Data</h1>
          <p>Choose your network and bundle. We’ll take care of the rest.</p>
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
                  <p>{plans.length} available bundles for {network}.</p>
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
                    {plan.providerPrice.toLocaleString("en-NG")} ({plan.category})
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
                  Use an 11-digit Nigerian number or the 234 international format.
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
                      {network} · {selectedPlan.name} · {selectedPlan.validity}
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
                >
                  Purchase Now <span aria-hidden="true">→</span>
                </button>
              )}
            </>
          )}

          {notice && (
            <div className="purchase-feedback" role="status">
              {notice}
            </div>
          )}

          <div className="testing-notice">
            <span>ⓘ</span>
            <p>
              Testing mode: this page currently displays your order details
              only. No payment will be taken and no data will be sent yet.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
