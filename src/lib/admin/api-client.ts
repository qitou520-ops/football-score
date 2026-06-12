export async function adminFetch<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "请求失败");
  }
  return data;
}

export async function adminSave<T = unknown>(url: string, body: unknown): Promise<T> {
  return adminFetch<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function adminDelete(url: string): Promise<void> {
  await adminFetch(url, { method: "DELETE" });
}
