import type { ComponentPropsWithoutRef } from "react";

type TextAreaFieldProps = Omit<ComponentPropsWithoutRef<"textarea">, "id"> & {
  id: string;
  label: string;
  error?: string;
};

export default function TextAreaField({ id, label, error, ...props }: TextAreaFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink/85">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`mt-1.5 w-full resize-none rounded-lg border bg-white/4 px-3.5 py-2.5 text-sm text-ink transition placeholder:text-ink/40 focus:border-accent focus:outline-hidden focus:ring-2 focus:ring-accent/25 ${
          error ? "border-danger/70" : "border-white/10"
        }`}
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
