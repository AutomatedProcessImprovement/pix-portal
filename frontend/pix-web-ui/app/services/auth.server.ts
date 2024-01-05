// Auth and users backend API.

import { http, loginURL, userInfoURL } from "~/services/shared.server";
import type { User } from "./auth";

export async function getJWT(username: string, password: string): Promise<string | undefined> {
  const response = await fetch(loginURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `username=${username}&password=${password}`,
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
