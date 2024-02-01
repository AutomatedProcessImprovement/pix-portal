import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { Link, useParams } from "@remix-run/react";
import { useContext, useEffect, useState } from "react";
import UploadAssetButton from "~/components/asset-upload/UploadAssetButton";
import UploadAssetDialog from "~/components/asset-upload/UploadAssetDialog";
import type { ILabeledAny } from "~/components/shared";
import { deleteProject, type Project } from "~/services/projects";
import SelectList from "../../../components/SelectList";
import { UserContext } from "../../contexts";
import { NewProjectDialog } from "../../projects._index/components/NewProjectDialog";
import { ProjectContext } from "../contexts";
import { useProjects } from "../hooks/useProjects";
import { EditProjectDialog } from "./EditProjectDialog";

export default function ProjectNav({ project }: { project?: Project }) {
  const user = useContext(UserContext);

  async function handleDelete() {
    if (!project || !user?.token) return;
    const confirmed = window.confirm(`Are you sure you want to delete project ${project.name}?`);
    if (!confirmed) return;
    try {
      await deleteProject(project.id, user.token);
      window.location.href = "/projects";
    } catch (error) {
      console.error(error);
    }
  }

  if (!project) return null;
  return (
    <nav className="flex flex-wrap items-center px-6 bg-white border-b border-slate-200 space-x-2">
      <div className="flex flex-col md:flex-row flex-auto md:items-center justify-between">
        <div className="flex items-center min-h-14 min-w-fit">
          <Link to={`/projects`} className="border-none">
            <HomeIcon className="h-5 w-auto text-blue-500 hover:text-blue-600" />
          </Link>
          <ChevronRightIcon className="h-5 w-auto text-slate-400" />
          <div className="flex items-center space-x-4">
            <ProjectsSelect />
            <div className="flex flex-wrap items-center space-x-3 min-w-fit">
              <NewProjectDialog>
                <span className="cursor-pointer transition ease-in-out duration-200 text-blue-500 hover:text-blue-800 border-b border-blue-500 hover:border-blue-800">
                  New
                </span>
              </NewProjectDialog>
              <EditProjectDialog project={project}>
                <span className="cursor-pointer transition ease-in-out duration-200 text-blue-500 hover:text-blue-800 border-b border-blue-500 hover:border-blue-800">
                  Edit
                </span>
              </EditProjectDialog>
              <span
                onClick={handleDelete}
                className="cursor-pointer transition ease-in-out duration-200 text-blue-500 hover:text-blue-800 border-b border-blue-500 hover:border-blue-800"
              >
                Delete
              </span>
            </div>
          </div>
        </div>
        <UploadAssetDialog trigger={<UploadAssetButton className="my-2 mb-4 md:mb-2" />} />
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
      optionClassName="text-lg"
      selected={selectedProject}
      onChange={(projectLabeled) => {
        if (!projectLabeled) return;
        if (selectedProject?.value.id === projectLabeled?.value.id) return;
        setSelectedProject(projectLabeled);
        const href = `/projects/${selectedProject?.value?.id}/${params.processingType || "discovery"}` ?? "/projects";
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
