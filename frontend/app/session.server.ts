import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { User } from "~/utils";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    secrets: [process.env.SESSION_SECRET!],
  },
});

async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

export async function createUserSession(
  request: Request,
  email: string,
  token: string,
  remember: boolean,
  redirectTo: string = "/"
) {
  const session = await getSession(request);
  session.set("userEmail", email);
  session.set("userToken", token);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 : undefined, // 1 hour or none
      }),
    },
  });
}

export async function getUserInfo(request: Request): Promise<User> {
  const session = await getSession(request);
  const email = session.get("userEmail");
  const token = session.get("userToken");
  return { email, token };
}

export async function requireUserEmail(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const { email } = await getUserInfo(request);
  if (!email) {
    const params = new URLSearchParams({ redirectTo });
    throw redirect(`/login?${params}`);
  }
  return email;
}
