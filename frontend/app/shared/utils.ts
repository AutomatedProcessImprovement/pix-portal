import { AxiosError } from "axios";
import { getSession, logout } from "~/shared/session.server";

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
