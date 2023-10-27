import { useMatches } from "@remix-run/react";
import { useMemo } from "react";
import { User } from "~/services/auth.server";
import { getSession, sessionStorage } from "~/session.server";
import { redirect } from "@remix-run/node";

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

export async function safeFetch(request: Request, func: () => Promise<any>) {
  try {
    return await func();
  } catch (error) {
    console.error("safeFetch error", error);

    const globalMessage =
      error.response.data.message || error.message || "Something went wrong";
    const session = await getSession(request);
    session.flash("globalMessage", globalMessage);

    // if (error.response.status === 401) {
    //   return redirect("/logout");
    // }
    //
    // return redirect("/", {
    //   headers: {
    //     "Set-Cookie": await sessionStorage.commitSession(session),
    //   },
    // });

    return redirect("/logout", {
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    });
  }
}
