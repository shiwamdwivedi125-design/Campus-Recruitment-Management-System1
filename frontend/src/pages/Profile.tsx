import { useEffect, useState } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { api, getToken, type Profile } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Label, Loader, Textarea } from "../components/ui";

export function ProfilePage() {
  const { refresh } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [skillsText, setSkillsText] = useState("");
  const [form, setForm] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api<Profile | null>("/api/profiles/me").then((p) => {
      if (p) {
        setForm(p);
        setSkillsText((p.skills || []).join(", "));
      }
      setLoaded(true);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const skills = skillsText.split(",").map((s) => s.trim()).filter(Boolean);
      const updated = await api<Profile>("/api/profiles/me", {
        method: "PATCH",
        json: {
          full_name: form.full_name,
          phone: form.phone,
          branch: form.branch,
          graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
          cgpa: form.cgpa ? Number(form.cgpa) : undefined,
          backlogs: form.backlogs != null ? Number(form.backlogs) : undefined,
          skills,
          bio: form.bio,
        },
      });
      setForm(updated);
      await refresh();
      toast.success("Profile saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadResume = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("PDF only");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((f) => ({ ...f, resume_url: data.resume_url }));
      await refresh();
      toast.success("Resume uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!loaded) return <Loader />;

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-10">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      <p className="mt-1 text-muted-foreground">
        Complete your profile for better matching and readiness score.
      </p>
      <div className="mt-8 rounded-xl border border-border/60 bg-card p-6">
        <h3 className="mb-4 font-semibold">Resume</h3>
        {form.resume_url ? (
          <a
            href={form.resume_url}
            target="_blank"
            rel="noreferrer"
            className="mb-4 flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success underline"
          >
            <FileText className="h-4 w-4" />
            View uploaded resume
          </a>
        ) : (
          <p className="mb-3 text-sm text-muted-foreground">No resume uploaded yet.</p>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-gradient px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {form.resume_url ? "Replace resume" : "Upload resume (PDF)"}
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadResume(f);
            }}
          />
        </label>
      </div>
      <div className="mt-6 grid gap-4 rounded-xl border border-border/60 bg-card p-6 md:grid-cols-2">
        {[
          ["Full name", "full_name", "text"],
          ["Phone", "phone", "text"],
          ["Branch", "branch", "text"],
          ["Graduation year", "graduation_year", "number"],
          ["CGPA", "cgpa", "number"],
          ["Backlogs", "backlogs", "number"],
        ].map(([label, key, type]) => (
          <div key={key} className="space-y-2">
            <Label>{label}</Label>
            <Input
              type={type}
              value={String(form[key as keyof Profile] ?? "")}
              onChange={(e) =>
                setForm({ ...form, [key]: type === "number" ? e.target.value : e.target.value })
              }
            />
          </div>
        ))}
        <div className="space-y-2 md:col-span-2">
          <Label>Skills (comma separated)</Label>
          <Input
            placeholder="React, Node.js, Python"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Bio</Label>
          <Textarea rows={3} value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save profile
          </Button>
        </div>
      </div>
    </div>
  );
}
