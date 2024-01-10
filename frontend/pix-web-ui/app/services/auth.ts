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
  if ("message" in data) throw new Error(data.message);
  return data as User;
}
