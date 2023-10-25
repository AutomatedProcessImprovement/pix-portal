import { Form } from "@remix-run/react";
import { HeaderProps } from "~/components/Header";

export default function UserNav({ userEmail }: HeaderProps) {
  if (userEmail) {
    return (
      <div className="flex">
        <div className="m-2">{userEmail || ""}</div>
        <Form method="post" action="/logout" className="m-2">
          <button type="submit">Logout</button>
        </Form>
      </div>
    );
  } else {
    return null;
  }
}
