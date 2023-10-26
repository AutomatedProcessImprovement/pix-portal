import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

export interface User {
  email: string;
  token?: string;
  first_name?: string;
  last_name?: string;
  creation_time?: string;
  modification_time?: string;
  deletion_time?: string;
  last_login_time?: string;
  id?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
}

export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data as Record<string, unknown> | undefined;
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user as User;
}

function isUser(user: any) {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = "/"
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}
