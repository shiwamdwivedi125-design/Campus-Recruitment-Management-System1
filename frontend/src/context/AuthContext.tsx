import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, getToken, setToken, type Profile } from "../api/client";

type User = { id: string; email: string; isAdmin: boolean };

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api<{ user: User; profile: Profile | null }>("/api/auth/me");
      setUser(data.user);
      setProfile(data.profile);
    } catch {
      setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = async (email: string, password: string) => {
    const data = await api<{
      user: User;
      profile: Profile | null;
      token: string;
    }>("/api/auth/login", { method: "POST", json: { email, password } });
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const data = await api<{
      user: User;
      profile: Profile | null;
      token: string;
    }>("/api/auth/register", {
      method: "POST",
      json: { email, password, full_name: fullName },
    });
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile);
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: !!user?.isAdmin,
        signIn,
        signUp,
        signOut,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
