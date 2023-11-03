import { FlashMessage } from "~/shared/flash_message";

export default function ToastMessage({ message }: { message: FlashMessage }) {
  return (
    <div
      id="global-message"
      className={
        "relative p-4 text-white transition-all duration-500" +
        (message.type === "error"
          ? " bg-red-500"
          : message.type === "warning"
          ? " bg-yellow-500"
          : " bg-green-500")
      }
      role={message.type === "error" || "warning" ? "alert" : ""}
    >
      <p>{message.message}</p>
      <span
        className="absolute inset-y-0 right-0 flex items-center mr-4"
        onClick={() => {
          document.getElementById("global-message")?.remove();
        }}
      >
        <svg className="w-4 h-4 fill-current" role="button" viewBox="0 0 20 20">
          <path
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
            fillRule="evenodd"
          ></path>
        </svg>
      </span>
    </div>
  );
}
