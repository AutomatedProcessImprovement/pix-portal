import { NavLink } from "@remix-run/react";

export default function ProcessingMenu({ projectId }: { projectId: string }) {
  return (
    <nav className="flex flex-col">
      <div className="p-2 bg-teal-100 border-b-2 border-red-400">
        <NavLink
          to={`/projects/${projectId}/discovery`}
          className={({ isActive, isPending }) => (isPending ? "text-red-600" : isActive ? "text-black" : "")}
        >
          Discovery
        </NavLink>
      </div>
      <div className="p-2 bg-teal-100 border-b-2 border-red-400">
        <NavLink
          to={`/projects/${projectId}/simulation`}
          className={({ isActive, isPending }) => (isPending ? "text-red-600" : isActive ? "text-black" : "")}
        >
          Simulation
        </NavLink>
      </div>
      <div className="p-2 bg-teal-100 border-b-2">
        <NavLink
          to={`/projects/${projectId}/waiting-time`}
          className={({ isActive, isPending }) => (isPending ? "text-red-600" : isActive ? "text-black" : "")}
        >
          Waiting Time
        </NavLink>
      </div>
    </nav>
  );
}
