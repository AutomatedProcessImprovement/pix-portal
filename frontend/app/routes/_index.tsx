import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Header from "~/components/Header";
import ToastMessage from "~/components/ToastMessage";
import { getSession, sessionStorage } from "~/session.server";
import type { FlashMessage as FlashMessageType } from "~/shared/flash_message";
import { useOptionalUser } from "~/utils";

export const meta: MetaFunction = () => {
  return [{ title: "PIX" }, { name: "description", content: "Process Improvement Explorer" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);

  let flashMessage;
  const message = session.get("globalMessage");
  if (message) {
    flashMessage = message as FlashMessageType;
  }

  return json({ flashMessage }, { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } });
}

export default function Index() {
  const user = useOptionalUser();
  const { flashMessage } = useLoaderData<typeof loader>();

  if (flashMessage) {
    setTimeout(() => {
      window && window.document.getElementById("global-message")?.remove();
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
    <div className="flex flex-col h-screen">
      {flashMessage && <ToastMessage message={flashMessage} />}
      <Header userEmail={null} />
      <section className="flex flex-1 flex-col space-y-4 items-center justify-center">
        <div className="flex flex-col items-center p-6">
          <p>Not logged in</p>
          <Link to={`/login`}>Login</Link>
        </div>
      </section>
    </div>
  );
}
