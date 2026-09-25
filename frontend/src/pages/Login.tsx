import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import { signIn } from "../services/authService";

/** Email/password sign-in page. */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Set by Signup when the account was created but email confirmation is required.
  const notice =
    location.state !== null &&
    typeof location.state === "object" &&
    "notice" in location.state &&
    typeof (location.state as { notice: unknown }).notice === "string"
      ? (location.state as { notice: string }).notice
      : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: authError } = await signIn({ email, password });
    if (authError) {
      setError(authError);
      setSubmitting(false);
      return;
    }

    const intendedPath =
      location.state !== null &&
      typeof location.state === "object" &&
      "from" in location.state &&
      typeof (location.state as { from: unknown }).from === "string"
        ? (location.state as { from: string }).from
        : "/dashboard";
    navigate(intendedPath, { replace: true });
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your account on the Land Governance Platform."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {notice && !error && (
          <div
            role="status"
            className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            {notice}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-slate-800"
          >
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-2 focus:outline-offset-1 focus:outline-emerald-700"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-slate-800"
          >
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-2 focus:outline-offset-1 focus:outline-emerald-700"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-emerald-800 hover:text-emerald-700"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
