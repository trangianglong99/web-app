const API = import.meta.env.VITE_API_URL;

export async function getJSON<T>(path: string, params?: Record<string, any>) {
  const qs = params
    ? "?" + new URLSearchParams(Object.entries(params).map(([k,v])=>[k, String(v)])).toString()
    : "";
  const res = await fetch(`${API}${path}${qs}`);
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

export async function sendJSON<T>(path: string, method: "POST"|"PUT"|"DELETE", body?: any) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}