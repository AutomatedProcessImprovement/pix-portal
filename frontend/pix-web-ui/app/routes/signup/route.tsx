import { yupResolver } from "@hookform/resolvers/yup";
import type { MetaFunction } from "@remix-run/node";
import { Form, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Footer } from "~/components/Footer";
import { FormErrors } from "~/components/FormErrors";
import Header from "~/components/Header";
import { Input } from "~/components/Input";
import { createUser } from "~/services/auth";
import type { SignUpSchema } from "./schema";
import { schema } from "./schema";

export const meta: MetaFunction = ({ matches }) => {
  const rootMeta = matches.find((match) => match.id === "root")?.meta as
    | { title?: string; description?: string }[]
    | undefined;
  const title = rootMeta?.find((meta) => meta.title)?.title;
  const description = rootMeta?.find((meta) => meta.description)?.description;

  return [
    { title: `Sign Up —— ${title}` },
    {
      name: "description",
      content: description,
    },
  ];
};

export default function SignUp() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/projects";

  const methods = useForm<SignUpSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
      firstName: "",
      lastName: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState<null | any>(null);
  async function onSubmit(data: SignUpSchema) {
    try {
      setIsLoading(true);
      const user = await createUser({
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
      });
      setNewUser(user);
      setIsLoading(false);
      toast.success("Email verification link sent to your email", {
        duration: 5000,
        position: "bottom-left",
      });
      setTimeout(() => {
        window.location.replace("/login");
      }, 5000);
    } catch (error) {
      console.error(error);
      methods.setError("root", { message: "An error occurred while creating the user" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <Header userEmail={null} />
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Create an account</h2>
        </div>

        <div className="px-6 sm:mx-auto w-screen sm:w-full sm:max-w-sm text-sm">
          <FormProvider {...methods}>
            <Form className="" onSubmit={methods.handleSubmit(onSubmit)}>
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <div className="flex flex-col space-y-4 my-8">
                <Input name="email" label="Email address" type="email" required={true} />
                <Input name="password" label="Password" type="password" required={true} />
                <Input name="passwordConfirmation" label="Confirm password" type="password" required={true} />
                <Input name="firstName" label="First name" required={true} />
                <Input name="lastName" label="Last name" required={true} />
              </div>
              <div className="flex justify-center text-lg">
                <button type="submit" className="w-full sm:w-2/3" disabled={isLoading || newUser}>
                  {isLoading ? "Creating..." : "Create"}
                </button>
              </div>
              {methods.formState.errors.root && <FormErrors errors={methods.formState.errors} className="mt-8" />}
            </Form>
          </FormProvider>
        </div>
      </div>
      <Footer />
    </div>
  );
}
