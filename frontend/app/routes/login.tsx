import { Form, useSearchParams } from "@remix-run/react";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getJWT, getUserInfo } from "~/services/auth.server";
import { createUserSession, getSessionUserInfo } from "~/session.server";
import { handleThrow, safeRedirect } from "~/utils";
import Header from "~/components/Header";

export async function loader({ request }: LoaderFunctionArgs) {
  // TODO: need a better way to identify a valid user with non-expired token
  const user = await getSessionUserInfo(request);

  if (user && user.token !== null) {
    return redirect("/projects");
  }

  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  return handleThrow(request, async () => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const remember = formData.get("remember") === "on";
    const redirectTo = safeRedirect(formData.get("redirectTo"));
    const token = await getJWT(email, password);
    const user = await getUserInfo(token);
    user.token = token;
    return createUserSession(request, remember, user, redirectTo);
  });
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/projects";

  return (
    <div className="flex flex-col h-screen">
      <Header userEmail={null} />
      {/*<div className="flex items-center justify-center min-h-screen">*/}
      {/*  <Form method="post" className="bg-white shadow-md rounded-2xl p-6">*/}
      {/*    <div className="p-4">*/}
      {/*      <label htmlFor="email">Email</label>*/}
      {/*      <input id="email" name="email" type="email" autoComplete="email" required />*/}
      {/*    </div>*/}
      {/*    <div className="p-4">*/}
      {/*      <label htmlFor="password">Password</label>*/}
      {/*      <input id="password" name="password" type="password" autoComplete="current-password" required />*/}
      {/*    </div>*/}
      {/*    <button type="submit">Login</button>*/}
      {/*    <div className="p-4">*/}
      {/*      <input id="remember" name="remember" type="checkbox" />*/}
      {/*      <label htmlFor="remember">Remember me</label>*/}
      {/*    </div>*/}
      {/*    <input type="hidden" name="redirectTo" value={redirectTo} />*/}
      {/*  </Form>*/}
      {/*</div>*/}

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm text-sm">
          <Form method="post" className="space-y-6">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <div className="space-y-1">
              <label htmlFor="email" className="block font-medium leading-6 text-gray-900">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:leading-6"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div>
                  <a href="#" className="font-semibold">
                    Forgot password?
                  </a>
                </div>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-start space-x-2">
                <input id="remember" name="remember" type="checkbox" className="rounded" />
                <label htmlFor="remember" className="text-gray-900">
                  Remember me
                </label>
              </div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Log in
              </button>
            </div>
          </Form>

          <p className="mt-10 text-center text-gray-500">
            Not a member?
            <a href="#" className="font-semibold mx-2">
              Sign up now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
