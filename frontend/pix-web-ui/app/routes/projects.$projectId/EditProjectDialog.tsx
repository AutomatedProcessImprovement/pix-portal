import { Dialog } from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Form } from "@remix-run/react";
import { useContext, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDialog } from "~/components/asset-upload/useDialog";
import { patchProject, type Project } from "~/services/projects";
import { FormErrors } from "../../components/FormErrors";
import { Input } from "../../components/Input";
import { UserContext } from "../contexts";
import type { NewProjectSchema } from "../projects._index/schema";
import { schema } from "../projects._index/schema";

export function EditProjectDialog({ project, children }: { project: Project; children: React.ReactNode }) {
  const { isOpen, open, close } = useDialog();

  const methods = useForm<NewProjectSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: project.name,
      description: project.description,
      user_ids: project.users_ids,
      assets_ids: project.assets_ids,
      processing_requests_ids: project.processing_requests_ids,
    },
  });

  const user = useContext(UserContext);
  const [updatedProject, setUpdatedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  async function onSubmit(data: NewProjectSchema) {
    if (!user || !user.id || !user.token) {
      console.error("User is not valid");
      return;
    }
    try {
      setIsLoading(true);
      const updatedProject = await patchProject(
        project.id,
        { name: data.name, description: data.description },
        user.token!
      );
      setUpdatedProject(updatedProject);
      close();
      window.location.reload();
    } catch (error) {
      console.error(error);
      methods.setError("root", { message: "An error occurred while updating the project" });
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
          <Dialog.Panel className="z-50 mx-auto w-screen max-w-screen-xl sm:w-2/3 md:w-1/3 rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-semibold mb-8">Update project</h3>
            <FormProvider {...methods}>
              <Form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col">
                <Input name="name" label="Name" required={true} className="mb-4 " />
                <Input name="description" label="Description" />
                <div className="flex justify-center mt-10">
                  <button type="submit" className="w-44" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update"}
                  </button>
                </div>
                {updatedProject && (
                  <p className="flex justify-center mt-10 bg-green-50 px-4 py-2 border border-green-700 rounded-lg text-green-900">
                    Project updated successfully!
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
