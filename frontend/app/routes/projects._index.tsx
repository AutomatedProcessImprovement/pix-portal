import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Header from "~/components/Header";
import ProjectCard from "~/components/ProjectCard";
import type { Project } from "~/services/projects.server";
import { listProjectsForUser } from "~/services/projects.server";
import { requireLoggedInUser } from "~/session.server";
import { handleThrow } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireLoggedInUser(request);
  return handleThrow(request, async () => {
    const projects = await listProjectsForUser(user.id, user.token!);
    return json({ user, projects });
  });
};

export default function ProjectsPage() {
  const { user, projects } = useLoaderData<typeof loader>();

  return (
    <>
      <Header userEmail={user.email} />
      <section className="p-6 flex flex-col space-y-4">
        <div className="flex justify-center">
          <ul className="flex-grow grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">
            {projects.map((project: Project) => (
              <Link key={project.id} to={`/projects/${project.id}/discovery`} className="border-none">
                <ProjectCard key={project.id} project={project} />
              </Link>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
