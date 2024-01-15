import { yupResolver } from "@hookform/resolvers/yup";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useSearchParams } from "@remix-run/react";
import { FormProvider, useForm } from "react-hook-form";
import { Footer } from "~/components/Footer";
import { FormErrors } from "~/components/FormErrors";
import Header from "~/components/Header";
import { Input } from "~/components/Input";
import { getJWT, getUserInfo } from "~/services/auth.server";
import { createUserSession, getSessionUserInfo } from "~/shared/session.server";
import { handleThrow } from "~/shared/utils";
import type { LoginSchema } from "./schema";
import { schema } from "./schema";
import { safeRedirect } from "./utils";

export const meta: MetaFunction = ({ matches }) => {
  const rootMeta = matches.find((match) => match.id === "root")?.meta as
    | { title?: string; description?: string }[]
    | undefined;
  const title = rootMeta?.find((meta) => meta.title)?.title;
  const description = rootMeta?.find((meta) => meta.description)?.description;

  return [
    { title: `Login —— ${title}` },
    {
      name: "description",
      content: description,
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // TODO: need a better way to identify a valid user with non-expired token
  const user = await getSessionUserInfo(request);

  if (user && user.token !== null && user.is_verified && !user.deletion_time) {
    return redirect("/projects");
  }

  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  return handleThrow(request, async () => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const remember = formData.get("remember") === "on";
    const redirectTo = safeRedirect(formData.get("redirectTo"));
    const token = await getJWT(email, password);
    if (!token) throw Error(`Can get token for ${email}`);
    const user = await getUserInfo(token);
    user.token = token;
    return createUserSession(request, remember, user, redirectTo);
  });
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/projects";

  const methods = useForm<LoginSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginSchema) {
    document.forms[0].submit();
  }

  return (
    <div className="flex flex-col h-screen">
      <Header userEmail={null} />
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="px-6 sm:mx-auto w-screen sm:w-full sm:max-w-sm text-sm">
          <FormProvider {...methods}>
            <Form method="post" onSubmit={methods.handleSubmit(onSubmit)}>
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <div className="flex flex-col space-y-4 my-8">
                <Input name="email" label="Email address" type="email" autoComplete="email" required={true} />
                <Input
                  name="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  required={true}
                />
              </div>
              <div className="flex justify-center text-lg">
                <button type="submit" className="w-full sm:w-2/3">
                  Log in
                </button>
              </div>
              {methods.formState.errors.root && <FormErrors errors={methods.formState.errors} className="mt-8" />}
            </Form>
          </FormProvider>

          <p className="mt-2 text-center text-gray-500">
            Not a member?
            <Link to={`/signup`} className="font-semibold mx-2 ">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
