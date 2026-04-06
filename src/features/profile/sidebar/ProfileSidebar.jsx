import { Link, useLocation } from "react-router-dom";
import { User, Settings, Github } from "lucide-react";
import { cn } from "@/lib/utils";

const profileNavigation = [
  { key: "info", label: "Info", icon: User },
  { key: "settings", label: "Settings", icon: Settings },
];

function ProfileSidebar() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeSection = searchParams.get("section") === "settings" ? "settings" : "info";
  const basePath = location.pathname.startsWith("/profile") ? location.pathname : "/profile";

  return (
    <aside className="flex min-h-full flex-col px-3 py-5" aria-label="Profile navigation">
      <div className="mb-5 px-2">
        <p className="m-0 text-[10px] uppercase tracking-[0.1em] text-neutral-600 font-semibold">
          Account
        </p>
        <h2 className="mt-1 text-base font-semibold text-white">Profile</h2>
      </div>

      <nav className="flex flex-col gap-0.5">
        {profileNavigation.map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            to={`${basePath}?section=${key}`}
            className={cn(
              "no-underline flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150",
              activeSection === key
                ? "text-violet-300 bg-violet-500/10"
                : "text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.05]"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-3">
        <p className="text-[10px] uppercase tracking-[0.08em] text-neutral-600">Integrations</p>
        <p className="mt-1 text-xs text-neutral-400">Connect GitHub in Settings to enable repository workflows.</p>
        <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-neutral-500">
          <Github className="w-3.5 h-3.5" />
          GitHub
        </div>
      </div>
    </aside>
  );
}

export default ProfileSidebar;
