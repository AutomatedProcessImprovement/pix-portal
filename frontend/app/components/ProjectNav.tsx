import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { Link } from "@remix-run/react";
import UploadAssetDialog from "~/components/upload/UploadAssetDialog";
import { Project } from "~/services/projects.server";
import UploadAssetButton from "./UploadAssetButton";

export default function ProjectNav({ project }: { project: Project }) {
  return (
    <nav className="flex flex-wrap items-center px-6 py-3 bg-white border-b border-gray-200 h-14 space-x-2">
      <Link to={`/projects`} className="border-none">
        <HomeIcon className="h-5 w-auto text-blue-500 hover:text-blue-600" />
      </Link>
      <ChevronRightIcon className="h-5 w-auto text-gray-300" />
      <div className="flex flex-auto items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 id="project-name" className="text-xl font-bold line-clamp-1 capitalize">
            {project.name}
          </h2>
          <ul className="flex flex-wrap items-center space-x-3 px-4">
            <li className="">
              <a href="#">Edit</a>
            </li>
            <li className="">
              <a href="#">Share</a>
            </li>
            <li className="">
              <a href="#">Delete</a>
            </li>
          </ul>
        </div>
        <UploadAssetDialog trigger={<UploadAssetButton />} />
      </div>
    </nav>
  );
}

