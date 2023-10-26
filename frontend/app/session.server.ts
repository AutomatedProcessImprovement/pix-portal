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
  remember: boolean,
  user: User,
  redirectTo: string = "/"
) {
  const session = await getSession(request);
  session.set("currentUser", user);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 : undefined, // 1 hour or none
      }),
    },
  });
}

export async function getSessionUserInfo(request: Request): Promise<User> {
  const session = await getSession(request);
  const user = session.get("currentUser");
  return user as User;
}

export async function requireLoggedInUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<User> {
  const user = await getSessionUserInfo(request);
  if (!user) {
    const params = new URLSearchParams({ redirectTo });
    throw redirect(`/login?${params}`);
  }
  return user;
}
