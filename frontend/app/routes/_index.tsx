import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useOptionalUser } from "~/utils";
import Header from "~/components/Header";

export const meta: MetaFunction = () => {
  return [
    { title: "PIX" },
    { name: "description", content: "Process Improvement Explorer" },
  ];
};

export const loader = async () => {
  return json({});
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  const user = useOptionalUser();

  if (user) {
    return (
      <>
        <Header userEmail={user.email} />
        <p>Logged in</p>
        <p>Email: {user.email}</p>
      </>
    );
  }

  return (
    <>
      <Header userEmail={null} />
      <p>Not logged in</p>
    </>
  );
}
