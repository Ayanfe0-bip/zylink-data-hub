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
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
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
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

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
    return (
      <main className="settings-loading">
        <div className="settings-spinner" />
        <p>Loading your settings...</p>
      </main>
    );
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

          <button
            className="settings-back"
            onClick={() => router.push("/dashboard")}
          >
            ← Dashboard
          </button>
        </header>

        {error && <div className="settings-alert error">{error}</div>}
        {message && <div className="settings-alert success">{message}</div>}

        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-icon">♙</div>
            <div>
              <h2>Account Information</h2>
              <p>Your registered account details.</p>
            </div>
          </div>

          <div className="settings-field">
            <label>Email Address</label>
            <input type="email" value={email} readOnly />
            <small>Your registered email address cannot be changed here.</small>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-icon">🔐</div>
            <div>
              <h2>Password & Security</h2>
              <p>Keep your Zylink account protected.</p>
            </div>
          </div>

          <form onSubmit={changePassword}>
            <div className="settings-field">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="settings-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="settings-primary-button"
              disabled={saving}
            >
              {saving ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </section>

        <section className="settings-card security-card">
          <div className="settings-card-heading">
            <div className="settings-icon">🛡️</div>
            <div>
              <h2>Account Security</h2>
              <p>Some important information about your account.</p>
            </div>
          </div>

          <div className="settings-security-row">
            <div>
              <strong>Account Authentication</strong>
              <p>Your account is protected by Supabase authentication.</p>
            </div>
            <span className="settings-status">Active</span>
          </div>
        </section>

        <section className="settings-card signout-card">
          <div className="settings-card-heading">
            <div className="settings-icon">⇥</div>
            <div>
              <h2>Sign Out</h2>
              <p>Sign out of your Zylink account on this device.</p>
            </div>
          </div>

          <button
            className="settings-danger-button"
            onClick={signOut}
            disabled={signingOut}
          >
            {signingOut ? "Signing Out..." : "Sign Out of Account"}
          </button>
        </section>

        <footer className="settings-footer">
          <strong>Zylink Data Hub</strong>
          <span>Think Smart. Stay Connected.</span>
          <small>
            Created by Ayanfe Innovation Labs Limited.
          </small>
        </footer>

      </div>

      <style jsx>{`
        .settings-page {
          min-height: 100vh;
          background: #f4f8fc;
          padding: 35px 20px;
          color: #172b4d;
        }

        .settings-container {
          max-width: 850px;
          margin: auto;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
        }

        .settings-label {
          color: #0879c9;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .settings-header h1 {
          font-size: 32px;
          margin: 8px 0;
          font-weight: 800;
        }

        .settings-header p,
        .settings-card-heading p {
          color: #718096;
          font-size: 14px;
          margin: 0;
        }

        .settings-back {
          border: 1px solid #dce6f0;
          background: white;
          color: #0879c9;
          padding: 11px 16px;
          border-radius: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        .settings-card {
          background: white;
          border: 1px solid #e6edf5;
          border-radius: 15px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 5px 20px rgba(20, 55, 90, 0.035);
        }

        .settings-card-heading {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 23px;
        }

        .settings-icon {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          background: #eaf5ff;
          color: #0879c9;
          display: grid;
          place-items: center;
          font-size: 21px;
          flex-shrink: 0;
        }

        .settings-card-heading h2 {
          font-size: 17px;
          margin: 0 0 6px;
          font-weight: 800;
        }

        .settings-field {
          margin-bottom: 18px;
        }

        .settings-field label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .settings
