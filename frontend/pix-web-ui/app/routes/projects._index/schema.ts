import * as yup from "yup";

export interface NewProjectSchema extends yup.InferType<typeof schema> {}

export const schema = yup.object({
  name: yup.string().min(3).required(),
  description: yup.string(),
  user_ids: yup.array(yup.string()).default([]),
  assets_ids: yup.array(yup.string()).default([]),
  processing_requests_ids: yup.array(yup.string()).default([]),
});
