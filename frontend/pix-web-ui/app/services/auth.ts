export interface User {
  email: string;
  token?: string;
  first_name: string;
  last_name: string;
  creation_time: string;
  modification_time: string;
  deletion_time: string;
  last_login_time: string;
  id: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}

export async function createUser({
  email,
  password,
  first_name,
  last_name,
}: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}): Promise<User> {
  const url = `auth/register`;
  const u = new URL(url, window.ENV.BACKEND_BASE_URL_PUBLIC);
  const response = await fetch(u, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: window.location.origin,
    },
    body: JSON.stringify({ email, password, first_name, last_name }),
  });
  if (!response.ok) throw new Error(response.statusText);
  const data = await response.json();
  if ("message" in data && data.message) throw new Error(data.message);
  return data as User;
}

export async function requestEmailVerification(email: string) {
  const url = `auth/request-verify-token`;
  const u = new URL(url, window.ENV.BACKEND_BASE_URL_PUBLIC);
  const response = await fetch(u, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: window.location.origin,
    },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error(response.statusText);
  return true;
}

export async function requestPasswordReset(email: string) {
  const url = `auth/forgot-password`;
  const u = new URL(url, window.ENV.BACKEND_BASE_URL_PUBLIC);
  const response = await fetch(u, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: window.location.origin,
    },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error(response.statusText);
  return true;
}

export async function deleteUser(token: string) {
  const url = `users/`;
  const u = new URL(url, window.ENV.BACKEND_BASE_URL_PUBLIC);
  const response = await fetch(u, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Origin: window.location.origin,
    },
  });
  if (!response.ok) throw new Error(response.statusText);
  return true;
}
