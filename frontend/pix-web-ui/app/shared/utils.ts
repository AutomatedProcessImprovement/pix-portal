import { getSession, logout } from "~/shared/session.server";

export async function handleThrow(request: Request, func: () => Promise<any>) {
  try {
    return await func();
  } catch (error: any) {
    console.error("handleThrow error", error);

    let globalMessage = "An unknown error occurred";

    if (error.response && error.response.data && error.response.data.message) {
      globalMessage = error.response.data.message;
    } else if (error.message) {
      globalMessage = error.message;
    }

    const session = await getSession(request);
    session.flash("globalMessage", globalMessage);

    return await logout(request, {
      type: "error",
      message: globalMessage,
      isAlert: true,
    });
  }
}

export function parseDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-EE", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}
