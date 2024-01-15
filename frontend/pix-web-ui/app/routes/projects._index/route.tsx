import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Footer } from "~/components/Footer";
import Header from "~/components/Header";
import type { Project } from "~/services/projects";
import { listProjectsForUser } from "~/services/projects.server";
import { requireLoggedInUser } from "~/shared/guards.server";
import { handleThrow } from "~/shared/utils";
import { UserContext } from "../contexts";
import NewProjectCard from "./NewProjectCard";
import ProjectCard from "./ProjectCard";

export const meta: MetaFunction = ({ matches }) => {
  const rootMeta = matches.find((match) => match.id === "root")?.meta as
    | { title?: string; description?: string }[]
    | undefined;
  const title = rootMeta?.find((meta) => meta.title)?.title;
  const description = rootMeta?.find((meta) => meta.description)?.description;

  return [
    { title: `Projects —— ${title}` },
    {
      name: "description",
      content: description,
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireLoggedInUser(request);
  return handleThrow(request, async () => {
    let projects;
    try {
      projects = await listProjectsForUser(user.id, user.token!);
    } catch (error) {
      console.error(error);
      throw redirect("/login");
    }
    return json({ user, projects });
  });
};

export default function ProjectsPage() {
  const { user, projects } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col h-screen justify-between">
      <UserContext.Provider value={user}>
        <div>
          <Header userEmail={user.email} />
          <section className="p-6 flex flex-col space-y-4">
            <div className="flex justify-center">
              <ul className="flex-grow grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">
                {projects && projects.map((project: Project) => <ProjectCard key={project.id} project={project} />)}
                <NewProjectCard />
              </ul>
            </div>
          </section>
        </div>
        <Footer />
      </UserContext.Provider>
    </div>
  );
}
