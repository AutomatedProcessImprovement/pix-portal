import { useMatches } from "@remix-run/react";
import { useMemo } from "react";
import type { User } from "~/services/auth";

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user as User;
}

function useMatchesData(id: string): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(() => matchingRoutes.find((route) => route.id === id), [matchingRoutes, id]);
  return route?.data as Record<string, unknown> | undefined;
}

function isUser(user: any) {
  return user && typeof user === "object" && typeof user.email === "string";
}
