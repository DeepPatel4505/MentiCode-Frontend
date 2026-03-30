import { useEffect, useState } from "react";
import { Search, Users, Shield, Crown, Ban, CheckCircle2 } from "lucide-react";
import { Input, Card, Badge, Skeleton, Avatar } from "@/components/ui/index";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import api from "@/lib/api";
import { cn, timeAgo } from "@/lib/utils";

export default function AdminUsers() {
  const { toast } = useToast();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("");

  useEffect(() => {
    // user-service endpoint — proxied via Vite
    api.get("/auth/admin/users", { params: { limit: 100 } })
      .then((r) => setUsers(r.data.data?.users ?? []))
      .catch(() => {
        // If admin users endpoint not available yet, show placeholder data
        setUsers([]);
        toast({ title: "Users API not available", description: "Implement GET /auth/admin/users in user-service.", type: "warning" });
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || (filter === "pro" ? u.plan === "pro" : filter === "admin" ? u.role === "admin" : true);
    return matchSearch && matchFilter;
  });

  const totalPro   = users.filter((u) => u.plan === "pro").length;
  const totalAdmin = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{users.length} registered users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Users,       label: "Total users", value: users.length,  color: "text-primary" },
          { icon: Crown,       label: "Pro users",   value: totalPro,      color: "text-amber-400" },
          { icon: Shield,      label: "Admins",      value: totalAdmin,    color: "text-blue-400" },
          { icon: CheckCircle2,label: "Verified",    value: users.filter((u) => u.isEmailVerified).length, color: "text-green-400" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className={cn("w-4 h-4", s.color)} />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {[{ v: "", l: "All" }, { v: "pro", l: "Pro" }, { v: "admin", l: "Admin" }].map(({ v, l }) => (
            <button key={v} onClick={() => setFilter(v)}
              className={cn("px-3.5 py-2 rounded-xl text-sm font-medium transition-all border",
                filter === v ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"
              )}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Plan</th>
                <th className="hidden sm:table-cell">Verified</th>
                <th className="hidden md:table-cell">Provider</th>
                <th className="hidden lg:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={6}><Skeleton className="h-12 w-full rounded-lg" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    {users.length === 0 ? "User management API not connected yet" : "No users found"}
                  </td>
                </tr>
              ) : filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatarUrl} name={u.username} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{u.username}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">{u.role}</Badge>
                  </td>
                  <td>
                    <Badge variant={u.plan === "pro" ? "pro" : "outline"} className="capitalize">{u.plan}</Badge>
                  </td>
                  <td className="hidden sm:table-cell">
                    {u.isEmailVerified
                      ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                      : <span className="text-xs text-amber-400">Pending</span>
                    }
                  </td>
                  <td className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground capitalize">{u.loginProvider}</span>
                  </td>
                  <td className="hidden lg:table-cell text-sm text-muted-foreground">{timeAgo(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
