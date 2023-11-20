// Auth and users backend API.

import axios from "axios";
import { loginURL, userInfoURL } from "~/services/shared.server";
import { User } from "./auth";

export async function getJWT(username: string, password: string): Promise<string> {
  const { data } = await axios.post(
    loginURL,
    {
      username: username,
      password: password,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return data.access_token;
}

export async function getUserInfo(token: string): Promise<User> {
  const { data } = await axios.get(userInfoURL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data as User;
}
