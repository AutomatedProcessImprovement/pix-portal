import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { Toaster } from "react-hot-toast";
import { getSessionUserInfo } from "~/shared/session.server";
import twStyles from "~/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: twStyles },
  { rel: "icon", href: "/favicon.ico" },
];

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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getSessionUserInfo(request);
  return json({
    user,
    ENV: {
      BACKEND_BASE_URL_PUBLIC: process.env.BACKEND_BASE_URL_PUBLIC,
    },
  });
};

export default function App() {
  const data = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Toaster />
        <Outlet />
        <ScrollRestoration />
        <script dangerouslySetInnerHTML={{ __html: `window.ENV = ${JSON.stringify(data.ENV)}` }} />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error("ErrorBoundary", error);
  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : error instanceof Error
            ? error.message
            : "Unknown Error"}
        </h1>
        <Scripts />
      </body>
    </html>
  );
}
