import { Dialog } from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Form } from "@remix-run/react";
import { useContext, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDialog } from "~/components/asset-upload/useDialog";
import { createProject, type Project } from "~/services/projects";
import { FormErrors } from "../../components/FormErrors";
import { Input } from "../../components/Input";
import { UserContext } from "../contexts";
import type { NewProjectSchema } from "./schema";
import { schema } from "./schema";

export function NewProjectDialog({ children }: { children: React.ReactNode }) {
  const { isOpen, open, close } = useDialog();

  const methods = useForm<NewProjectSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: undefined,
      user_ids: [],
      assets_ids: [],
      processing_requests_ids: [],
    },
  });

  const user = useContext(UserContext);
  const [newProject, setNewProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  async function onSubmit(data: NewProjectSchema) {
    if (!user || !user.id || !user.token) {
      console.error("User is not valid");
      return;
    }
    data.user_ids = [user.id];
    try {
      setIsLoading(true);
      const project = await createProject(data, user.token!);
      setNewProject(project);
      close();
      window.location.reload();
    } catch (error) {
      console.error(error);
      methods.setError("root", { message: "An error occurred while creating the project" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <span onClick={() => open()} className="w-fit">
        {children}
      </span>
      <Dialog open={isOpen} onClose={() => close()} className="relative z-50">
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <div className="-z-0 fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <Dialog.Panel className="z-50 mx-auto max-w-screen-xl w-1/3 rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-semibold mb-8">New project</h3>
            <FormProvider {...methods}>
              <Form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col">
                <Input name="name" label="Name" required={true} className="mb-4 " />
                <Input name="description" label="Description" />
                <div className="flex justify-center mt-10">
                  <button type="submit" className="w-44" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create"}
                  </button>
                </div>
                {newProject && (
                  <p className="flex justify-center mt-10 bg-green-50 px-4 py-2 border border-green-700 rounded-lg text-green-900">
                    Project created successfully!
                  </p>
                )}
                {methods.formState.errors.root && <FormErrors errors={methods.formState.errors} className="mt-10" />}
              </Form>
            </FormProvider>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
