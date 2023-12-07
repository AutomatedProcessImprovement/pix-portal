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
  if (!user) {
    const params = new URLSearchParams({ redirectTo });
    throw redirect(`/login?${params}`);
  }
  return user;
}
