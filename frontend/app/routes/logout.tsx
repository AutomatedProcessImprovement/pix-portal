import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { logout } from "~/session.server";

export const loader = async () => {
  return redirect("/");
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  return logout(request);
};
