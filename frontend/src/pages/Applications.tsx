import { useEffect, useState } from "react";
import { api, type Application } from "../api/client";
import { Badge, Loader } from "../components/ui";

const STAGES = ["Applied", "Shortlisted", "Aptitude", "GD", "Technical", "HR", "Selected"];

export function Applications() {
  const [apps, setApps] = useState<Application[] | null>(null);

  useEffect(() => {
    api<Application[]>("/api/applications/me").then(setApps);
  }, []);

  if (!apps) return <Loader />;

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10">
      <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
      <p className="mt-1 text-muted-foreground">
        Track your interview progress for each drive.
      </p>
      {apps.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed border-border bg-card/50 p-16 text-center text-muted-foreground">
          No applications yet.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {apps.map((app) => {
            const idx = STAGES.indexOf(app.status);
            const rejected = app.status === "Rejected";
            return (
              <div key={app.id} className="rounded-xl border border-border/60 bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">{app.company?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {app.company?.role_title} · ₹{app.company?.package_lpa} LPA
                    </p>
                  </div>
                  <Badge
                    className={
                      app.status === "Selected"
                        ? "border-success/30 bg-success/20 text-success"
                        : rejected
                          ? "border-destructive/30 bg-destructive/20 text-destructive"
                          : "border-primary/30 bg-primary/20 text-primary-glow"
                    }
                  >
                    {app.status}
                  </Badge>
                </div>
                {!rejected && (
                  <div className="mt-6 flex items-center gap-1 overflow-x-auto pb-2">
                    {STAGES.map((stage, i) => (
                      <div key={stage} className="flex min-w-[80px] flex-1 flex-col items-center">
                        <div
                          className={`h-2 w-full rounded-full ${
                            i <= idx ? "bg-primary-gradient" : "bg-muted"
                          }`}
                        />
                        <div
                          className={`mt-2 text-xs ${
                            i <= idx ? "font-medium text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {stage}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Applied {new Date(app.applied_at).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
