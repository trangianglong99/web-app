const BASE_URL = import.meta.env.VITE_API_URL;
const withBase = (path: string) => `${BASE_URL}/api${path}`;

const getAuthHeaders = (includeAuth = true) => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(includeAuth && token && { Authorization: `Bearer ${token}` }),
  };
};

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const url = new URL(withBase(path));
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(await res.text());
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(withBase(path), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(await res.text());
  }
  
  // Handle empty response (common with 201 Created)
  const text = await res.text();
  if (!text) return {} as T;
  
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(withBase(path), {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(await res.text());
  }
  
  // Handle empty response (common with 200/204)
  const text = await res.text();
  if (!text) return {} as T;
  
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(withBase(path), { 
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(await res.text());
  }
  
  // Handle empty response (common with 204 No Content)
  const text = await res.text();
  if (!text) return {} as T;
  
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

// Auth-specific functions (no auth headers)
export async function authLogin(email: string, password: string) {
  const res = await fetch(withBase('/auth/login'), {
    method: "POST",
    headers: getAuthHeaders(false),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function authRegister(fullName: string, email: string, password: string) {
  const res = await fetch(withBase('/auth/register'), {
    method: "POST",
    headers: getAuthHeaders(false),
    body: JSON.stringify({ fullName, email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Profile code generator
export async function getProfileCode(
  prefix: string = "HS",
  pad: number = 6
): Promise<{ code: string }> {
  // Backend endpoint: GET /api/code/profile?prefix=HS&pad=6
  return apiGet<{ code: string }>("/code/profile", { prefix, pad });
}

export function militaryStatusToApi(ui: string): string {
  switch (ui) {
    case "Chưa nhập ngũ":
      return "CHUA_NHAP_NGU";
    case "Đang tại ngũ":
      return "DANG_TAI_NGU";
    case "Xuất ngũ":
      return "XUAT_NGU";
    default:
      return "CHUA_NHAP_NGU";
  }
}

export function militaryStatusFromApi(api: string): string {
  switch (api) {
    case "CHUA_NHAP_NGU":
      return "Chưa nhập ngũ";
    case "DANG_TAI_NGU":
      return "Đang tại ngũ";
    case "XUAT_NGU":
      return "Xuất ngũ";
    default:
      return api;
  }
}

export function militiaRoleToApi(ui: string): string {
  const map: Record<string, string> = {
    "Chiến sĩ": "CHIENSI",
    "Tiểu đội trưởng": "TIEUDOITRUONG",
    "Trung đội trưởng": "TRUNGDOITRUONG",
    "Chỉ huy phó": "CHIHUYPHO",
    "Chỉ huy trưởng": "CHIHUYTRUONG",
  };
  return map[ui] ?? "CHIENSI";
}

export function militiaRoleFromApi(api: string): string {
  const map: Record<string, string> = {
    CHIENSI: "Chiến sĩ",
    TIEUDOITRUONG: "Tiểu đội trưởng",
    TRUNGDOITRUONG: "Trung đội trưởng",
    CHIHUYPHO: "Chỉ huy phó",
    CHIHUYTRUONG: "Chỉ huy trưởng",
  };
  return map[api] ?? api;
}

export function attendanceUnitToApi(ui: string): string {
  if (ui.toLowerCase().includes("ủy ban")) return "UY_BAN";
  return "QUAN_SU";
}

export function attendanceUnitFromApi(api: string): string {
  return api === "UY_BAN" ? "Ủy ban" : "Quân sự";
}

export function attendanceStatusToApi(ui: string): string {
  switch (ui) {
    case "Có mặt":
      return "CO_MAT";
    case "Vắng":
      return "VANG";
    case "Nghỉ phép":
      return "NGHI_PHEP";
    default:
      return "CO_MAT";
  }
}

export function attendanceStatusFromApi(api: string): string {
  switch (api) {
    case "CO_MAT":
      return "Có mặt";
    case "VANG":
      return "Vắng";
    case "NGHI_PHEP":
      return "Nghỉ phép";
    default:
      return api;
  }
}
