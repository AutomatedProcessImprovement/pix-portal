import { json, LoaderFunctionArgs } from "@remix-run/node";
import { requireLoggedInUser } from "~/session.server";
import { Link, useLoaderData } from "@remix-run/react";
import Header from "~/components/Header";
import { listProjectsForUser } from "~/services/projects.server";
import { safeFetch } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireLoggedInUser(request);
  return safeFetch(request, async () => {
    const projects = await listProjectsForUser(user.id, user.token!);
    return json({ user, projects });
  });
};

export default function DashboardPage() {
  const { user, projects } = useLoaderData<typeof loader>();

  return (
    <>
      <Header userEmail={user.email} />
      <section className="p-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <Link key={project.id} to={`/projects/${project.id}`}>
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
