// Auth and users backend API.

import axios from "axios";
import { loginURL, userInfoURL } from "~/services/shared";

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
