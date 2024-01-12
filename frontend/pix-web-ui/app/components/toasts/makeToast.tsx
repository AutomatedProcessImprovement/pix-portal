import type { Toast } from "react-hot-toast";
import toast from "react-hot-toast";
import { ToastBlank } from "./ToastBlank";
import { ToastError } from "./ToastError";
import { ToastInfo } from "./ToastInfo";
import { ToastSuccess } from "./ToastSuccess";

export function makeToast({
  message,
  type,
  duration,
  position,
}: {
  message: string;
  type?: "success" | "error" | "info" | "blank";
  duration?: number;
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
}) {
  position = position || "bottom-left";
  duration = duration || 5000;
  type = type || "blank";

  function getJsx(t: Toast, message: string, type: string) {
    let jsx: JSX.Element;
    if (type === "success") jsx = <ToastSuccess t={t} message={message} />;
    else if (type === "error") jsx = <ToastError t={t} message={message} />;
    else if (type === "info") jsx = <ToastInfo t={t} message={message} />;
    else if (type === "blank") jsx = <ToastBlank t={t} message={message} />;
    else jsx = <ToastInfo t={t} message={message} />;
    return jsx;
  }

  toast.custom((t) => getJsx(t, message, type), { duration, position });
}
