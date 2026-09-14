import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();

  const nav = useNavigate();

  const redirectUser = (user) => {
    nav(
      user?.role === "ADMIN"
        ? "/admin"
        : "/"
    );
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErr("");

      const user = await login(
        email,
        password
      );

      redirectUser(user);
    } catch (error) {
      setErr(
        error?.message ||
          "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse
  ) => {
    try {
      setLoading(true);
      setErr("");

      const credential =
        credentialResponse?.credential;

      if (!credential) {
        throw new Error(
          "Google did not return a credential."
        );
      }

      const user = await googleLogin(
        credential
      );

      redirectUser(user);
    } catch (error) {
      console.error(
        "Google login failed",
        error
      );

      setErr(
        error?.message ||
          "Google sign-in failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErr(
      "Google sign-in was unsuccessful. Please try again."
    );
  };

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8">
        <p className="nova-eyebrow text-zinc-400">
          MOGREN ACCOUNT
        </p>

        <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight">
          Welcome back.
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Sign in to view orders, manage
          your account and save your custom
          designs.
        </p>
      </div>

      {err && (
        <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* GOOGLE */}
      <div className="w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          width="400"
          size="large"
          shape="rectangular"
          text="continue_with"
          theme="outline"
        />
      </div>

      {/* DIVIDER */}
      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-200" />

        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
          Or continue with email
        </span>

        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      {/* EMAIL LOGIN */}
      <form
        onSubmit={submit}
        className="space-y-4"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Email address
          </label>

          <input
            className="w-full border border-zinc-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-black"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold">
              Password
            </label>

            <button
              type="button"
              className="text-xs font-semibold text-zinc-500 hover:text-black"
            >
              Forgot password?
            </button>
          </div>

          <input
            className="w-full border border-zinc-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-black"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-black py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Signing in..."
            : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        New customer?{" "}
        <Link
          className="font-semibold text-black underline underline-offset-4"
          to="/register"
        >
          Create account
        </Link>
      </p>
    </main>
  );
}