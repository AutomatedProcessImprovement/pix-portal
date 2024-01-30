import { NavLink } from "@remix-run/react";
import type { ProcessingType } from "~/shared/processing_type";
import { processingTypeDescription, processingTypeToLabel } from "~/shared/processing_type";

export function ProcessingCard({ projectId, processingType }: { projectId: string; processingType: ProcessingType }) {
  function navLinkClasses({ isActive, isPending }: { isActive: boolean; isPending: boolean }) {
    let classes =
      "border-none flex flex-col bg-slate-50 border border-slate-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-slate-100";
    if (isPending) classes += " text-red-600 animate-pulse";
    if (isActive) classes += " bg-slate-200 hover:bg-slate-200";
    return classes;
  }

  return (
    <NavLink to={`/projects/${projectId}/${processingType}`} className={navLinkClasses}>
      {({ isActive, isPending }) => (
        <div className="flex flex-grow flex-col justify-start p-4 space-y-2 leading-normal text-slate-900">
          <h5 className="text-xl font-bold tracking-normal text-slate-900">{processingTypeToLabel(processingType)}</h5>
          <p>{processingTypeDescription(processingType)}</p>
        </div>
      )}
    </NavLink>
  );
}
