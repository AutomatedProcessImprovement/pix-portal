import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useOptionalUser } from "~/utils";
import Header from "~/components/Header";
import { Link, useLoaderData, useRouteError } from "@remix-run/react";
import { getSession, sessionStorage } from "~/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "PIX" },
    { name: "description", content: "Process Improvement Explorer" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  const flashMessage = session.get("globalMessage");

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
        {flashMessage && (
          <div
            id="global-message"
            className="relative p-4 bg-red-500 text-white transition-all duration-500"
            role="alert"
          >
            <p>{flashMessage}</p>
            <span
              className="absolute inset-y-0 right-0 flex items-center mr-4"
              onClick={() => {
                document.getElementById("global-message")?.remove();
              }}
            >
              <svg
                className="w-4 h-4 fill-current"
                role="button"
                viewBox="0 0 20 20"
              >
                <path
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                  fill-rule="evenodd"
                ></path>
              </svg>
            </span>
          </div>
        )}
        <Header userEmail={user.email} />
        <p>Logged in</p>
        <p>Email: {user.email}</p>
        <Link to={`/projects`}>Projects</Link>
      </>
    );
  }

  return (
    <>
      {flashMessage && (
        <p className="p-4 bg-red-500 text-white">{flashMessage}</p>
      )}
      <Header userEmail={null} />
      <p>Not logged in</p>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <div>{error.message}</div>;
}
