import axios from "axios";

const loginURL = "http://localhost:9999/api/v1/auth/jwt/login";
const userInfoURL = "http://localhost:9999/api/v1/users/me";

export async function getJWT(
  username: string,
  password: string
): Promise<string> {
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

export async function getUserInfo(token: string): Promise<any> {
  const { data } = await axios.get(userInfoURL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}
