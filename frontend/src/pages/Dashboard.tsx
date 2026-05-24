import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, FileText, Sparkles, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../api/client";
import { Loader } from "../components/ui";

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Dashboard() {
  const [data, setData] = useState<{
    profile: { full_name?: string; readiness_score?: number } | null;
    apps: { status: string }[];
    openCompanies: number;
  } | null>(null);

  useEffect(() => {
    api<typeof data>("/api/dashboard/").then(setData);
  }, []);

  if (!data) return <Loader />;

  const selected = data.apps.filter((a) => a.status === "Selected").length;
  const breakdown: Record<string, number> = {};
  data.apps.forEach((a) => {
    breakdown[a.status] = (breakdown[a.status] || 0) + 1;
  });
  const chartData = Object.entries(breakdown).map(([status, count]) => ({ status, count }));

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {data.profile?.full_name || "Student"} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Here&apos;s your placement snapshot.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Briefcase} label="Open drives" value={data.openCompanies} hint="Currently accepting" />
        <Stat icon={FileText} label="My applications" value={data.apps.length} />
        <Stat icon={TrendingUp} label="Selected" value={selected} hint="Offers in hand" />
        <Stat
          icon={Sparkles}
          label="Readiness score"
          value={`${data.profile?.readiness_score ?? 0}/100`}
        />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold">Application status breakdown</h3>
          {chartData.length === 0 ? (
            <p className="mt-8 py-12 text-center text-sm text-muted-foreground">
              No applications yet.{" "}
              <Link to="/companies" className="text-primary underline">
                Browse companies →
              </Link>
            </p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(30% 0.04 260)" />
                  <XAxis dataKey="status" tick={{ fill: "oklch(68% 0.03 255)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "oklch(68% 0.03 255)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(22% 0.04 260)",
                      border: "1px solid oklch(30% 0.04 260)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="count" fill="oklch(68% 0.18 250)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h3 className="text-lg font-semibold">Quick actions</h3>
          <div className="mt-4 space-y-2">
            {[
              ["/profile", "📝 Complete profile"],
              ["/companies", "🏢 Browse companies"],
              ["/resume-analyzer", "✨ Analyze your resume"],
              ["/applications", "📊 Track interviews"],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="block rounded-lg border border-border bg-background p-3 text-sm hover:border-primary/50"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
