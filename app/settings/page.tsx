"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAccount() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setEmail(data.user.email || "");
      setLoading(false);
    }

    loadAccount();
  }, [router, supabase]);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({ password });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Your password has been updated successfully.");
    setPassword("");
    setConfirmPassword("");
  }

  async function signOut() {
    setSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      setSigningOut(false);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return <main className="settings-loading">Loading settings...</main>;
  }

  return (
    <main className="settings-page">
      <div className="settings-container">
        <header className="settings-header">
          <div>
            <span className="settings-label">MY ACCOUNT</span>
            <h1>Settings</h1>
            <p>Manage your account security and preferences.</p>
          </div>

          <button onClick={() => router.push("/dashboard")}>
            ← Dashboard
          </button>
        </header>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <section className="settings-card">
          <div className="card-heading">
            <span className="icon">♙</span>
            <div>
              <h2>Account Information</h2>
              <p>Your registered account details.</p>
            </div>
          </div>

          <label>Email Address</label>
          <input type="email" value={email} readOnly />
          <small>Your registered email address.</small>
        </section>

        <section className="settings-card">
          <div className="card-heading">
            <span className="icon">🔐</span>
            <div>
              <h2>Password & Security</h2>
              <p>Keep your account protected.</p>
            </div>
          </div>

          <form onSubmit={changePassword}>
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />

            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />

            <button className="primary-button" disabled={saving}>
              {saving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>

        <section className="settings-card">
          <div className="card-heading">
            <span className="icon">🛡️</span>
            <div>
              <h2>Account Security</h2>
              <p>Your account is protected by Supabase authentication.</p>
            </div>
          </div>

          <span className="status">● Authentication Active</span>
        </section>

        <section className="settings-card">
          <div className="card-heading">
            <span className="icon">⇥</span>
            <div>
              <h2>Sign Out</h2>
              <p>Sign out of your account on this device.</p>
            </div>
          </div>

          <button
            className="danger-button"
            onClick={signOut}
            disabled={signingOut}
          >
            {signingOut ? "Signing Out..." : "Sign Out of Account"}
          </button>
        </section>

        <footer>
          <strong>Zylink Data Hub</strong>
          <p>Think Smart. Stay Connected.</p>
          <small>Created by Ayanfe Innovation Labs Limited.</small>
        </footer>
      </div>

      <style jsx>{`
        .settings-page {
          min-height: 100vh;
          padding: 30px 18px;
          background: #f4f8fc;
          color: #172b4d;
        }

        .settings-container {
          max-width: 800px;
          margin: auto;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 28px;
        }

        .settings-label {
          color: #0879c9;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        h1 {
          font-size: 30px;
          margin: 8px 0;
        }

        .settings-header p,
        .card-heading p {
          color: #718096;
          font-size: 13px;
          margin: 0;
        }

        button {
          cursor: pointer;
          border-radius: 9px;
          padding: 12px 16px;
          font-weight: 700;
        }

        .settings-header button {
          background: white;
          color: #0879c9;
          border: 1px solid #dce6f0;
        }

        .settings-card {
          background: white;
          border: 1px solid #e6edf5;
          border-radius: 14px;
          padding: 22px;
          margin-bottom: 18px;
          box-shadow: 0 5px 18px rgba(20,55,90,.04);
        }

        .card-heading {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 22px;
        }

        .icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #eaf5ff;
          color: #0879c9;
          font-size: 20px;
        }

        h2 {
          font-size: 16px;
          margin: 0 0 5px;
        }

        label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin: 15px 0 8px;
        }

        input {
          box-sizing: border-box;
          width: 100%;
          padding: 13px;
          border: 1px solid #dce5ef;
          border-radius: 9px;
          background: #fbfdff;
          font-size: 14px;
          outline: none;
        }

        input:focus {
          border-color: #0879c9;
        }

        input[readonly] {
          background: #f0f4f8;
        }

        small {
          display: block;
          color: #8492a6;
          font-size: 11px;
          margin-top: 7px;
        }

        .primary-button {
          margin-top: 18px;
          background: #0879c9;
          color: white;
          border: none;
        }

        .danger-button {
          background: #fff1f1;
          color: #d33b3b;
          border: 1px solid #ffdada;
        }

        .status {
          color: #16834b;
          font-size: 13px;
          font-weight: 700;
        }

        .alert {
          padding: 13px;
          border-radius: 9px;
          margin-bottom: 16px;
          font-size: 13px;
        }

        .error {
          background: #fff0f0;
          color: #c53030;
        }

        .success {
          background: #e9f9ef;
          color: #187b45;
        }

        footer {
          text-align: center;
          padding: 25px 10px;
          color: #718096;
          font-size: 12px;
        }

        footer strong {
          color: #0879c9;
          font-size: 15px;
        }

        .settings-loading {
          padding: 60px;
          text-align: center;
        }

        @media (max-width: 550px) {
          .settings-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .settings-card {
            padding: 18px;
          }
        }
      `}</style>
    </main>
  );
}
