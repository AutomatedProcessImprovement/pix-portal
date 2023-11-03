import { Project } from "~/services/projects.server";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="w-full max-w-sm bg-gray-50 hover:bg-gray-100 cursor-pointer border border-gray-200 rounded-xl">
      <div id="project-card-header" className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg text-gray-700 font-semibold capitalize">{project.name}</h2>
        <div
          className="inline-block text-gray-500 hover:bg-gray-200 cursor-pointer focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <span className="sr-only">Open dropdown</span>
          <EllipsisHorizontalIcon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex flex-col">
        <div
          id="project-info-item"
          className="bg-white last:rounded-b-xl text-gray-500 text-sm px-4 py-3 flex justify-between border-b last:border-none"
        >
          <p>Created</p>
          <p>{parseDate(project.creation_time)}</p>
        </div>
        <div
          id="project-info-item"
          className="bg-white last:rounded-b-xl text-gray-500 text-sm px-4 py-3 flex justify-between border-b last:border-none"
        >
          <p>Number of assets</p>
          <p>{project.assets_ids.length}</p>
        </div>
      </div>
    </div>
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
