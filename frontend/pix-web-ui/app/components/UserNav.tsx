import { Form, NavLink } from "@remix-run/react";
import type { HeaderProps } from "~/components/Header";

export default function UserNav({ userEmail }: HeaderProps) {
  return (
    <nav className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-4 md:space-y-0">
      {userEmail && (
        <>
          <NavLink
            to="/projects"
            title="Go to Projects"
            className={({ isActive }) =>
              (isActive ? "lg:block md:block text-black border-none hover:text-black" : "lg:block md:block") + " w-fit"
            }
          >
            Go to Projects
          </NavLink>
          <NavLink
            to="/profile"
            title="Go to Profile"
            className={({ isActive }) =>
              (isActive ? "lg:block md:block text-black border-none hover:text-black" : "lg:block md:block") + " w-fit"
            }
          >
            {userEmail || ""}
          </NavLink>
          <Form method="post" action="/logout">
            <button type="submit" className="mt-2 md:mt-0">
              Logout
            </button>
          </Form>
        </>
      )}
      {!userEmail && (
        <>
          <NavLink
            to="/login"
            title="Go to Login"
            className={({ isActive }) => (isActive ? "text-slate-900 border-none hover:text-slate-900" : "") + " w-fit"}
          >
            Login
          </NavLink>
          <NavLink
            to="/signup"
            title="Go to Signup"
            className={({ isActive }) => (isActive ? "text-slate-900 border-none hover:text-slate-900" : "") + " w-fit"}
          >
            Signup
          </NavLink>
        </>
      )}
    </nav>
  );
}
