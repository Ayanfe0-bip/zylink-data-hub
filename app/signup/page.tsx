"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          full_name: fullName.trim(),
          phone: phone.trim()
        }
      }
    });

    setLoading(false);

    if (signupError) {
      setError(signupError.message);
      return;
    }

    setSuccess(
      "Your account has been created. Please check your email to confirm your account."
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-brand">
          <span className="brand-mark">Z</span>
          <span className="brand-name">
            zy<span>link</span>
          </span>
        </Link>

        <div className="auth-heading">
          <span className="section-kicker">
            JOIN ZYLINK
          </span>

          <h1>Create your account</h1>

          <p>
            Get started with easier data and airtime
            purchases.
          </p>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          <label htmlFor="fullName">Full name</label>

          <input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            required
          />

          <label htmlFor="email">Email address</label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="phone">Phone number</label>

          <input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <label htmlFor="confirmPassword">
            Confirm password
          </label>

          <input
            id="confirmPassword"
            type="password"
            placeholder="Enter your password again"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            autoComplete="new-password"
            required
          />

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success" role="status">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </p>

        <Link href="/" className="auth-back">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
