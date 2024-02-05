import { yupResolver } from "@hookform/resolvers/yup";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FormErrors } from "~/components/FormErrors";
import { Input } from "~/components/Input";
import { resetPassword } from "~/services/auth.server";
import type { ResetPasswordSchema } from "./schema";
import { schema } from "./schema";

export const meta: MetaFunction = ({ matches }) => {
  const rootMeta = matches.find((match) => match.id === "root")?.meta as
    | { title?: string; description?: string }[]
    | undefined;
  const title = rootMeta?.find((meta) => meta.title)?.title;
  const description = rootMeta?.find((meta) => meta.description)?.description;

  return [
    { title: `Password Reset —— ${title}` },
    {
      name: "description",
      content: description,
    },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const token: string | undefined = params.token;
  let error: string | undefined = undefined;
  if (!token) {
    error = "No token provided";
  }
  return json({ token, error });
}

export const action = async ({ request }: ActionFunctionArgs) => {
  let ok: boolean | undefined = false;
  let error: string | undefined = undefined;
  try {
    const formData = await request.formData();
    const token = formData.get("token") as string;
    if (!token) {
      error = "No token provided";
    }
    const password = formData.get("password") as string;
    if (!password) {
      error = "Password is required";
    }
    ok = await resetPassword(token, password);
    error = ok ? undefined : "Invalid token";
  } catch (e: any) {
    ok = false;
    error = e.message;
  }
  return { ok, error };
};

export default function ResetPasswordTokenPage() {
  const { token, error } = useLoaderData<typeof loader>();
  const postData = useActionData<typeof action>();

  const methods = useForm<ResetPasswordSchema>({
    resolver: yupResolver(schema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === "submitting") {
      setIsLoading(true);
    }
  }, [navigation.state]);

  useEffect(() => {
    if (postData?.ok && !postData?.error) {
      setTimeout(() => {
        window.location.href = "/login";
      }, 5000);
    }
  }, [postData]);

  const ref = useRef<HTMLFormElement>(null);

  return (
    <div className="h-full flex flex-col justify-center items-center">
      <div className="flex flex-col justify-center items-center h-full text-center">
        {postData?.ok && !postData?.error && (
          <div className="m-8">
            <p className="text-3xl">
              <span className="text-green-600">Password has been changed!</span>
            </p>
            <p className="text-base mt-2">
              You will be redirected to the login page in a few seconds. Or you can <a href="/login">click here</a> to
              go back.
            </p>
          </div>
        )}
        {error ||
          (postData?.error && (
            <div className="m-8">
              <p className="text-3xl">
                Resetting password failed: <span className="text-red-600">{error || postData?.error}</span>
              </p>
              <p className="text-base mt-2">Please, contact support or try again later.</p>
            </div>
          ))}
        {!error && !postData?.error && !postData?.ok && (
          <FormProvider {...methods}>
            <Form ref={ref} method="post" className="flex flex-col justify-start">
              <p className="prose text-xl mb-8 text-center">Enter the new password below:</p>
              <input type="hidden" name="token" value={token} />
              <Input name="password" label="Password" type="password" required={true} className="w-96 text-left" />
              <div className="flex justify-center mt-8">
                <button type="submit" className="w-44" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
              {methods.formState.errors.root && <FormErrors errors={methods.formState.errors} className="mt-10" />}
            </Form>
          </FormProvider>
        )}
      </div>
    </div>
  );
}
