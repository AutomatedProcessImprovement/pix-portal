import { useParams } from "@remix-run/react";
import type { ProcessingType } from "~/shared/processing_type";

export function useProcessingType() {
  const params = useParams();
  const processingType = params.processingType as ProcessingType;
  return processingType;
}
