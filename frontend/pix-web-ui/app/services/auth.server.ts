// Auth and users backend API.

import { http, loginURL, userInfoURL, verifyURL } from "~/services/shared.server";
import type { User } from "./auth";

export async function getJWT(username: string, password: string): Promise<string | undefined> {
  console.log("Fetching URL:", loginURL);
  const usernameEncoded = encodeURIComponent(username);
  const passwordEncoded = encodeURIComponent(password);
  const response = await fetch(loginURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `username=${usernameEncoded}&password=${passwordEncoded}`,
  });
  const data = await response.json();
  return data.access_token;
}

export async function getUserInfo(token: string): Promise<User> {
  const { data } = await http.get(userInfoURL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data as User;
}

export async function verifyEmail(token: string): Promise<boolean> {
  const response = await fetch(verifyURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) throw new Error(response.statusText);
  return true;
}
