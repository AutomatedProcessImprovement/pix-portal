import { useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";

export function useFormRef() {
  const navigation = useNavigation();
  const isAdding = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isAdding) formRef.current?.reset();
  }, [isAdding]);

  return formRef;
}
