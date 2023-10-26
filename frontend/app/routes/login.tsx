import { Form, useSearchParams } from "@remix-run/react";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { getJWT, getUserInfo } from "~/services/auth.server";
import { createUserSession, getSessionUserInfo } from "~/session.server";
import { safeRedirect } from "~/utils";
import Header from "~/components/Header";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getSessionUserInfo(request);
  if (user) {
    return redirect("/dashboard");
  }
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";
  const redirectTo = safeRedirect(formData.get("redirectTo"));
  const token = await getJWT(email, password);
  const user = await getUserInfo(token);
  user.token = token;
  return createUserSession(request, remember, user, redirectTo);
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  return (
    <>
      <Header userEmail={null} />
      <div className="flex">
        <Form
          method="post"
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
          <div className="p-4">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
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
            />
          </div>
          <button type="submit">Login</button>
          <div className="p-4">
            <input id="remember" name="remember" type="checkbox" />
            <label htmlFor="remember">Remember me</label>
          </div>
          <input type="hidden" name="redirectTo" value={redirectTo} />
        </Form>
      </div>
    </>
  );
}
