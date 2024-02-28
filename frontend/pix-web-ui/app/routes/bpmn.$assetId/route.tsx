import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import bpmnJsFontStyles from "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import bpmnJsStyles from "bpmn-js/dist/assets/bpmn-js.css";
import bpmnJsDiagramStyles from "bpmn-js/dist/assets/diagram-js.css";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Footer } from "~/components/Footer";
import Header from "~/components/Header";
import { getAsset } from "~/services/assets.server";
import { FileType, getFileContent } from "~/services/files.server";
import type { FlashMessage } from "~/shared/flash_message";
import { requireLoggedInUser } from "~/shared/guards.server";
import { getSession } from "~/shared/session.server";
import { handleThrow } from "~/shared/utils";

declare global {
  interface Window {
    BpmnJS: any;
  }
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: bpmnJsStyles },
  { rel: "stylesheet", href: bpmnJsDiagramStyles },
  { rel: "stylesheet", href: bpmnJsFontStyles },
];

export const meta: MetaFunction = ({ matches }) => {
  const rootMeta = matches.find((match) => match.id === "root")?.meta as
    | { title?: string; description?: string }[]
    | undefined;
  const title = rootMeta?.find((meta) => meta.title)?.title;
  const description = rootMeta?.find((meta) => meta.description)?.description;

  return [
    { title: `BPMN Viewer —— ${title}` },
    {
      name: "description",
      content: description,
    },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSession(request);
  if (!session) {
    throw redirect("/login");
  }

  return await handleThrow(request, async () => {
    const user = await requireLoggedInUser(request);
    if (!user || user.token === undefined || !user.is_verified || user.deletion_time) {
      session.flash("flash", { message: "User login required", type: "error" } as FlashMessage);
      throw redirect("/projects");
    }

    if (!params.assetId) {
      session.flash("flash", { message: "No asset ID specified", type: "error" } as FlashMessage);
      throw redirect(`/projects`, {
        headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
      });
    }

    const asset = await getAsset(params.assetId, false, user.token);

    const models = asset.files?.filter((file) => file.type === FileType.PROCESS_MODEL_BPMN);
    if (!models || models?.length === 0) {
      session.flash("flash", { message: "No BPMN models found", type: "error" } as FlashMessage);
      throw redirect(`/projects`, {
        headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
      });
    }

    try {
      const bpmnModel = models[0];
      const bpmnModelContent = await getFileContent(bpmnModel.id, user.token);
      return json({ bpmnModelContent, user });
    } catch (e) {
      console.error(`failed to download the BPMN model for ${params.assetId}: ${e}`);
      session.flash("flash", { message: "Cannot download the BPMN model", type: "error" } as FlashMessage);
      throw redirect(`/projects`, {
        headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
      });
    }
  });
}

export default function BpmnViewerPage() {
  const { bpmnModelContent, user } = useLoaderData<typeof loader>();

  useEffect(() => {
    async function loadBpmn() {
      // avoid calling BpmnJS twice in React dev mode by checking if the BPMN-js container has been already initialized
      if ((document.getElementById("bpmnContainer")?.childNodes.length ?? 0) > 0) return;

      const viewer = new window.BpmnJS({
        container: "#bpmnContainer",
        height: 750,
      });
      try {
        const result = await viewer.importXML(bpmnModelContent);
        viewer.get("canvas").zoom("fit-viewport", "auto");
        if (result.warnings.length > 0) {
          for (const w of result.warnings) {
            toast(w, { icon: "⚠️", duration: 5000, position: "top-center" });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadBpmn();
  }, [bpmnModelContent]);

  return (
    <div className="flex min-h-full flex-col justify-between">
      <div className="flex min-h-full grow flex-col">
        <Header userEmail={user.email} />
        <div className="flex flex-col justify-center grow m-16 mt-10">
          <div className="flex flex-col p-8 bg-slate-50 rounded-3xl">
            <p className="mb-1">
              Use <kbd>left mouse click</kbd> to pan around the canvas.
              <br />
              Use <kbd>mouse scroll</kbd> to zoom in and out.
            </p>
            <div id="bpmnContainer" className="border-4 border-slate-200 h-[758px] bg-white"></div>
          </div>
          <div className="grow"></div> {/* Spacer to push the footer downwards */}
        </div>
        <script type="module" src="/bpmn-js/bpmn-navigated-viewer.production.min.js"></script>
        <Footer />
      </div>
    </div>
  );
}
