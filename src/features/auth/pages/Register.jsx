import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth.js";
import { getOAuthSignInUrl } from "../services/auth.api.js";
import { RegisterSkeleton } from "../components/auth/AuthSkeleton.jsx";

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

const GithubIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

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

function Register() {
    const { loading, handleRegister } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState(null);

    const googleOAuthUrl = getOAuthSignInUrl("google");
    const githubOAuthUrl = getOAuthSignInUrl("github");

    const navigate = useNavigate();

    const passwordStrength = useMemo(() => {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
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
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await handleRegister({ username, email, password });
            navigate("/login");
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <RegisterSkeleton />;
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
                        <h1 className="mb-2 text-[1.75rem] font-bold tracking-[-0.02em] text-white">Create an account</h1>
                        <p className="text-[0.9375rem] text-[#71717a]">Get started with your free account today</p>
                    </div>

                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:gap-3">
                        <a href={googleOAuthUrl} className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-[#27272a] bg-[#0f0f0f] px-4 py-3 text-sm font-medium text-white transition hover:-translate-y-px hover:border-[#71717a] hover:bg-[#1a1a1a]">
                            <GoogleIcon />
                            <span>Google</span>
                        </a>
                        <a href={githubOAuthUrl} className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-[#27272a] bg-[#0f0f0f] px-4 py-3 text-sm font-medium text-white transition hover:-translate-y-px hover:border-[#71717a] hover:bg-[#1a1a1a]">
                            <GithubIcon />
                            <span>GitHub</span>
                        </a>
                    </div>

                    <div className="mb-6 flex items-center gap-4">
                        <span className="h-px flex-1 bg-[#1a1a1a]" />
                        <span className="text-xs uppercase tracking-[0.05em] text-[#71717a]">or continue with email</span>
                        <span className="h-px flex-1 bg-[#1a1a1a]" />
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
                            <label htmlFor="username" className={`mb-2 block text-sm font-medium transition ${focusedField === "username" ? "text-[#3b82f6]" : "text-white"}`}>Username</label>
                            <input
                                id="username"
                                type="text"
                                className="w-full rounded-[10px] border border-[#27272a] bg-[#0f0f0f] px-4 py-3 text-[0.9375rem] text-white outline-none transition placeholder:text-[#71717a] focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/15"
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={() => setFocusedField("username")}
                                onBlur={() => setFocusedField(null)}
                                required
                            />
                        </div>

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

                        <div>
                            <label htmlFor="password" className={`mb-2 block text-sm font-medium transition ${focusedField === "password" ? "text-[#3b82f6]" : "text-white"}`}>Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="w-full rounded-[10px] border border-[#27272a] bg-[#0f0f0f] px-4 py-3 pr-12 text-[0.9375rem] text-white outline-none transition placeholder:text-[#71717a] focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/15"
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                            {password && (
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

                            {password && (
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

                        <button
                            type="submit"
                            className="mt-2 w-full rounded-[10px] bg-white px-6 py-3.5 text-[0.9375rem] font-semibold text-[#050505] transition hover:-translate-y-px hover:bg-[#e4e4e7] disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="inline-flex items-center justify-center gap-2">
                                    <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-transparent border-t-current" />
                                    Creating account...
                                </span>
                            ) : (
                                "Create account"
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-[#71717a]">
                        Already have an account?{" "}
                        <Link to="/login" className="font-medium text-[#3b82f6] transition hover:text-[#60a5fa]">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}

export default Register;