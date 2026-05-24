import { useState } from "react";
import { CircleCheck, Loader2, Sparkles, Target, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api/client";
import { Button, Input, Label, Textarea } from "../components/ui";

type Analysis = {
  ats_score: number;
  summary: string;
  strengths: string[];
  missing_skills: string[];
  suggestions: string[];
  detected_skills: string[];
};

function ListCard({
  icon: Icon,
  title,
  items,
  color,
  pills,
}: {
  icon: typeof CircleCheck;
  title: string;
  items: string[];
  color: string;
  pills?: boolean;
}) {
  if (!items?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <h3 className={`flex items-center gap-2 font-semibold ${color}`}>
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      {pills ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((t) => (
            <span key={t} className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary-glow">
              {t}
            </span>
          ))}
        </div>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ResumeAnalyzer() {
  const [text, setText] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);

  const analyze = async () => {
    if (text.length < 50) {
      toast.error("Paste at least 50 characters of your resume");
      return;
    }
    setLoading(true);
    try {
      const data = await api<Analysis>("/api/resume/analyze", {
        method: "POST",
        json: { resumeText: text, targetRole: role || undefined },
      });
      setResult(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-gradient shadow-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Resume Analyzer</h1>
          <p className="text-sm text-muted-foreground">
            Get ATS score, skill gaps and personalized suggestions.
          </p>
        </div>
      </div>
      <div className="mt-8 rounded-xl border border-border/60 bg-card p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Target role (optional)</Label>
            <Input
              placeholder="e.g. Frontend Developer, Data Analyst"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Paste your resume text</Label>
            <Textarea
              rows={10}
              placeholder="Copy-paste your resume contents here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <Button onClick={analyze} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze with AI
              </>
            )}
          </Button>
        </div>
      </div>
      {result && (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm text-muted-foreground">ATS Compatibility Score</div>
                <div className="mt-1 text-5xl font-bold text-gradient">
                  {result.ats_score}
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
              </div>
              <Target className="h-12 w-12 text-primary-glow" />
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary-gradient"
                style={{ width: `${result.ats_score}%` }}
              />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{result.summary}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ListCard icon={CircleCheck} title="Strengths" items={result.strengths} color="text-success" />
            <ListCard
              icon={TriangleAlert}
              title="Missing skills"
              items={result.missing_skills}
              color="text-warning"
            />
          </div>
          <ListCard
            icon={Sparkles}
            title="Suggestions"
            items={result.suggestions}
            color="text-primary-glow"
          />
          <ListCard
            icon={CircleCheck}
            title="Detected skills"
            items={result.detected_skills}
            color="text-primary"
            pills
          />
        </div>
      )}
    </div>
  );
}
