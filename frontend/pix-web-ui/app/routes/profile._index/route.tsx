import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import Header from "~/components/Header";
import { deleteUser } from "~/services/auth";
import { getUserInfo } from "~/services/auth.server";
import { requireLoggedInUser } from "~/shared/guards.server";
import { UserContext } from "../contexts";

export const meta: MetaFunction = ({ matches }) => {
  const rootMeta = matches.find((match) => match.id === "root")?.meta as
    | { title?: string; description?: string }[]
    | undefined;
  const title = rootMeta?.find((meta) => meta.title)?.title;
  const description = rootMeta?.find((meta) => meta.description)?.description;

  return [
    { title: `Profile —— ${title}` },
    {
      name: "description",
      content: description,
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireLoggedInUser(request);
  const userNonCached = await getUserInfo(user.token!);
  return json({ user, userNonCached });
};

export default function ProfilePage() {
  const { user, userNonCached } = useLoaderData<typeof loader>();

  const [beenDeleted, setBeenDeleted] = useState(false);
  async function handleDeleteAccount() {
    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmed) return;
    if (!user.token) throw Error("No authorization token provided");
    const ok = await deleteUser(user.token);
    if (!ok) throw Error("Failed to delete user");
    setBeenDeleted(true);
  }

  useEffect(() => {
    if (!beenDeleted) return;
    (async () => {
      await fetch("/logout", {
        method: "POST",
      });
      window.location.href = "/";
    })();
  }, [beenDeleted]);

  return (
    <UserContext.Provider value={userNonCached}>
      <Header userEmail={userNonCached.email} />
      <main className="p-6 flex flex-col space-y-4">
        <section className="flex flex-col">
          <h1 className="text-2xl font-semibold mb-4">User Information</h1>
          <UserTable user={userNonCached} />
          <div className="flex space-x-2 mt-4">
            {!userNonCached.is_verified && (
              <button onClick={() => (window.location.href = `/verify-email`)}>Verify Email</button>
            )}
            <button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-500">
              Delete Account
            </button>
          </div>
        </section>
      </main>
    </UserContext.Provider>
  );
}

function UserTable({ user }: { user: any }) {
  return (
    <div className="relative overflow-x-auto w-fit my-4">
      <table className="w-full text-left rtl:text-right text-gray-500">
        <tbody>
          <TableRow label="Email" value={user.email} />
          <TableRow label="Email verified" value={user.is_verified ? "Verified" : "Not verified"} />
          <TableRow label="Name" value={`${user.first_name} ${user.last_name}`} />
          <TableRow label="Account" value={user.is_active ? "Active" : "Not active"} />
          <TableRow label="Last login" value={user.last_login_time} />
        </tbody>
      </table>
    </div>
  );
}

function TableRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="bg-white border-b first:border-t">
      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
        {label}
      </th>
      <td className="px-6 py-4">{value}</td>
    </tr>
  );
}
