import { yupResolver } from "@hookform/resolvers/yup";
import { Form, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FormErrors } from "~/components/FormErrors";
import Header from "~/components/Header";
import { Input } from "~/components/Input";
import { createUser } from "~/services/auth";
import type { SignUpSchema } from "./schema";
import { schema } from "./schema";

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
      window.location.replace("/login");
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

        <div className="sm:mx-auto sm:w-full sm:max-w-sm text-sm">
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
                <button type="submit" className="w-2/3" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create"}
                </button>
              </div>
              {newUser && (
                <p className="flex justify-center mt-8 bg-green-50 px-4 py-2 border border-green-700 rounded-lg text-green-900">
                  User created successfully!
                </p>
              )}
              {methods.formState.errors.root && <FormErrors errors={methods.formState.errors} className="mt-8" />}
            </Form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
