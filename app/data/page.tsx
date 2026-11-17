"use client";

import { useState } from "react";
import {
  MELE_DATA_PLANS,
  NetworkCode,
  DataPlan,
} from "@/lib/mele-data-plans";

const networks: NetworkCode[] = [
  "MTN",
  "AIRTEL",
  "GLO",
  "9MOBILE",
];

export default function DataPage() {
  const [network, setNetwork] = useState<NetworkCode>("MTN");
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [phone, setPhone] = useState("");

  const plans = MELE_DATA_PLANS.filter(
    (plan) => plan.network === network
  );

  const validPhone = /^(0\d{10}|234\d{10})$/.test(phone);

  return (
    <main className="data-page">
      <header className="data-header">
        <a href="/" className="data-brand">
          <span className="data-brand-mark">Z</span>
          <span>zylink</span>
        </a>

        <a href="/" className="back-home">
          ← Back home
        </a>
      </header>

      <section className="data-container">
        <div className="data-intro">
          <span className="data-kicker">ZYLINK DATA HUB</span>
          <h1>Buy Data</h1>
          <p>
            Choose your network, select a data bundle and
            stay connected.
          </p>
        </div>

        <section className="purchase-card">
          <div className="form-heading">
            <h2>Select Network</h2>
            <span>4 networks available</span>
          </div>

          <div className="data-network-grid">
            {networks.map((item) => (
              <button
                key={item}
                type="button"
                className={`data-network-option ${
                  network === item ? "active" : ""
                }`}
                onClick={() => {
                  setNetwork(item);
                  setSelectedPlan(null);
                }}
              >
                <span className={`network-symbol ${item.toLowerCase()}`}>
                  {item === "9MOBILE" ? "9" : item.charAt(0)}
                </span>
                <span>{item}</span>
                {network === item && <span className="selected-check">✓</span>}
              </button>
            ))}
          </div>

          <div className="form-section">
            <label htmlFor="phone-number">
              Recipient phone number
            </label>

            <input
              id="phone-number"
              type="tel"
              inputMode="numeric"
              placeholder="Enter 08012345678"
              value={phone}
              maxLength={13}
              onChange={(event) =>
                setPhone(event.target.value.replace(/\s/g, ""))
              }
            />

            <small>
              Enter the phone number that should receive the data.
            </small>

            {phone.length > 0 && !validPhone && (
              <span className="input-error">
                Enter a valid 11-digit number or 234 format.
              </span>
            )}
          </div>

          <div className="form-section">
            <div className="form-heading">
              <h2>Choose Data Bundle</h2>
              <span>{plans.length} plans</span>
            </div>

            <div className="data-plan-grid">
              {plans.map((plan) => (
                <button
                  key={plan.planId}
                  type="button"
                  className={`data-plan-option ${
                    selectedPlan?.planId === plan.planId
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <span className="plan-name">{plan.name}</span>
                  <strong>
                    ₦{plan.providerPrice.toLocaleString("en-NG")}
                  </strong>
                  <span className="plan-category">
                    {plan.category}
                  </span>
                  <span className="plan-validity">
                    {plan.validity}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="selection-summary">
            <div>
              <span>Selected network</span>
              <strong>{network}</strong>
            </div>

            <div>
              <span>Selected plan</span>
              <strong>
                {selectedPlan
                  ? selectedPlan.name
                  : "No plan selected"}
              </strong>
            </div>

            <div>
              <span>Provider price</span>
              <strong>
                {selectedPlan
                  ? `₦${selectedPlan.providerPrice.toLocaleString("en-NG")}`
                  : "₦0"}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="data-purchase-button"
            disabled={!validPhone || !selectedPlan}
          >
            Continue
          </button>

          <div className="testing-notice">
            <span>ⓘ</span>
            Catalogue testing mode. Actual purchases are not
            enabled yet.
          </div>
        </section>
      </section>
    </main>
  );
}
