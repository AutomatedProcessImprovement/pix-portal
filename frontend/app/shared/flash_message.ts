export type FlashMessage = {
  type: "success" | "info" | "warning" | "error";
  message: string;
  isAlert: boolean;
};
