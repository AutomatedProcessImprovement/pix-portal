import { type FieldErrors } from "react-hook-form";

export function FormErrors({ errors, ...rest }: { errors?: FieldErrors } & React.HTMLAttributes<HTMLDivElement>) {
  function extractMessageFromObject(error: any): string | null {
    if (error.message) {
      return error.message;
    }

    if (error instanceof Object) {
      return Object.keys(error)
        .map((key) => {
          if (error[key] instanceof Object) {
            return extractMessageFromObject(error[key]);
          } else {
            return error[key];
          }
        })
        .join(", ");
    }

    return null;
  }

  if (!errors) return null;
  return (
    <div className={rest.className}>
      {Object.keys(errors).map((key) => {
        return (
          <p
            key={key}
            className="flex justify-center bg-red-50 px-4 py-2 border border-red-700 rounded-lg text-red-900"
          >
            {extractMessageFromObject(errors[key])}
          </p>
        );
      })}
    </div>
  );
}
