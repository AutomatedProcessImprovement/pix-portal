import { Form, Link, NavLink } from "@remix-run/react";
import type { HeaderProps } from "~/components/Header";

export default function UserNav({ userEmail }: HeaderProps) {
  return (
    <nav className="flex flex-wrap items-center space-x-4">
      <Link to="/projects" className="lg:block md:block hidden">
        Projects
      </Link>
      {userEmail && (
        <>
          <Link to="/profile" className="lg:block md:block hidden">
            {userEmail || ""}
          </Link>
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
