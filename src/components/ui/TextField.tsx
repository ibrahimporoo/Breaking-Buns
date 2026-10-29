import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type TextFieldProps = Omit<ComponentPropsWithoutRef<"input">, "id"> & {
  id: string;
  label: string;
  error?: string;
};

export default function TextField({
  id,
  label,
  error,
  className,
  ...props
}: TextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink/85">
        {label}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "mt-1.5 h-11 w-full rounded-lg border bg-white/4 px-3.5 text-sm text-ink transition placeholder:text-ink/40 focus:border-accent focus:outline-hidden focus:ring-2 focus:ring-accent/25",
          error ? "border-danger/70" : "border-white/10",
          className,
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
