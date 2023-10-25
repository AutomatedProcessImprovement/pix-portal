import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useOptionalUser } from "~/utils/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async () => {
  return json({});
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  console.log("data", data);

  const user = useOptionalUser();

  if (user) {
    return (
      <>
        <p>Logged in</p>
        <p>Email: {user.email}</p>
      </>
    );
  }

  return (
    <>
      <p>Not logged in</p>
    </>
  );
}
