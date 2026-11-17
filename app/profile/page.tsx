"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      const user = data.user;

      setFullName(user.user_metadata?.full_name || "");
      setPhone(user.user_metadata?.phone || "");
      setEmail(user.email || "");
      setCreatedAt(user.created_at);

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setNotice("");
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        phone: phone.trim(),
      },
    });

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotice("Your profile has been updated successfully.");
  }

  if (loading) {
    return (
      <main className="profile-loading">
        <div className="loading-mark">Z</div>
        <p>Loading your profile...</p>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <header className="profile-header">
        <Link href="/dashboard" className="profile-brand">
          <span className="profile-brand-mark">Z</span>
          <span>zy<span>link</span></span>
        </Link>

        <Link href="/dashboard" className="profile-back">
          ← Dashboard
        </Link>
      </header>

      <section className="profile-content">
        <div className="profile-intro">
          <span className="profile-kicker">MY ACCOUNT</span>
          <h1>My Profile</h1>
          <p>
            Manage your personal information and account details.
          </p>
        </div>

        <section className="profile-card">
          <div className="profile-banner">
            <div className="profile-avatar">
              {fullName.trim().charAt(0).toUpperCase() || "Z"}
            </div>

            <div>
              <h2>{fullName || "Zylink Customer"}</h2>
              <p>{email}</p>
              <span className="account-badge">
                ✓ Registered Account
              </span>
            </div>
          </div>

          <form onSubmit={saveProfile}>
            <div className="profile-form-heading">
              <h3>Personal Information</h3>
              <p>Update the information associated with your account.</p>
            </div>

            <div className="profile-form-grid">
              <div className="profile-field">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                />
                <small>Email cannot be changed here.</small>
              </div>

              <div className="profile-field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="profile-field">
                <label>Account Created</label>
                <input
                  type="text"
                  value={new Date(createdAt).toLocaleDateString(
                    "en-NG",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                  disabled
                />
              </div>
            </div>

            {notice && (
              <div className="profile-message success">
                ✓ {notice}
              </div>
            )}

            {error && (
              <div className="profile-message error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="profile-save"
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "Save Changes →"}
            </button>
          </form>
        </section>

        <div className="profile-security-note">
          <span>ⓘ</span>
          <p>
            Your account information is managed securely
            through Zylink authentication.
          </p>
        </div>

        <footer className="profile-footer">
          © {new Date().getFullYear()} Zylink Data Hub ·
          A product of Ayanfe Innovation Labs Limited.
        </footer>
      </section>

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background: #f3f7fc;
          color: #193451;
          font-family: Arial, sans-serif;
        }

        .profile-header {
          min-height: 75px;
          padding: 0 7%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border-bottom: 1px solid #e6edf6;
        }

        .profile-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #193451;
          text-decoration: none;
          font-size: 23px;
          font-weight: 900;
        }

        .profile-brand > span:last-child > span {
          color: #0875df;
        }

        .profile-brand-mark {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: linear-gradient(135deg, #087be0, #0756b8);
          color: white;
        }

        .profile-back {
          color: #0875df;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
        }

        .profile-content {
          width: min(100% - 32px, 850px);
          margin: auto;
          padding: 48px 0 25px;
        }

        .profile-kicker {
          color: #0875df;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .profile-intro h1 {
          margin: 10px 0;
          font-size: 34px;
          font-weight: 900;
        }

        .profile-intro p {
          color: #8493a6;
          font-size: 13px;
          line-height: 1.7;
        }

        .profile-card {
          margin-top: 27px;
          overflow: hidden;
          border: 1px solid #e4ecf6;
          border-radius: 18px;
          background: white;
          box-shadow: 0 10px 30px #102c5008;
        }

        .profile-banner {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 28px;
          background: linear-gradient(120deg, #eaf4ff, #f5f9ff);
          border-bottom: 1px solid #e5edf7;
        }

        .profile-avatar {
          width: 65px;
          height: 65px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 3px solid white;
          border-radius: 20px;
          background: linear-gradient(135deg, #087be0, #0756b8);
          color: white;
          font-size: 27px;
          font-weight: 900;
          box-shadow: 0 5px 15px #0875df25;
        }

        .profile-banner h2 {
          margin: 0 0 6px;
          font-size: 19px;
        }

        .profile-banner p {
          margin: 0 0 9px;
          color: #71849b;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .account-badge {
          color: #168452;
          font-size: 10px;
          font-weight: 800;
        }

        .profile-card form {
          padding: 28px;
        }

        .profile-form-heading h3 {
          margin: 0 0 7px;
          font-size: 17px;
        }

        .profile-form-heading p {
          margin: 0;
          color: #8a98aa;
          font-size: 11px;
          line-height: 1.7;
        }

        .profile-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 23px 18px;
          margin-top: 25px;
        }

        .profile-field label {
          display: block;
          margin-bottom: 9px;
          color: #344a65;
          font-size: 11px;
          font-weight: 800;
        }

        .profile-field input {
          width: 100%;
          min-height: 49px;
          padding: 0 13px;
          border: 1px solid #dce6f1;
          border-radius: 10px;
          outline: none;
          background: #fbfdff;
          color: #193451;
          font-family: inherit;
          font-size: 12px;
        }

        .profile-field input:focus {
          border-color: #0875df;
          box-shadow: 0 0 0 3px #0875df15;
        }

        .profile-field input:disabled {
          background: #f1f4f8;
          color: #8291a4;
          cursor: not-allowed;
        }

        .profile-field small {
          display: block;
          margin-top: 7px;
          color: #9aa7b6;
          font-size: 9px;
        }

        .profile-save {
          width: 100%;
          min-height: 52px;
          margin-top: 28px;
          border: 0;
          border-radius: 11px;
          background: linear-gradient(120deg, #087be0, #0756b8);
          color: white;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
        }

        .profile-save:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .profile-message {
          margin-top: 20px;
          padding: 13px;
          border-radius: 9px;
          font-size: 11px;
          line-height: 1.7;
        }

        .profile-message.success {
          background: #effbf4;
          color: #187347;
          border: 1px solid #ccebd9;
        }

        .profile-message.error {
          background: #fff3f3;
          color: #bd3942;
          border: 1px solid #f4d1d1;
        }

        .profile-security-note {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          padding: 15px;
          border: 1px solid #dceaff;
          border-radius: 11px;
          background: #f2f7ff;
          color: #58718d;
          font-size: 10px;
          line-height: 1.8;
        }

        .profile-security-note p {
          margin: 0;
        }

        .profile-security-note span {
          color: #0875df;
        }

        .profile-footer {
          padding: 30px 5px 10px;
          color: #9aa7b6;
          text-align: center;
          font-size: 10px;
        }

        .profile-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f3f7fc;
          color: #8493a6;
          font-family: Arial, sans-serif;
        }

        .loading-mark {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #0875df;
          color: white;
          font-size: 24px;
          font-weight: 900;
        }

        @media (max-width: 600px) {
          .profile-header {
            min-height: 66px;
            padding: 0 16px;
          }

          .profile-content {
            padding-top: 35px;
          }

          .profile-form-grid {
            grid-template-columns: 1fr;
          }

          .profile-card form {
            padding: 22px 17px;
          }

          .profile-banner {
            padding: 22px 17px;
          }
        }
      `}</style>
    </main>
  );
        }
