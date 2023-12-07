import { createCookieSessionStorage, redirect } from "@remix-run/node";

import fs from "fs";
import type { FlashMessage } from "~/shared/flash_message";
import type { User } from "../services/auth";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    secrets: [readSecretFromEnv("SESSION_SECRET_FILE") ?? "secret"], // default secret for development
    maxAge: 60 * 60, // 1 hour
  },
});

function readSecretFromEnv(name: string): string | undefined {
  if (!process.env.hasOwnProperty(name)) return undefined;
  const secretPath = process.env[name];
  try {
    if (secretPath && !fs.existsSync(secretPath)) {
      throw new Error(`Environmental variable ${name} does not exist at path ${secretPath}`);
    }
    return fs.readFileSync(secretPath!, "utf-8").trim();
  } catch (e) {
    return undefined;
  } finally {
    delete process.env[name];
  }
}

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function logout(request: Request, flashMessage?: FlashMessage) {
  const session = await getSession(request);
  await sessionStorage.destroySession(session);
  session.set("currentUser", null);

  const newSession = await sessionStorage.getSession();
  if (flashMessage) {
    newSession.flash("globalMessage", flashMessage);
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(newSession),
    },
  });
}

export async function createUserSession(request: Request, remember: boolean, user: User, redirectTo: string = "/") {
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

export async function getSessionUserInfo(request: Request): Promise<User | undefined> {
  const session = await getSession(request);
  const user = session.get("currentUser");
  if (!user) {
    return undefined;
  }
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
