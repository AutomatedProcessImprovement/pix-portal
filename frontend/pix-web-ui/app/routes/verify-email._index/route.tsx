import { yupResolver } from "@hookform/resolvers/yup";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FormErrors } from "~/components/FormErrors";
import { Input } from "~/components/Input";
import { requestEmailVerification } from "~/services/auth";
import { optionalLoggedInUser } from "~/shared/guards.server";
import type { VerifyEmailSchema } from "./schema";
import { schema } from "./schema";

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

  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  async function onSubmit(data: VerifyEmailSchema) {
    try {
      setIsLoading(true);
      const ok = await requestEmailVerification(data.email);
      if (ok) {
        setIsEmailSent(true);
        setTimeout(() => {
          window.location.href = `/login${redirectTo ? `?redirectTo=${redirectTo}` : ""}`;
        }, 3000);
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
