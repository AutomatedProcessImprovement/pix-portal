import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useOptionalUser } from "~/utils";
import Header from "~/components/Header";
import { Link, useLoaderData } from "@remix-run/react";
import { getSession, sessionStorage } from "~/session.server";
import ToastMessage from "~/components/ToastMessage";
import { FlashMessage as FlashMessageType } from "~/shared/flash_message";

export const meta: MetaFunction = () => {
  return [
    { title: "PIX" },
    { name: "description", content: "Process Improvement Explorer" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);

  let flashMessage;
  const message = session.get("globalMessage");
  if (message) {
    flashMessage = message as FlashMessageType;
  }

  return json(
    { flashMessage },
    { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } }
  );
}

export default function Index() {
  const user = useOptionalUser();
  const { flashMessage } = useLoaderData<typeof loader>();

  if (flashMessage) {
    setTimeout(() => {
      document.getElementById("global-message")?.remove();
    }, 5000);
  }

  if (user) {
    return (
      <>
        {flashMessage && <ToastMessage message={flashMessage} />}
        <Header userEmail={user.email} />
        <p>Logged in</p>
        <p>Email: {user.email}</p>
        <Link to={`/projects`}>Projects</Link>
      </>
    );
  }

  return (
    <>
      {flashMessage && <ToastMessage message={flashMessage} />}
      <Header userEmail={null} />
      <p>Not logged in</p>
      <Link to={`/login`}>Login</Link>
    </>
  );
}
