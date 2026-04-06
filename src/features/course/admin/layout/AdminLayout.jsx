import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard, BookOpen, Users, BarChart3,
  Zap, LogOut, Menu, X, ChevronRight, Map,
} from "lucide-react";
import { useState } from "react";
import { logoutUser } from "@/app/store/slices/authSlice";
import { selectUser } from "@/app/store/slices/authSlice";
import { Avatar } from "@/components/ui/index";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin",           label: "Dashboard",  icon: LayoutDashboard, exact: true },
  { to: "/admin/courses",   label: "Courses",    icon: BookOpen },
  { to: "/admin/roadmaps",  label: "Roadmaps",   icon: Map },
  { to: "/admin/users",     label: "Users",      icon: Users },
  { to: "/admin/analytics", label: "Analytics",  icon: BarChart3 },
];

function SidebarLink({ item }) {
  const location = useLocation();
  const isActive = item.exact
    ? location.pathname === item.to
    : location.pathname.startsWith(item.to);

  return (
    <Link to={item.to} className={cn("admin-sidebar-link", isActive && "active")}>
      <item.icon className="w-4 h-4 shrink-0" />
      <span>{item.label}</span>
      {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
    </Link>
  );
}

export default function AdminLayout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const user      = useSelector(selectUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-admin-bg flex">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 bg-admin-sidebar border-r border-border shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-none">MentiCode</p>
              <p className="text-xs text-primary font-medium">Admin</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map((item) => <SidebarLink key={item.to} item={item} />)}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-border space-y-1">
          <Link to="/" className="admin-sidebar-link text-xs">
            <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back to site
          </Link>
          <button onClick={handleLogout} className="admin-sidebar-link w-full text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
            <Avatar src={user?.avatarUrl} name={user?.username} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{user?.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 bg-admin-sidebar border-r border-border flex flex-col animate-slide-right">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <span className="font-bold">Admin Panel</span>
              <button onClick={() => setSidebarOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5">
              {NAV.map((item) => (
                <div key={item.to} onClick={() => setSidebarOpen(false)}>
                  <SidebarLink item={item} />
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top nav */}
        <header className="bg-admin-nav border-b border-border h-14 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <button className="lg:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-4 h-4" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Avatar src={user?.avatarUrl} name={user?.username} size="sm" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
