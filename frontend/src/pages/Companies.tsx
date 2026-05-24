import { useEffect, useState } from "react";
import { Briefcase, Calendar, CircleCheck, CircleX, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { api, type Company, type Profile } from "../api/client";
import { Badge, Button, Input, Loader } from "../components/ui";

function checkEligibility(company: Company, profile: Profile | null) {
  if (!profile) return { ok: false, reason: "Complete your profile first" };
  if ((profile.cgpa || 0) < (company.min_cgpa || 0))
    return { ok: false, reason: `CGPA below ${company.min_cgpa}` };
  if ((profile.backlogs || 0) > (company.max_backlogs || 0))
    return { ok: false, reason: `Backlogs exceed ${company.max_backlogs}` };
  const branches = company.allowed_branches || [];
  if (branches.length && profile.branch && !branches.includes(profile.branch))
    return { ok: false, reason: "Branch not eligible" };
  return { ok: true, reason: "Eligible" };
}

export function Companies() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<{
    companies: Company[];
    profile: Profile | null;
    applied: string[];
  } | null>(null);

  const load = () => {
    api<NonNullable<typeof data>>("/api/companies/").then(setData);
  };

  useEffect(() => {
    load();
  }, []);

  const apply = async (companyId: string) => {
    try {
      await api(`/api/companies/${companyId}/apply`, { method: "POST" });
      toast.success("Application submitted!");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  if (!data) return <Loader />;

  const filtered = data.companies.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="mt-1 text-muted-foreground">
            Browse drives and apply to ones you&apos;re eligible for.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-64 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed border-border bg-card/50 p-16 text-center text-muted-foreground">
          No companies yet. Admins can add drives from the Admin panel.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((company) => {
            const elig = checkEligibility(company, data.profile);
            const applied = data.applied.includes(company.id);
            return (
              <div
                key={company.id}
                className="flex flex-col rounded-xl border border-border/60 bg-card p-5 transition hover:border-primary/40 hover:shadow-glow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  {elig.ok ? (
                    <Badge className="border-success/30 bg-success/20 text-success">
                      <CircleCheck className="mr-1 h-3 w-3" />
                      Eligible
                    </Badge>
                  ) : (
                    <Badge className="border-border text-muted-foreground">
                      <CircleX className="mr-1 h-3 w-3" />
                      Not eligible
                    </Badge>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{company.name}</h3>
                {company.role_title && (
                  <p className="text-sm text-muted-foreground">{company.role_title}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {company.package_lpa != null && (
                    <span className="rounded-md bg-muted px-2 py-1">₹{company.package_lpa} LPA</span>
                  )}
                  {company.location && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                      <MapPin className="h-3 w-3" />
                      {company.location}
                    </span>
                  )}
                  {company.deadline && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(company.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="mt-auto pt-4">
                  {applied ? (
                    <Button disabled variant="outline" className="w-full">
                      Applied ✓
                    </Button>
                  ) : (
                    <Button
                      className="w-full disabled:opacity-50 disabled:shadow-none"
                      disabled={!elig.ok}
                      onClick={() => apply(company.id)}
                    >
                      {elig.ok ? "Apply now" : elig.reason}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
