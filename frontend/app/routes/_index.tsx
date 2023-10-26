import type { MetaFunction } from "@remix-run/node";
import { useOptionalUser } from "~/utils";
import Header from "~/components/Header";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "PIX" },
    { name: "description", content: "Process Improvement Explorer" },
  ];
};

export default function Index() {
  const user = useOptionalUser();

  if (user) {
    return (
      <>
        <Header userEmail={user.email} />
        <p>Logged in</p>
        <p>Email: {user.email}</p>
        <Link to={`/projects`}>Projects</Link>
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
