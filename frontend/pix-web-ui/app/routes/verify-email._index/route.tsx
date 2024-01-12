import { yupResolver } from "@hookform/resolvers/yup";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FormErrors } from "~/components/FormErrors";
import { Input } from "~/components/Input";
import { requestEmailVerification } from "~/services/auth";
import { optionalLoggedInUser } from "~/shared/guards.server";
import type { VerifyEmailSchema } from "./schema";
import { schema } from "./schema";

export const meta: MetaFunction = ({ matches }) => {
  const rootMeta = matches.find((match) => match.id === "root")?.meta as
    | { title?: string; description?: string }[]
    | undefined;
  const title = rootMeta?.find((meta) => meta.title)?.title;
  const description = rootMeta?.find((meta) => meta.description)?.description;

  return [
    { title: `Email Verification —— ${title}` },
    {
      name: "description",
      content: description,
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await optionalLoggedInUser(request);
  return json({ user });
};

export default function VerifyEmailPage() {
  const { user } = useLoaderData<typeof loader>();

  const methods = useForm<VerifyEmailSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: user?.email || "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  async function onSubmit(data: VerifyEmailSchema) {
    try {
      setIsLoading(true);
      const ok = await requestEmailVerification(data.email);
      if (ok) {
        setIsEmailSent(true);
      } else {
        methods.setError("root", { message: "Sending verification email failed" });
      }
    } catch (error) {
      console.error(error);
      methods.setError("root", { message: "An error occurred while sending the verification email" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col justify-center items-center">
      {!isEmailSent && (
        <FormProvider {...methods}>
          <Form className="flex flex-col justify-center items-center h-full" onSubmit={methods.handleSubmit(onSubmit)}>
            <p className="prose text-xl mb-8 text-center">
              Please enter your email address below.
              <br />
              We will send you a verification email with a link to verify your email address.
            </p>
            <Input name="email" label="Email" required={true} className="w-96" />
            <div className="flex justify-center mt-8">
              <button type="submit" className="w-44" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify"}
              </button>
            </div>
            {methods.formState.errors.root && <FormErrors errors={methods.formState.errors} className="mt-10" />}
          </Form>
        </FormProvider>
      )}
      {isEmailSent && (
        <div className="m-8 text-center">
          <p className="text-2xl">
            <span className="text-blue-600">Verification email has been sent!</span>
          </p>
          <p className="text-base mt-2">Please check your inbox and click on the link to verify your email address.</p>
        </div>
      )}
    </div>
  );
}
