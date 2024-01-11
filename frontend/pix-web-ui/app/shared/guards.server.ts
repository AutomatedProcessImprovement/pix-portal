import { getSessionUserInfo } from "./session.server";

import { redirect } from "@remix-run/node";
import type { User } from "~/services/auth";

export async function requireProjectIdInParams(params: Record<string, string | undefined>) {
  const projectId = params.projectId;
  if (!projectId) {
    throw new Error("No project ID in params");
  }
  return projectId;
}

export async function requireLoggedInUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<User> {
  const user = await getSessionUserInfo(request);
  const params = new URLSearchParams({ redirectTo });
  if (!user || user.deletion_time) throw redirect(`/login?${params}`);
  if (!user.is_verified) throw redirect(`/verify-email?${params}`);
  return user;
}

export async function optionalLoggedInUser(request: Request): Promise<User | undefined> {
  const user = await getSessionUserInfo(request);
  if (!user || user.deletion_time || !user.is_verified) return undefined;
  return user;
}
