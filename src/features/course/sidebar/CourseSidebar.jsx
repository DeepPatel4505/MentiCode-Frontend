import { NavLink } from "react-router";
import { cn } from "../../../lib/utils.js";

const courseNavigation = [
    { path: "/", label: "Courses", end: true },
    { path: "/roadmaps", label: "Roadmaps" },
    { path: "/my-learning", label: "MyLearning" },
    { path: "/leaderboard", label: "Leaderboard" },
    { path: "/pricing", label: "Pricing" },
];

function CourseSidebar() {
    return (
        <aside
            className="flex min-h-full flex-col p-4"
            aria-label="Course navigation"
        >
            {/* Section Header */}
            <div className="mb-6">
                <p className="m-0 text-xs uppercase tracking-uppercase text-text-muted font-semibold">
                    Learning Environment
                </p>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-2">
                {courseNavigation.map((item) => (
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

export default CourseSidebar;
