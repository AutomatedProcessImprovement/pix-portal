import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { requireUserEmail } from "~/session.server";
import { Form } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserEmail(request);
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userEmail = await requireUserEmail(request);

  console.log("User logged in:", userEmail);
  return redirect("/dashboard");
};

export default function DashboardPage() {
  return (
    <>
      <p>Dashboard</p>
      <Form method="post">
        <button type="submit">Check if logged in</button>
      </Form>
      <Form method="post" action="/logout">
        <button type="submit">Logout</button>
      </Form>
    </>
  );
}
