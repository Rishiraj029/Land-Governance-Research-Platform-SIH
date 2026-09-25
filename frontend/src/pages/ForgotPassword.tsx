import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Landmark } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // This is a placeholder - actual password reset would be implemented with Supabase
    // For now, we'll show a success message
    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      {/* Header */}
      <header className="border-b border-[#E1E5EA] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <Landmark className="h-6 w-6 text-[#0B3D91]" aria-hidden="true" />
            <span className="font-semibold text-[#0B3D91]">
              Land Governance Research Platform
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-semibold text-[#1F2933] mb-2">
              Reset Your Password
            </h1>
            <p className="text-sm text-[#5A6472] mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-md border border-[#D64545]/20 bg-[#D64545]/10 px-4 py-3 text-sm text-[#D64545]"
              >
                {error}
              </div>
            )}

            {submitted ? (
              <div className="rounded-md border border-[#138808]/20 bg-[#138808]/10 px-4 py-3 text-sm text-[#138808]">
                <p className="font-medium mb-2">Check your email</p>
                <p className="text-[#138808]/80">
                  We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                </p>
                <Link
                  to="/auth"
                  className="inline-block mt-4 text-sm font-medium text-[#138808] hover:text-[#0B3D91]"
                >
                  Return to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#1F2933]"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="block w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-md bg-[#0B3D91] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#062A63] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3D91]"
                >
                  Send Reset Link
                </button>

                <p className="text-center text-sm text-[#5A6472]">
                  Remember your password?{" "}
                  <Link
                    to="/auth"
                    className="font-medium text-[#0B3D91] hover:text-[#FF9933]"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E1E5EA] bg-white py-4">
        <p className="text-center text-xs text-[#5A6472]">
          National Digital Platform for Research and Policy Innovation in Land Governance
        </p>
      </footer>
    </div>
  );
}