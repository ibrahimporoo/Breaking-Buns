import type { ComponentPropsWithoutRef } from "react";
import Icon from "@/components/ui/Icon";

const labelClass = "block text-sm font-medium text-paper-ink";

const controlBase =
  "h-11 w-full rounded-lg border bg-paper text-sm transition focus:border-accent focus:outline-hidden focus:ring-2 focus:ring-accent/25";

function borderClass(hasError: boolean): string {
  return hasError ? "border-danger" : "border-paper-line";
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="mt-1.5 text-sm text-danger">
      {message}
    </p>
  );
}

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  id: string;
  label: string;
  options: readonly SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
};

export function SelectField({
  id,
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  disabled,
}: SelectFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative mt-1.5">
        <select
          id={id}
          name={id}
          required
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${controlBase} ${borderClass(Boolean(error))} appearance-none pl-3.5 pr-10 text-paper-ink invalid:text-paper-muted disabled:opacity-60`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-paper-ink">
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevronDown"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-paper-muted"
        />
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

type DateFieldProps = {
  id: string;
  label: string;
  value: string;
  min: string;
  max?: string;
  onChange: (value: string) => void;
  error?: string;
};

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DateField({ id, label, value, min, max, onChange, error }: DateFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative mt-1.5">
        <div
          className={`${controlBase} ${borderClass(Boolean(error))} flex items-center justify-between gap-2 px-3.5 ${
            value ? "text-paper-ink" : "text-paper-muted"
          }`}
        >
          <span className="truncate">{value ? formatDate(value) : "Select a date"}</span>
          <Icon name="calendar" className="size-4 shrink-0 text-paper-muted" />
        </div>
        <input
          id={id}
          name={id}
          type="date"
          required
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onClick={(event) => event.currentTarget.showPicker?.()}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

type PaperInputProps = Omit<ComponentPropsWithoutRef<"input">, "id" | "name"> & {
  id: string;
  label: string;
  error?: string;
};

export function PaperInput({ id, label, error, ...props }: PaperInputProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${controlBase} ${borderClass(Boolean(error))} mt-1.5 px-3.5 text-paper-ink placeholder:text-paper-muted`}
        {...props}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

type PaperTextareaProps = Omit<ComponentPropsWithoutRef<"textarea">, "id" | "name"> & {
  id: string;
  label: string;
  error?: string;
};

export function PaperTextarea({ id, label, error, ...props }: PaperTextareaProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={2}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${controlBase} ${borderClass(Boolean(error))} mt-1.5 h-auto resize-none px-3.5 py-2.5 text-paper-ink placeholder:text-paper-muted`}
        {...props}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
