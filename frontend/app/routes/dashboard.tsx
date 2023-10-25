import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { requireUserEmail } from "~/session.server";
import { Form, useLoaderData } from "@remix-run/react";
import Header from "~/components/Header";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const email = await requireUserEmail(request);
  return json({ userEmail: email });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userEmail = await requireUserEmail(request);

  console.log("User logged in:", userEmail);
  return redirect("/dashboard");
};

export default function DashboardPage() {
  const data = useLoaderData<typeof loader>();
  const userEmail = data.userEmail;

  return (
    <>
      <Header userEmail={userEmail} />
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
