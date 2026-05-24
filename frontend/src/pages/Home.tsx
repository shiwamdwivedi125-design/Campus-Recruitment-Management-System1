import { Link } from "react-router-dom";
import {
  Briefcase,
  CircleCheck,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-hero-gradient">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-gradient shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">CampusPlace</span>
        </div>
        <div className="flex gap-3">
          {user ? (
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline">Sign in</Button>
              </Link>
              <Link to="/auth">
                <Button>Get started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="relative mx-auto max-w-5xl px-6 pb-24 pt-16 text-center md:pt-24">
        <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-7xl">
          Placements,{" "}
          <span className="text-gradient">automated end-to-end</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          TPOs and students get one source of truth — registration, eligibility,
          interview tracking, AI resume analysis and analytics.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to={user ? "/dashboard" : "/auth"}>
            <Button className="px-8 py-3 text-base">Start now</Button>
          </Link>
          <Link to="/companies">
            <Button variant="outline" className="px-8 py-3 text-base">
              Browse drives
            </Button>
          </Link>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-6 px-6 pb-24 md:grid-cols-3">
        {[
          {
            icon: Briefcase,
            title: "Company drives",
            desc: "Browse openings, check eligibility by CGPA & branch, apply in one click.",
          },
          {
            icon: Sparkles,
            title: "AI resume analyzer",
            desc: "ATS score, skill gaps and personalized suggestions for your target role.",
          },
          {
            icon: TrendingUp,
            title: "Interview tracking",
            desc: "From Applied to Selected — track every round with visual progress.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-border/60 bg-card/80 p-6 shadow-card backdrop-blur-xl"
          >
            <f.icon className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="relative border-t border-border/60 bg-card/30 py-16">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 px-6 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CircleCheck className="h-4 w-4 text-success" />
            Eligibility checks
          </span>
          <span className="inline-flex items-center gap-2">
            <CircleCheck className="h-4 w-4 text-success" />
            Admin panel for TPO
          </span>
          <span className="inline-flex items-center gap-2">
            <CircleCheck className="h-4 w-4 text-success" />
            Full-stack API + database
          </span>
        </div>
      </section>
    </div>
  );
}
