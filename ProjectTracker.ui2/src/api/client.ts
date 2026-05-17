const API_BASE = import.meta.env.VITE_API_URL ?? "";

class ApiError extends Error {
  public status: number;
  constructor(
    status: number,
    message: string,
  ) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    throw new ApiError(401, "Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => `HTTP ${res.status}`);
    throw new ApiError(res.status, text || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: (path: string) => request<void>("DELETE", path),
};

export { ApiError };
