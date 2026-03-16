import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../../hooks/useAuth.js";
import { SimpleFormSkeleton } from "../../../components/auth/AuthSkeleton.jsx";

const ArrowLeftIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

function ForgotPassword() {
    const { loading, sendForgotPasswordEmail } = useAuth();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const success = await sendForgotPasswordEmail({ email });
        if (success) {
            alert("Reset password email sent successfully!");
            navigate("/login");
        } else {
            setError("Failed to send reset password email. Please try again.");
            alert("Failed to send reset password email. Please try again.");
        }

        setIsSubmitting(false);
    };

    if (loading) {
        return <SimpleFormSkeleton fieldCount={1} />;
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] p-4 text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-[-50%] h-full w-full max-w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)]" />
                <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
            </div>

            <div className="relative z-10 w-full max-w-[440px]">
                <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_25px_-5px_rgba(0,0,0,0.5),0_8px_10px_-6px_rgba(0,0,0,0.5)] sm:p-10">
                    <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-[#71717a] transition hover:text-white">
                        <ArrowLeftIcon />
                        <span>Back to sign in</span>
                    </Link>

                    <div className="mb-6 flex justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] text-white">
                            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                    </div>

                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-[1.75rem] font-bold tracking-[-0.02em] text-white">Forgot password?</h1>
                        <p className="text-[0.9375rem] text-[#71717a]">
                            {"No worries, we'll send you reset instructions."}
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
                            <label htmlFor="email" className={`mb-2 block text-sm font-medium transition ${focusedField === "email" ? "text-[#3b82f6]" : "text-white"}`}>Email</label>
                            <input
                                id="email"
                                type="email"
                                className="w-full rounded-[10px] border border-[#27272a] bg-[#0f0f0f] px-4 py-3 text-[0.9375rem] text-white outline-none transition placeholder:text-[#71717a] focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/15"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField("email")}
                                onBlur={() => setFocusedField(null)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-2 w-full rounded-[10px] bg-white px-6 py-3.5 text-[0.9375rem] font-semibold text-[#050505] transition hover:-translate-y-px hover:bg-[#e4e4e7] disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="inline-flex items-center justify-center gap-2">
                                    <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-transparent border-t-current" />
                                    Sending...
                                </span>
                            ) : (
                                "Send reset link"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default ForgotPassword;