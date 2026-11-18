"use client";

import { useState } from "react";

type BankAccount = {
  accountNumber: string;
  accountName: string;
  bankName: string;
  status: string;
};

export default function AccountGenerator() {
  const [identityType, setIdentityType] = useState("BVN");
  const [identityNumber, setIdentityNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState<BankAccount | null>(null);

  async function generateAccount() {
    setMessage("");

    if (!/^\d{11}$/.test(identityNumber)) {
      setMessage("Enter the 11-digit Sandbox test number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/monnify/reserved-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identityType,
          identityNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setMessage(
          result.message || "Unable to generate your bank account."
        );
        return;
      }

      setAccount(result.account);
      setIdentityNumber("");
      setMessage(result.message || "Bank account generated successfully.");
    } catch {
      setMessage("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (account) {
    return (
      <div className="wallet-account-card">
        <div className="wallet-icon">🏦</div>

        <h2>Your dedicated bank account</h2>

        <p>Transfer money to this account to fund your Zylink wallet.</p>

        <div className="wallet-security">
          Account status: {account.status}
        </div>

        <p><strong>Bank name</strong></p>
        <h3>{account.bankName}</h3>

        <p><strong>Account number</strong></p>
        <h2>{account.accountNumber}</h2>

        <button
          type="button"
          className="wallet-generate-button"
          onClick={() =>
            navigator.clipboard.writeText(account.accountNumber)
          }
        >
          Copy Account Number
        </button>

        <p><strong>Account name</strong></p>
        <p>{account.accountName}</p>

        <div className="wallet-security">
          After transferring from your bank app, Monnify will notify Zylink
          and your wallet will be credited automatically after verification.
        </div>

        <div className="wallet-status">
          MONNIFY SANDBOX
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-account-card">
      <div className="wallet-icon">🏦</div>

      <h2>Your dedicated bank account</h2>

      <p>
        Generate your personal bank account for funding your Zylink wallet.
      </p>

      <label htmlFor="identityType">
        Select identity type
      </label>

      <select
        id="identityType"
        value={identityType}
        onChange={(event) => {
          setIdentityType(event.target.value);
          setIdentityNumber("");
          setMessage("");
        }}
      >
        <option value="BVN">BVN</option>
        <option value="NIN">NIN</option>
      </select>

      <label htmlFor="identityNumber">
        Sandbox test {identityType}
      </label>

      <input
        id="identityNumber"
        type="password"
        inputMode="numeric"
        maxLength={11}
        value={identityNumber}
        onChange={(event) =>
          setIdentityNumber(
            event.target.value.replace(/\D/g, "")
          )
        }
        placeholder="Enter 11-digit test number"
        autoComplete="off"
      />

      <div className="wallet-security">
        🔒 Sandbox testing only. Never enter your real BVN or NIN here
        while using Sandbox.
      </div>

      <button
        type="button"
        disabled={loading}
        className="wallet-generate-button"
        onClick={generateAccount}
      >
        {loading ? "Generating Account..." : "Generate My Bank Account"}
      </button>

      {message && (
        <p role="status">
          {message}
        </p>
      )}

      <div className="wallet-status">
        MONNIFY SANDBOX TESTING
      </div>
    </div>
  );
}
