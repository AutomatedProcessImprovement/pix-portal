import { Form, NavLink } from "@remix-run/react";
import type { HeaderProps } from "~/components/Header";

export default function UserNav({ userEmail }: HeaderProps) {
  return (
    <nav className="flex flex-wrap items-center space-x-4">
      {userEmail && (
        <>
          <NavLink
            to="/projects"
            title="Go to Projects"
            className={({ isActive }) =>
              isActive ? "lg:block md:block text-black border-none hover:text-black" : "lg:block md:block"
            }
          >
            Go to Projects
          </NavLink>
          <NavLink
            to="/profile"
            title="Go to Profile"
            className={({ isActive }) =>
              isActive ? "lg:block md:block text-black border-none hover:text-black" : "lg:block md:block"
            }
          >
            {userEmail || ""}
          </NavLink>
          <Form method="post" action="/logout">
            <button type="submit">Logout</button>
          </Form>
        </>
      )}
      {!userEmail && (
        <>
          <NavLink
            to="/login"
            title="Go to Login"
            className={({ isActive }) => (isActive ? "text-slate-900 border-none hover:text-slate-900" : "")}
          >
            Login
          </NavLink>
          <NavLink
            to="/signup"
            title="Go to Signup"
            className={({ isActive }) => (isActive ? "text-slate-900 border-none hover:text-slate-900" : "")}
          >
            Signup
          </NavLink>
        </>
      )}
    </nav>
  );
}
