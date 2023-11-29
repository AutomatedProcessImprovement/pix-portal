import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { Link, useParams } from "@remix-run/react";
import { useContext, useEffect, useState } from "react";
import UploadAssetDialog from "~/components/upload/UploadAssetDialog";
import type { User } from "~/services/auth";
import { listProjectsForUser, type Project } from "~/services/projects";
import SelectList from "./SelectList";
import { ProjectContext, UserContext } from "./processing/contexts";
import type { ILabeledAny } from "./shared";
import UploadAssetButton from "./upload/UploadAssetButton";

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

  const [projects, setProjects] = useState<ILabeledAny[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async (user: User) => {
      const projects = await listProjectsForUser(user.id, user.token!);
      const projectsLabeled = projects.map((project) => ({
        label: project.name,
        value: project,
      }));
      return projectsLabeled;
    };

    fetchProjects(user).then(setProjects);
  }, [user]);

  const [selectedProject, setSelectedProject] = useState<ILabeledAny | undefined>(undefined);

  useEffect(() => {
    console.log("ProjectsSelect project", project);
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
        console.log("params", params);
        const href = `/projects/${selectedProject?.value?.id}/${params.processingType}` ?? "/projects";
        console.log("href", href);
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
