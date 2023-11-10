import { NavLink } from "@remix-run/react";

export default function ProcessingMenu({ projectId }: { projectId: string }) {
  function navLinkClasses({ isActive, isPending }: { isActive: boolean; isPending: boolean }) {
    let classes = "border-none";
    if (isPending) classes += " text-red-600";
    if (isActive) classes += " text-black";
    return classes;
  }

  return (
    <nav className="flex flex-col items-center">
      <div className="p-2 bg-teal-100 border-b-2 border-red-400 flex w-12 justify-center text-2xl font-bold">
        <NavLink to={`/projects/${projectId}/discovery`} className={navLinkClasses}>
          D
        </NavLink>
      </div>
      <div className="p-2 bg-teal-100 border-b-2 border-red-400 flex w-12 justify-center text-2xl font-bold">
        <NavLink to={`/projects/${projectId}/simulation`} className={navLinkClasses}>
          S
        </NavLink>
      </div>
      <div className="p-2 bg-teal-100 border-b-2 border-red-400 flex w-12 justify-center text-2xl font-bold">
        <NavLink to={`/projects/${projectId}/waiting-time`} className={navLinkClasses}>
          T
        </NavLink>
      </div>
    </nav>
  );
}
