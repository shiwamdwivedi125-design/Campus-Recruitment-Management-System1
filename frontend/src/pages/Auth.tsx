import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Label } from "../components/ui";

export function Auth() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "signin") {
        await signIn(email, password);
        toast.success("Welcome back!");
      } else {
        await signUp(email, password, fullName);
        toast.success("Account created!");
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-4">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-gradient shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">CampusPlace</span>
        </Link>
        <div className="rounded-2xl border border-border/60 bg-card/80 p-8 shadow-card backdrop-blur-xl">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-md py-2 text-sm font-medium ${
                  tab === t ? "bg-background shadow" : "text-muted-foreground"
                }`}
              >
                {t === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-4">
            {tab === "signup" && (
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tab === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo: student@campusplace.edu / student123 · admin@campusplace.edu / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
