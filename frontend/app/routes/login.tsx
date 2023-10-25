import { Form, useSearchParams } from "@remix-run/react";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { getJWT } from "~/auth.server";
import { createUserSession, getUserEmail } from "~/session.server";
import { safeRedirect } from "~/utils";
import Header from "~/components/Header";

export async function loader({ request }: LoaderFunctionArgs) {
  const userEmail = await getUserEmail(request);
  if (userEmail) {
    return redirect("/dashboard");
  }
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const token = await getJWT(email, password);
  const remember = formData.get("remember") === "on";
  const redirectTo = safeRedirect(formData.get("redirectTo"));
  return createUserSession(request, email, token, remember, redirectTo);
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  return (
    <>
      <Header userEmail={null} />
      <Form method="post" className="">
        <div className="p-4">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="border border-gray-300 rounded-md"
          />
        </div>
        <div className="p-4">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="border border-gray-300 rounded-md"
          />
        </div>
        <button type="submit" className="p-4 bg-amber-300">
          Login
        </button>
        <div className="p-4">
          <input id="remember" name="remember" type="checkbox" />
          <label htmlFor="remember">Remember me</label>
        </div>
        <input type="hidden" name="redirectTo" value={redirectTo} />
      </Form>
    </>
  );
}
