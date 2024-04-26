import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "~/services/projects";

export default function ProjectCard({ project }: { project: Project }) {
  const [creationTime, setCreationTime] = useState(project.creation_time);
  useEffect(() => {
    setCreationTime(parseDate(project.creation_time));
  }, [project]);

  return (
    <Link
      to={`/projects/${project.id}/optimization`}
      className="border-none flex flex-col bg-white border border-slate-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-slate-100"
    >
      <div className="flex flex-grow flex-col justify-between p-4 space-y-2 leading-normal text-slate-900">
        <div className="">
          <h5 className="text-xl font-bold tracking-normal text-slate-900">{project.name}</h5>
          <p className="text-sm text-slate-400">{creationTime}</p>
        </div>
        <div className="font-normal text-slate-600 text-md">
          <div className="flex space-x-4">
            <p className="font-semibold w-2">{project.assets_ids.length}</p>
            <p>Assets</p>
          </div>
          <div className="flex space-x-4">
            <p className="font-semibold w-2">{project.processing_requests_ids.length}</p>
            <p>Processing requests</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function parseDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
