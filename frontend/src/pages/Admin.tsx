import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, type Application, type Company } from "../api/client";
import { Button, Input, Label, Loader } from "../components/ui";

const STATUSES = [
  "Applied",
  "Shortlisted",
  "Aptitude",
  "GD",
  "Technical",
  "HR",
  "Selected",
  "Rejected",
];

export function Admin() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [applications, setApplications] = useState<
    (Application & { student?: { email: string; profile?: { full_name?: string } } })[]
  >([]);
  const [form, setForm] = useState({
    name: "",
    role_title: "",
    package_lpa: "",
    location: "",
    min_cgpa: "7",
    max_backlogs: "0",
    allowed_branches: "CSE, IT, ECE",
    required_skills: "",
  });

  const load = async () => {
    const [s, c, a] = await Promise.all([
      api<Record<string, number>>("/api/admin/stats"),
      api<Company[]>("/api/admin/companies"),
      api<typeof applications>("/api/admin/applications"),
    ]);
    setStats(s);
    setCompanies(c);
    setApplications(a);
  };

  useEffect(() => {
    load();
  }, []);

  const addCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api("/api/admin/companies", {
        method: "POST",
        json: {
          name: form.name,
          role_title: form.role_title,
          package_lpa: Number(form.package_lpa) || undefined,
          location: form.location,
          min_cgpa: Number(form.min_cgpa),
          max_backlogs: Number(form.max_backlogs),
          allowed_branches: form.allowed_branches.split(",").map((b) => b.trim()),
          required_skills: form.required_skills.split(",").map((s) => s.trim()).filter(Boolean),
        },
      });
      toast.success("Company added");
      setForm({
        name: "",
        role_title: "",
        package_lpa: "",
        location: "",
        min_cgpa: "7",
        max_backlogs: "0",
        allowed_branches: "CSE, IT, ECE",
        required_skills: "",
      });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const deleteCompany = async (id: string) => {
    await api(`/api/admin/companies/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await api(`/api/admin/applications/${id}/status`, {
      method: "PATCH",
      json: { status },
    });
    toast.success("Status updated");
    load();
  };

  if (!stats) return <Loader />;

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage drives and student applications.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Students", stats.students],
          ["Companies", stats.companies],
          ["Applications", stats.applications],
          ["Selected", stats.selected],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/60 bg-card p-5">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-2 text-3xl font-bold">{value}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={addCompany} className="rounded-xl border border-border/60 bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold">Add company drive</h2>
          <div className="space-y-2">
            <Label>Company name</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Role title</Label>
            <Input value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Package (LPA)</Label>
              <Input value={form.package_lpa} onChange={(e) => setForm({ ...form, package_lpa: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Min CGPA</Label>
              <Input value={form.min_cgpa} onChange={(e) => setForm({ ...form, min_cgpa: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Max backlogs</Label>
              <Input value={form.max_backlogs} onChange={(e) => setForm({ ...form, max_backlogs: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Branches (comma)</Label>
            <Input value={form.allowed_branches} onChange={(e) => setForm({ ...form, allowed_branches: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Required skills (comma)</Label>
            <Input value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} />
          </div>
          <Button type="submit">Add drive</Button>
        </form>
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Active drives ({companies.length})</h2>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {companies.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-muted-foreground">{c.role_title}</div>
                </div>
                <Button variant="outline" className="text-destructive" onClick={() => deleteCompany(c.id)}>
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Applications</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 pr-4">Student</th>
                <th className="pb-2 pr-4">Company</th>
                <th className="pb-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id} className="border-b border-border/50">
                  <td className="py-3 pr-4">
                    {a.student?.profile?.full_name || a.student?.email}
                  </td>
                  <td className="py-3 pr-4">{a.company?.name}</td>
                  <td className="py-3">
                    <select
                      className="rounded-lg border border-border bg-input px-2 py-1"
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
