import * as yup from "yup";

export interface VerifyEmailSchema extends yup.InferType<typeof schema> {}

export const schema = yup.object().shape({
  email: yup.string().email().required("Email is required"),
});
