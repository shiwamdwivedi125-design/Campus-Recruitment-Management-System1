const TOKEN_KEY = "campus_place_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export type Profile = {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  branch?: string | null;
  graduation_year?: number | null;
  cgpa?: number | null;
  backlogs?: number;
  skills?: string[];
  bio?: string | null;
  resume_url?: string | null;
  readiness_score?: number;
};

export type Company = {
  id: string;
  name: string;
  role_title?: string | null;
  package_lpa?: number | null;
  location?: string | null;
  deadline?: string | null;
  min_cgpa?: number | null;
  max_backlogs?: number | null;
  allowed_branches?: string[];
  required_skills?: string[];
};

export type Application = {
  id: string;
  status: string;
  applied_at: string;
  company?: Company;
};

export async function api<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(path, {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }
  return data as T;
}
