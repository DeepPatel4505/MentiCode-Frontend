import { NavLink } from "react-router";
import { cn } from "../../../lib/utils.js";
import { useAuth } from "../../auth/hooks/useAuth.js";

const analyzeNavigation = [
    { path: "/analyze", label: "Dashboard", end: true },
    { path: "/analyze/playground", label: "Playground" },
    { path: "/analyze/my-analysis", label: "MyAnalysis" },
    { path: "/analyze/profile", label: "Profile" },
];

function AnalyzeSidebar() {
    const { handleLogout, loading } = useAuth();

    const onSignOut = async () => {
        await handleLogout();
    };

    return (
        <aside
            className="flex min-h-full flex-col p-4"
            aria-label="Analyze navigation"
        >
            {/* Section Header */}
            <div className="mb-6">
                <p className="m-0 text-xs uppercase tracking-uppercase text-text-muted font-semibold">
                    Dev Environment
                </p>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-2">
                {analyzeNavigation.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) =>
                            cn(
                                "no-underline block px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "text-accent-amber border border-accent-amber bg-accent-amber/10"
                                    : "text-text-muted hover:text-text-light hover:bg-white/5 border border-transparent"
                            )
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-6">
                <button
                    type="button"
                    onClick={onSignOut}
                    disabled={loading}
                    className={cn(
                        "w-full rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                        loading
                            ? "cursor-wait border-white/25 text-text-muted"
                            : "border-white text-text-light hover:border-accent-amber hover:text-accent-amber"
                    )}
                >
                    {loading ? "Signing out..." : "Sign Out"}
                </button>
            </div>
        </aside>
    );
}

export default AnalyzeSidebar;
