import { Project } from "~/services/projects.server";
import { Link } from "@remix-run/react";

export default function ProjectNav({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap items-center px-4 py-3 bg-white border-b border-gray-200 h-14">
      <Link to={`/projects`} className="mr-4 border-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
      <h2
        id="project-name"
        className="text-xl font-bold line-clamp-1 capitalize"
      >
        {project.name}
      </h2>
      <nav className="px-4">
        <ul className="flex flex-wrap">
          <li className="mx-2">
            <a href="#">Edit</a>
          </li>
          <li className="mx-2">
            <a href="#">Share</a>
          </li>
          <li className="mx-2">
            <a href="#">Delete</a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
