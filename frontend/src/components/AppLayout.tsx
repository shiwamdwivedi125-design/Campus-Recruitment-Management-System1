import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui";
import { cn } from "../lib/utils";

const nav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/companies", icon: Briefcase, label: "Companies" },
  { to: "/applications", icon: FileText, label: "Applications" },
  { to: "/resume-analyzer", icon: Sparkles, label: "AI Resume" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function AppLayout() {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-gradient shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CampusPlace</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active =
              location.pathname === item.to ||
              location.pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                "mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                location.pathname.startsWith("/admin")
                  ? "bg-primary/20 font-medium text-primary-glow"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
              )}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>
        <div className="mt-4 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
          <div className="truncate text-sm font-medium">{user?.email}</div>
          <div className="text-xs text-muted-foreground">
            {isAdmin ? "Admin / TPO" : "Student"}
          </div>
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start text-sm"
            onClick={() => {
              signOut();
              navigate("/");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
