import { NavLink } from "react-router";
import { cn } from "../../../lib/utils.js";

const analyzeNavigation = [
    { path: "/analyze", label: "Dashboard", end: true },
    { path: "/analyze/playground", label: "Playground" },
    { path: "/analyze/my-analysis", label: "MyAnalysis" },
];

function AnalyzeSidebar() {
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
        </aside>
    );
}

export default AnalyzeSidebar;
