import { Form } from "@remix-run/react";
import { HeaderProps } from "~/components/Header";

export default function UserNav({ userEmail }: HeaderProps) {
  if (userEmail) {
    return (
      <nav className="flex flex-wrap items-center space-x-4">
        <div className="text-gray-500">{userEmail || ""}</div>
        <Form method="post" action="/logout">
          <button type="submit">Logout</button>
        </Form>
      </nav>
    );
  } else {
    return null;
  }
}
