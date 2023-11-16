import { FieldErrors } from "react-hook-form";

export function FormErrors({ errors }: { errors?: FieldErrors }) {
  function extractMessageFromObject(error: any): string | null {
    if (error.message) {
      return error.message;
    }

    if (error instanceof Object) {
      return Object.keys(error)
        .map((key) => {
          if (error[key] instanceof Object) {
            return extractMessageFromObject(error[key]);
          }
        })
        .join(", ");
    }

    return null;
  }

  if (!errors) return null;
  return (
    <div className="text-red-500">
      {Object.keys(errors).map((key) => {
        return <div key={key}>{extractMessageFromObject(errors[key])}</div>;
      })}
    </div>
  );
}
