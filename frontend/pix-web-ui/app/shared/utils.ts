import { json, redirect } from "@remix-run/node";
import { AxiosError } from "axios";
import { getSession, logout, sessionStorage } from "~/shared/session.server";
import type { FlashMessage } from "./flash_message";

export async function handleThrow(request: Request, func: () => Promise<any>) {
  try {
    return await func();
  } catch (error: any) {
    const flashMessage = flashMessageFromError(error);
    const session = await getSession(request);
    session.flash("flash", flashMessage);
    const responseInit = {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    };

    if (error instanceof AxiosError) {
      console.error("handleThrow error:", error.message);
      if (error.response?.status === 401) {
        // if unauthorized then logout
        return await logout(request, flashMessage);
      } else if (error.response?.status === 422) {
        // if bad request then redirect to a known URL
        return redirect("/projects", responseInit);
      }
    } else {
      console.error("handleThrow error:", error);
    }

    return json({}, responseInit);
  }
}

export function parseDate(dateString: string) {
  const date = new Date(dateString + "Z"); // appending Z to point that it's UTC time for further automatic conversion to local time in UI
  return date.toLocaleDateString("en-EE", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

function flashMessageFromError(error: any) {
  let flashMessage: FlashMessage = {
    message: "An error occurred",
    type: "error",
  };
  if (error.response && error.response.data && error.response.data.message) {
    flashMessage.message = error.response.data.message;
  } else if (error.message) {
    flashMessage.message = error.message;
  }
  return flashMessage;
}
