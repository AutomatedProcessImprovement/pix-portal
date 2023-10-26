import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { requireLoggedInUser } from "~/session.server";
import { useLoaderData } from "@remix-run/react";
import Header from "~/components/Header";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // TODO: handle 401 error when token expires
  const user = await requireLoggedInUser(request);
  return json({ user });
};

export const action = async ({ request }: ActionFunctionArgs) => {};

function ProjectNav() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-wrap items-center px-4 py-3 bg-white border-b border-gray-200 h-14">
      <h2 id="project-name" className="text-xl font-bold line-clamp-1">
        Project Name
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

export default function DashboardPage() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <Header userEmail={user.email} />
      <ProjectNav />
      {user.id}
    </>
  );
}
