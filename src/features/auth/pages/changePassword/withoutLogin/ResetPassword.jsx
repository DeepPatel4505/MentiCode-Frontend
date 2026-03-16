import React, { useState, useMemo } from "react";
import { useAuth } from "../../../hooks/useAuth.js";
import { useParams, useNavigate, Link } from "react-router";
import { SimpleFormSkeleton } from "../../../components/auth/AuthSkeleton.jsx";

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const { loading, setForgotPassword } = useAuth();

  const token = useParams().token;
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    const checks = {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
    };

    const score = Object.values(checks).filter(Boolean).length;

    let label = "Weak";
    let color = "#ef4444";

    if (score >= 4) {
      label = "Strong";
      color = "#22c55e";
    } else if (score >= 3) {
      label = "Good";
      color = "#3b82f6";
    } else if (score >= 2) {
      label = "Fair";
      color = "#eab308";
    }

    return { checks, score, label, color };
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      alert("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);
    const success = await setForgotPassword({ token, newPassword });
    if (success) {
      alert("Password reset successfully!");
      navigate("/login");
    } else {
      setError("Failed to reset password. Please try again.");
      alert("Failed to reset password. Please try again.");
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return <SimpleFormSkeleton fieldCount={2} />;
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] p-4 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-50%] h-full w-full max-w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_25px_-5px_rgba(0,0,0,0.5),0_8px_10px_-6px_rgba(0,0,0,0.5)] sm:p-10">
          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] text-white">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="mb-2 text-[1.75rem] font-bold tracking-[-0.02em] text-white">Set new password</h1>
            <p className="text-[0.9375rem] text-[#71717a]">
              Your new password must be different from previously used passwords.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-[10px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-[#ef4444]">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="password" className={`mb-2 block text-sm font-medium transition ${focusedField === "password" ? "text-[#3b82f6]" : "text-white"}`}>New Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-[10px] border border-[#27272a] bg-[#0f0f0f] px-4 py-3 pr-12 text-[0.9375rem] text-white outline-none transition placeholder:text-[#71717a] focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/15"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#71717a] transition hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {newPassword && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="h-1 flex-1 rounded-sm"
                        style={{
                          backgroundColor: passwordStrength.score >= level ? passwordStrength.color : "rgba(100, 116, 139, 0.2)",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}

              {newPassword && (
                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-[#71717a] sm:grid-cols-2">
                  {[
                    { key: "length", label: "At least 8 characters" },
                    { key: "uppercase", label: "One uppercase letter" },
                    { key: "lowercase", label: "One lowercase letter" },
                    { key: "number", label: "One number" },
                  ].map((req) => (
                    <div
                      key={req.key}
                      className={`flex items-center gap-2 ${passwordStrength.checks[req.key] ? "text-[#22c55e]" : "text-[#71717a]"}`}
                    >
                      <span className="inline-flex h-[14px] w-[14px] items-center justify-center">
                        {passwordStrength.checks[req.key] ? <CheckIcon /> : <span className="h-1 w-1 rounded-full bg-current" />}
                      </span>
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className={`mb-2 block text-sm font-medium transition ${focusedField === "confirm" ? "text-[#3b82f6]" : "text-white"}`}>Confirm Password</label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full rounded-[10px] border border-[#27272a] bg-[#0f0f0f] px-4 py-3 pr-12 text-[0.9375rem] text-white outline-none transition placeholder:text-[#71717a] focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/15"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField("confirm")}
                  onBlur={() => setFocusedField(null)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#71717a] transition hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {confirmPassword && (
                <div className={`mt-2 inline-flex items-center gap-2 text-xs ${newPassword === confirmPassword ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckIcon />
                      <span>Passwords match</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <span>Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-[10px] bg-white px-6 py-3.5 text-[0.9375rem] font-semibold text-[#050505] transition hover:-translate-y-px hover:bg-[#e4e4e7] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-transparent border-t-current" />
                  Resetting...
                </span>
              ) : (
                "Reset password"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#71717a]">
            <Link to="/login" className="font-medium text-[#3b82f6] transition hover:text-[#60a5fa]">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default ResetPassword;