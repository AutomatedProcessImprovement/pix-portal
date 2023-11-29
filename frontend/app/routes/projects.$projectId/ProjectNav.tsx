import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { Link, useParams } from "@remix-run/react";
import { useContext, useEffect, useState } from "react";
import UploadAssetDialog from "~/components/asset-upload/UploadAssetDialog";
import { type Project } from "~/services/projects";
import SelectList from "../../components/SelectList";
import UploadAssetButton from "../../components/asset-upload/UploadAssetButton";
import type { ILabeledAny } from "../../components/shared";
import { UserContext } from "../projects.$projectId.$processingType/components/contexts";
import { ProjectContext } from "./contexts";
import { useProjects } from "./useProjects";

export default function ProjectNav({ project }: { project?: Project }) {
  if (!project) return null;
  return (
    <nav className="flex flex-wrap items-center px-6 bg-white border-b border-gray-200 h-14 space-x-2">
      <Link to={`/projects`} className="border-none">
        <HomeIcon className="h-5 w-auto text-blue-500 hover:text-blue-600" />
      </Link>
      <ChevronRightIcon className="h-5 w-auto text-slate-400" />
      <div className="flex flex-auto items-center justify-between">
        <div className="flex items-center space-x-4">
          <ProjectsSelect />
          <div className="flex flex-wrap items-center space-x-3">
            <span className="text-slate-400">New</span>
            <span className="text-slate-400">Edit</span>
            <span className="text-slate-400">Share</span>
            <span className="text-slate-400">Delete</span>
          </div>
        </div>
        <UploadAssetDialog trigger={<UploadAssetButton />} />
      </div>
    </nav>
  );
}

function ProjectsSelect() {
  const user = useContext(UserContext);
  const project = useContext(ProjectContext);
  const params = useParams();

  const projects = useProjects(user);

  const [selectedProject, setSelectedProject] = useState<ILabeledAny | undefined>(undefined);

  useEffect(() => {
    if (selectedProject) return; // set only when undefined
    setSelectedProject(makeLabeledProject(project));
  }, [project, selectedProject]);

  if (!selectedProject || !params) return null;
  return (
    <SelectList
      className="text-xl font-semibold w-52"
      selected={selectedProject}
      onChange={(projectLabeled) => {
        if (!projectLabeled) return;
        if (selectedProject?.value.id === projectLabeled?.value.id) return;
        setSelectedProject(projectLabeled);
        const href = `/projects/${selectedProject?.value?.id}/${params.processingType}` ?? "/projects";
        window.location.href = href;
      }}
      options={projects}
    />
  );
}

function makeLabeledProject(project: Project | null) {
  if (!project) return undefined;
  return {
    label: project.name,
    value: project,
  };
}
