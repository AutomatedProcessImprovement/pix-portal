import { useMatches } from "@remix-run/react";
import { AxiosError } from "axios";
import { useMemo } from "react";
import { getSession, logout } from "~/session.server";
import { User } from "./services/auth";

export function useMatchesData(id: string): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(() => matchingRoutes.find((route) => route.id === id), [matchingRoutes, id]);
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

export function safeRedirect(to: FormDataEntryValue | string | null | undefined, defaultRedirect: string = "/") {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

export async function handleThrow(request: Request, func: () => Promise<any>) {
  try {
    return await func();
  } catch (error: any) {
    console.error("safeFetch error", error);

    let globalMessage;

    if (error.response && error.response.data && error.response.data.message) {
      globalMessage = error.response.data.message;
    } else if (error.message) {
      globalMessage = error.message;
    } else if (error instanceof AxiosError && error.errors) {
      globalMessage = error.errors.map((e: { message: any }) => e.message).join(". ");
    } else {
      globalMessage = "An unknown error occurred";
    }

    console.error("globalMessage:", globalMessage);

    const session = await getSession(request);
    session.flash("globalMessage", globalMessage);

    return await logout(request, {
      type: "error",
      message: globalMessage,
      isAlert: true,
    });
  }
}
