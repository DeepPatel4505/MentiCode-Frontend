import { NavLink } from "react-router-dom";
import { Library, Map, BookOpen, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const courseNavigation = [
  { path: "/",            label: "Library",     end: true, icon: Library },
  { path: "/roadmaps",    label: "Roadmaps",              icon: Map },
  { path: "/my-learning", label: "My Learning",           icon: BookOpen },
  { path: "/leaderboard", label: "Leaderboard",           icon: Trophy },
  { path: "/pricing",     label: "Pricing",               icon: Sparkles },
];

function CourseSidebar() {
  return (
    <aside className="flex min-h-full flex-col px-3 py-5" aria-label="Course navigation">
      <div className="mb-5 px-2">
        <p className="m-0 text-[10px] uppercase tracking-[0.1em] text-neutral-600 font-semibold">
          Learning
        </p>
        <h2 className="mt-1 text-base font-semibold text-white">Courses</h2>
      </div>

      <nav className="flex flex-col gap-0.5">
        {courseNavigation.map(({ path, label, end, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              cn(
                "no-underline flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150",
                isActive
                  ? "text-violet-300 bg-violet-500/10"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.05]"
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default CourseSidebar;
