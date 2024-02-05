import * as yup from "yup";

export interface ResetPasswordSchema extends yup.InferType<typeof schema> {}

export const schema = yup.object().shape({
  token: yup.string().required("Token is required"),
  password: yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
});
