import { logout } from "~/shared/session.server";
import type { FlashMessage } from "./flash_message";

export async function handleThrow(request: Request, func: () => Promise<any>) {
  try {
    return await func();
  } catch (error: any) {
    console.error("handleThrow error", error);
    const flashMessage = flashMessageFromError(error);
    return await logout(request, flashMessage);
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
