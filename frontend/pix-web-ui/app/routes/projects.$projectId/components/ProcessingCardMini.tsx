import { ClockIcon, Cog8ToothIcon, MagnifyingGlassIcon, MapIcon } from "@heroicons/react/20/solid";
import { NavLink } from "@remix-run/react";
import { ProcessingType, processingTypeDescription, processingTypeToLabel } from "~/shared/processing_type";

export function ProcessingCardMini({
  projectId,
  processingType,
}: {
  projectId: string;
  processingType: ProcessingType;
}) {
  function navLinkClasses({ isActive, isPending }: { isActive: boolean; isPending: boolean }) {
    let classes = "group/card border-none flex flex-col hover:bg-slate-100 border border-slate-200 md:flex-row";
    if (isPending) classes += " bg-white text-red-600 animate-pulse";
    if (isActive) classes += " bg-slate-100";
    return classes;
  }

  const description = processingTypeDescription(processingType);

  return (
    <NavLink to={`/projects/${projectId}/${processingType}`} className={navLinkClasses} title={description}>
      {({ isActive, isPending }) => (
        <div className="border-r border-b border-slate-200 flex flex-grow justify-between items-center py-2 px-6 leading-normal h-14">
          <h5
            className={`text-lg font-semibold tracking-normal ${
              isActive ? "text-slate-700" : "text-slate-400 group-hover/card:text-slate-500"
            }`}
          >
            {processingTypeToLabel(processingType)}
          </h5>
          <div
            className={`rounded-full h-9 w-9 flex place-content-center ${
              isActive ? "text-slate-300 bg-white" : "text-slate-300 bg-slate-100 group-hover/card:bg-white"
            }`}
          >
            {iconForProcessingType(processingType)}
          </div>
        </div>
      )}
    </NavLink>
  );
}

export function iconForProcessingType(processingType: ProcessingType) {
  switch (processingType) {
    case ProcessingType.Discovery:
      return <MapIcon className="w-5" />;
    case ProcessingType.Simulation:
      return <Cog8ToothIcon className="w-5" />;
    case ProcessingType.WaitingTime:
      return <ClockIcon className="w-5" />;
    case ProcessingType.Optimization:
      return <MagnifyingGlassIcon className="w-5" />;
  }
}
