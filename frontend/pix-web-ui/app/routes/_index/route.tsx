import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Header from "~/components/Header";
import type { FlashMessage as FlashMessageType } from "~/shared/flash_message";
import { optionalLoggedInUser } from "~/shared/guards.server";
import { getSession, sessionStorage } from "~/shared/session.server";
import ToastMessage from "./ToastMessage";
import heroImage from "./pedro-lastra-Nyvq2juw4_o-unsplash.jpg";

export const meta: MetaFunction = () => {
  const title = "The Process Improvement Explorer";
  const description =
    "A new generation of process improvement tools researched, developed, and delivered by University of Tartu";
  return [
    { title: title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://pix.cloud.ut.ee" },
    {
      property: "og:image",
      content: "https://pix.cloud.ut.ee/build/_assets/pedro-lastra-Nyvq2juw4_o-unsplash-HQMIWBCD.jpg",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await optionalLoggedInUser(request);

  const session = await getSession(request);
  const flashMessage = session.get("globalMessage") as FlashMessageType | undefined;
  return json({ flashMessage, user }, { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } });
}

export default function Index() {
  const { flashMessage, user } = useLoaderData<typeof loader>();

  if (typeof window !== "undefined") {
    if (flashMessage) {
      setTimeout(() => {
        window && window.document.getElementById("global-message")?.remove();
      }, 5000);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {flashMessage && <ToastMessage message={flashMessage} />}
      <Header userEmail={user?.email} />
      <section className="flex flex-1 flex-col items-center justify-center">
        <Link to="/login" title="To Log In page">
          <img src={heroImage} alt="City landscapte" className="max-w-screen-lg" />
        </Link>
        <p className="text-xs mt-2 text-slate-400">
          Photo by{" "}
          <a
            className="text-slate-400 border-slate-400"
            href="https://unsplash.com/@peterlaster?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          >
            Pedro Lastra
          </a>{" "}
          on{" "}
          <a
            className="text-slate-400 border-slate-400"
            href="https://unsplash.com/photos/white-and-brown-city-buildings-during-daytime-Nyvq2juw4_o?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          >
            Unsplash
          </a>
        </p>
      </section>
    </div>
  );
}
