"use client";

import { useState } from "react";

export default function AccountGenerator() {
  const [identityType, setIdentityType] = useState("BVN");
  const [identityNumber, setIdentityNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function generateAccount() {
    setMessage(
      "Account generation is paused until Monnify provides approved Sandbox test identity details."
    );
  }

  return (
    <div className="wallet-account-card">
      <div className="wallet-icon">🏦</div>

      <h2>Your dedicated bank account</h2>

      <p>
        Generate a personal bank account for funding
        your Zylink wallet.
      </p>

      <label htmlFor="identityType">
        Select identity type
      </label>

      <select
        id="identityType"
        value={identityType}
        onChange={(event) =>
          setIdentityType(event.target.value)
        }
      >
        <option value="BVN">BVN</option>
        <option value="NIN">NIN</option>
      </select>

      <label htmlFor="identityNumber">
        {identityType} number
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
        placeholder="11-digit test number"
        autoComplete="off"
      />

      <div className="wallet-security">
        🔒 Never enter your real BVN or NIN during
        Sandbox testing. Zylink does not store your
        identity number.
      </div>

      <button
        type="button"
        disabled
        className="wallet-generate-button"
      >
        {loading ? "Generating..." : "Generate My Bank Account"}
      </button>

      <div className="wallet-status">
        MONNIFY SANDBOX TESTING
      </div>

      {message && (
        <p role="status">{message}</p>
      )}
    </div>
  );
}
