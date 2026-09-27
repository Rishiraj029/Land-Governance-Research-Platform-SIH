import { useState, useEffect, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Landmark, Eye, EyeOff, Shield, Building2, Users, User } from "lucide-react";
import { signIn, signUp } from "../services/authService";

type AuthTab = "login" | "register";
type UserRole = "researcher" | "official" | "institution" | "public";

const USE_CASES = [
  "Used by 40+ state departments for land governance research",
  "Trusted by 1,200+ academic and research institutions",
  "Supporting evidence-based policy innovation across India",
];

const ROLES: Array<{ id: UserRole; title: string; icon: any; description: string }> = [
  {
    id: "researcher",
    title: "Individual Researcher",
    icon: User,
    description: "For academics and independent researchers",
  },
  {
    id: "official",
    title: "Government Official",
    icon: Shield,
    description: "For government employees and officials",
  },
  {
    id: "institution",
    title: "Institution",
    icon: Building2,
    description: "For academic and research organizations",
  },
  {
    id: "public",
    title: "Public / General User",
    icon: Users,
    description: "For citizens and general public access",
  },
];

const AREAS_OF_INTEREST = [
  "Climate & Land",
  "Urbanization",
  "Land Disputes",
  "Sustainable Land-Use Planning",
  "Geospatial Governance",
  "Digital Transformation",
  "Tenure Security",
  "Policy Analysis",
];

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [useCaseIndex, setUseCaseIndex] = useState(0);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regInstitution, setRegInstitution] = useState("");
  const [regAreasOfInterest, setRegAreasOfInterest] = useState<string[]>([]);
  const [regDepartment, setRegDepartment] = useState("");
  const [regDesignation, setRegDesignation] = useState("");
  const [regInstitutionName, setRegInstitutionName] = useState("");
  const [regRegId, setRegRegId] = useState("");
  const [regAdminName, setRegAdminName] = useState("");
  const [regAdminEmail, setRegAdminEmail] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Rotate use cases
  useEffect(() => {
    const interval = setInterval(() => {
      setUseCaseIndex((prev) => (prev + 1) % USE_CASES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Set initial tab based on navigation state
  useEffect(() => {
    if (location.state && typeof location.state === "object" && "tab" in location.state) {
      setActiveTab((location.state as { tab: AuthTab }).tab);
    }
  }, [location.state]);

  // Set by Signup when the account was created but email confirmation is required.
  const notice =
    location.state !== null &&
    typeof location.state === "object" &&
    "notice" in location.state &&
    typeof (location.state as { notice: unknown }).notice === "string"
      ? (location.state as { notice: string }).notice
      : null;

  // Destination requested by the page that sent the user here (defaults to the dashboard).
  const intendedPath =
    location.state !== null &&
    typeof location.state === "object" &&
    "from" in location.state &&
    typeof (location.state as { from: unknown }).from === "string"
      ? (location.state as { from: string }).from
      : "/dashboard";

  // Set when the visitor asked to create a workspace before signing in, so the workspaces
  // page can reopen the create dialog once they are returned to it.
  const createWorkspaceIntent =
    location.state !== null &&
    typeof location.state === "object" &&
    "createWorkspace" in location.state &&
    (location.state as { createWorkspace: unknown }).createWorkspace === true;

  const postAuthState = createWorkspaceIntent
    ? ({ createWorkspace: true } as const)
    : undefined;

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { error: authError } = await signIn({ email: loginEmail, password: loginPassword });
      if (authError) {
        setError(authError);
        return;
      }

      navigate(intendedPath, { replace: true, state: postAuthState });
    } catch {
      setError("Unable to sign in right now. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!selectedRole) {
      setError("Please select a role to continue.");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the Terms of Use and Privacy Policy.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (regPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);

    // Only send fields supported by existing Supabase implementation
    // The current schema only supports: fullName, email, password in auth metadata
    const { error: authError, needsEmailConfirmation } = await signUp({
      fullName: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
    });

    if (authError) {
      setError(authError);
      setSubmitting(false);
      return;
    }

    if (needsEmailConfirmation) {
      navigate("/", {
        replace: true,
        state: {
          notice: "Your account was created. Please confirm your email before signing in. Check your inbox for the confirmation link.",
        },
      });
      return;
    }

    if (selectedRole === "official" || selectedRole === "institution") {
      navigate("/", {
        replace: true,
        state: {
          notice: "Your account is signed in. Elevated access is pending verification; you can browse public content in the meantime.",
        },
      });
      return;
    }

    navigate("/", { replace: true });
  }

  function toggleAreaOfInterest(area: string) {
    setRegAreasOfInterest((prev) =>
      prev.includes(area)
        ? prev.filter((a) => a !== area)
        : [...prev, area]
    );
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
        <div className="w-full max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left Column - Branding Panel */}
            <div className="hidden lg:flex flex-col justify-center space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-[#1F2933] mb-4">
                  India's National Platform for Land Governance Research
                </h2>
                <p className="text-lg text-[#5A6472]">
                  Connecting researchers, policymakers, and institutions with reliable land data and evidence-based policy insights.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#5A6472]">
                  Trusted Across India
                </h3>
                <div className="relative h-20 overflow-hidden">
                  <div
                    className="absolute inset-0 transition-transform duration-500"
                    style={{ transform: `translateY(-${useCaseIndex * 100}%)` }}
                  >
                    {USE_CASES.map((useCase, index) => (
                      <div
                        key={index}
                        className="h-20 flex items-center text-[#0B3D91] font-medium"
                      >
                        "{useCase}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E1E5EA] pt-6">
                <p className="text-sm text-[#5A6472]">
                  Join 12,400+ researchers, 1,200+ institutions, and 40+ state departments already using the platform.
                </p>
              </div>
            </div>

            {/* Right Column - Form Panel */}
            <div className="flex flex-col">
              <div className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm sm:p-8">
                {/* Tabs */}
                <div className="flex gap-4 border-b border-[#E1E5EA] mb-6">
                  <button
                    onClick={() => {
                      setActiveTab("login");
                      setError(null);
                    }}
                    className={`pb-3 text-sm font-medium transition-colors ${
                      activeTab === "login"
                        ? "text-[#0B3D91] border-b-2 border-[#FF9933]"
                        : "text-[#5A6472] hover:text-[#0B3D91]"
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("register");
                      setError(null);
                    }}
                    className={`pb-3 text-sm font-medium transition-colors ${
                      activeTab === "register"
                        ? "text-[#0B3D91] border-b-2 border-[#FF9933]"
                        : "text-[#5A6472] hover:text-[#0B3D91]"
                    }`}
                  >
                    Register
                  </button>
                </div>

                {notice && !error && (
                  <div
                    role="status"
                    className="mb-4 rounded-md border border-[#138808]/20 bg-[#138808]/10 px-4 py-3 text-sm text-[#138808]"
                  >
                    {notice}
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="mb-4 rounded-md border border-[#D64545]/20 bg-[#D64545]/10 px-4 py-3 text-sm text-[#D64545]"
                  >
                    {error}
                  </div>
                )}

                {activeTab === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-5" noValidate>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="login-email"
                        className="block text-sm font-medium text-[#1F2933]"
                      >
                        Email
                      </label>
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        className="block w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="login-password"
                        className="block text-sm font-medium text-[#1F2933]"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="login-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          value={loginPassword}
                          onChange={(event) => setLoginPassword(event.target.value)}
                          className="block w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 pr-10 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6472] hover:text-[#0B3D91]"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-[#0B3D91] hover:text-[#FF9933]"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-md bg-[#0B3D91] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#062A63] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3D91] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? "Signing in…" : "Log In"}
                    </button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#E1E5EA]" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-[#5A6472]">or</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        type="button"
                        disabled
                        className="w-full flex items-center justify-center gap-2 rounded-md border border-[#E1E5EA] bg-white px-4 py-2.5 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Shield className="h-4 w-4" />
                        Continue with Government SSO (NIC/DigiLocker)
                        <span className="text-xs text-[#E8A33D] ml-auto">Coming Soon</span>
                      </button>
                      <button
                        type="button"
                        disabled
                        className="w-full flex items-center justify-center gap-2 rounded-md border border-[#E1E5EA] bg-white px-4 py-2.5 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Building2 className="h-4 w-4" />
                        Continue with Institutional Email (Academic SSO)
                        <span className="text-xs text-[#E8A33D] ml-auto">Coming Soon</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-5" noValidate>
                    {/* Role Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-[#1F2933]">
                        Select your role
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ROLES.map((role) => {
                          const Icon = role.icon;
                          return (
                            <button
                              key={role.id}
                              type="button"
                              onClick={() => setSelectedRole(role.id)}
                              className={`flex items-start gap-3 p-3 rounded-md border text-left transition-all ${
                                selectedRole === role.id
                                  ? "border-[#0B3D91] bg-[#0B3D91]/5"
                                  : "border-[#E1E5EA] bg-white hover:border-[#0B3D91]/50"
                              }`}
                            >
                              <Icon className="h-5 w-5 text-[#0B3D91] flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-[#1F2933]">{role.title}</p>
                                <p className="text-xs text-[#5A6472]">{role.description}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dynamic form fields based on role */}
                    {selectedRole && (
                      <div className="space-y-4 pt-4 border-t border-[#E1E5EA]">
                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-[#1F2933]">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(event) => setRegName(event.target.value)}
                            className="block w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                            placeholder="Jane Doe"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-[#1F2933]">
                            {selectedRole === "official" ? "Official Email" : "Email"}
                          </label>
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(event) => setRegEmail(event.target.value)}
                            className="block w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                            placeholder="you@example.com"
                          />
                        </div>

                        {/* Role-specific fields */}
                        {selectedRole === "researcher" && (
                          <>
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-[#1F2933]">
                                Institution (optional)
                              </label>
                              <input
                                type="text"
                                value={regInstitution}
                                onChange={(event) => setRegInstitution(event.target.value)}
                                className="block w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                                placeholder="Your institution name"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-[#1F2933]">
                                Areas of Interest
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {AREAS_OF_INTEREST.map((area) => (
                                  <button
                                    key={area}
                                    type="button"
                                    onClick={() => toggleAreaOfInterest(area)}
                                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                                      regAreasOfInterest.includes(area)
                                        ? "border-[#0B3D91] bg-[#0B3D91] text-white"
                                        : "border-[#E1E5EA] bg-white text-[#5A6472] hover:border-[#0B3D91]"
                                    }`}
                                  >
                                    {area}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {selectedRole === "official" && (
                          <>
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-[#1F2933]">
                                Department
                              </label>
                              <input
                                type="text"
                                required
                                value={regDepartment}
                                onChange={(event) => setRegDepartment(event.target.value)}
                                className="block w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                                placeholder="Your department"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-[#1F2933]">
                                Designation
                              </label>
                              <input
                                type="text"
                                required
                                value={regDesignation}
                                onChange={(event) => setRegDesignation(event.target.value)}
                                className="block w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                                placeholder="Your designation"
                              />
                            </div>
                            <div className="rounded-md bg-[#E8A33D]/10 border border-[#E8A33D]/20 p-3">
                              <p className="text-xs text-[#E8A33D]">
                                <strong>Note:</strong> Government official accounts require manual verification before elevated access is granted. You will have public-tier access while pending verification.
                              </p>
                            </div>
                          </>
                        )}

                        {selectedRole === "institution" && (
                          <>
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-[#1F2933]">
                                Institution Name
                              </label>
                              <input
                                type="text"
                                required
                                value={regInstitutionName}
                                onChange={(event) => setRegInstitutionName(event.target.value)}
                                className="block w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                                placeholder="Official institution name"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-[#1F2933]">
                                Registration / Accreditation ID
                              </label>
                              <input
                                type="text"
                                required
                                value={regRegId}
                                onChange={(event) => setRegRegId(event.target.value)}
                                className="block w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                                placeholder="Official registration ID"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-[#1F2933]">
                                Admin Contact Name
                              </label>
                              <input
                                type="text"
                                required
                                value={regAdminName}
                                onChange={(event) => setRegAdminName(event.target.value)}
                                className="block w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                                placeholder="Admin contact person"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-[#1F2933]">
                                Admin Contact Email
                              </label>
                              <input
                                type="email"
                                required
                                value={regAdminEmail}
                                onChange={(event) => setRegAdminEmail(event.target.value)}
                                className="block w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                                placeholder="admin@institution.edu"
                              />
                            </div>
                            <div className="rounded-md bg-[#E8A33D]/10 border border-[#E8A33D]/20 p-3">
                              <p className="text-xs text-[#E8A33D]">
                                <strong>Note:</strong> Institution accounts require admin verification before full access is granted. You will have public-tier access while pending verification.
                              </p>
                            </div>
                          </>
                        )}

                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-[#1F2933]">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={regPassword}
                              onChange={(event) => setRegPassword(event.target.value)}
                              className="block w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 pr-10 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                              placeholder="At least 8 characters"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6472] hover:text-[#0B3D91]"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-[#1F2933]">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            required
                            value={regConfirmPassword}
                            onChange={(event) => setRegConfirmPassword(event.target.value)}
                            className="block w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                            placeholder="Repeat your password"
                          />
                        </div>

                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            id="terms"
                            required
                            checked={termsAccepted}
                            onChange={(event) => setTermsAccepted(event.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                          />
                          <label htmlFor="terms" className="text-sm text-[#5A6472]">
                            I agree to the{" "}
                            <Link to="/terms" className="text-[#0B3D91] hover:text-[#FF9933]">
                              Terms of Use
                            </Link>{" "}
                            and{" "}
                            <Link to="/privacy" className="text-[#0B3D91] hover:text-[#FF9933]">
                              Privacy Policy
                            </Link>
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={submitting || !termsAccepted}
                          className="w-full rounded-md bg-[#0B3D91] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#062A63] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3D91] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {submitting ? "Creating account…" : "Create Account"}
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
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