import { Form, NavLink } from "@remix-run/react";
import type { HeaderProps } from "~/components/Header";

export default function UserNav({ userEmail }: HeaderProps) {
  return (
    <nav className="flex flex-wrap items-center space-x-4">
      {userEmail && (
        <>
          <div className="text-slate-400 lg:block md:block hidden">{userEmail || ""}</div>
          <Form method="post" action="/logout">
            <button type="submit">Logout</button>
          </Form>
        </>
      )}
      {!userEmail && (
        <>
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? "text-slate-900 border-none hover:text-slate-900" : "")}
          >
            Login
          </NavLink>
          <NavLink
            to="/signup"
            className={({ isActive }) => (isActive ? "text-slate-900 border-none hover:text-slate-900" : "")}
          >
            Signup
          </NavLink>
        </>
      )}
    </nav>
  );
}
