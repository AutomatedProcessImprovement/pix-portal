import * as yup from "yup";

export interface SignUpSchema extends yup.InferType<typeof schema> {}

export const schema = yup.object({
  email: yup.string().email().required("Email is required"),
  password: yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref("password"), undefined], "Passwords must match")
    .required(),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
});
