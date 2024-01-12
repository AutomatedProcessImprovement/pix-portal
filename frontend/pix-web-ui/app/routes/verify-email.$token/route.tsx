import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { verifyEmail } from "~/services/auth.server";
import { logout } from "~/shared/session.server";

export const meta: MetaFunction = ({ matches }) => {
  const rootMeta = matches.find((match) => match.id === "root")?.meta as
    | { title?: string; description?: string }[]
    | undefined;
  const title = rootMeta?.find((meta) => meta.title)?.title;
  const description = rootMeta?.find((meta) => meta.description)?.description;

  return [
    { title: `Email Verification —— ${title}` },
    {
      name: "description",
      content: description,
    },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const token = params.token;
  if (!token) {
    return json({ error: "No token provided", ok: false });
  }

  try {
    const ok = await verifyEmail(token);
    return json({ ok, error: ok ? undefined : "Invalid token" });
  } catch (e: any) {
    return json({ ok: false, error: e.message });
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  await logout(request);
};

export default function VerifyEmailPage() {
  const { ok, error } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (ok) {
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } else {
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    }
  }, [ok]);

  return (
    <div className="h-full flex flex-col justify-center items-center">
      <div className="flex flex-col justify-center items-center h-full text-center">
        {ok && (
          <div className="m-8">
            <p className="text-2xl">
              <span className="text-green-600">Email successfully verified!</span>
            </p>
            <p className="text-base mt-2">
              You will be redirected to the login page in a few seconds. Or you can <a href="/login">click here</a> to
              go back.
            </p>
          </div>
        )}
        {!ok && error && (
          <div className="m-8">
            <p className="text-2xl">
              Email verification failed: <span className="text-red-600">{error}</span>
            </p>
            <p className="text-base mt-2">
              You will be redirected to the main page in a few seconds. Or you can <a href="/">click here</a> to go
              back.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
