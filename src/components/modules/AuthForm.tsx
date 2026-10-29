"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { authClient } from "@/lib/auth/client";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

type AuthMode = "login" | "register";
type FieldErrors = Partial<Record<string, string[]>>;

const COPY = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to your account. Owners and staff continue to the dashboard.",
    submit: "Sign in",
    pending: "Signing in…",
    switchPrompt: "New to Breaking Buns?",
    switchLabel: "Create an account",
    switchHref: "/register",
  },
  register: {
    title: "Create your account",
    subtitle: "Create an account to order faster. Restaurant owners: register here first, then open the owner page.",
    submit: "Create account",
    pending: "Creating account…",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/login",
  },
} as const satisfies Record<AuthMode, Record<string, string>>;

type AuthFormProps = {
  mode: AuthMode;
  next?: string;
};

export default function AuthForm({ mode, next }: AuthFormProps) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const copy = COPY[mode];
  const isRegister = mode === "register";
  const switchHref = next
    ? `${copy.switchHref}?next=${encodeURIComponent(next)}`
    : copy.switchHref;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const input = Object.fromEntries(new FormData(event.currentTarget));
    const result = isRegister
      ? registerSchema.safeParse(input)
      : loginSchema.safeParse(input);

    if (!result.success) {
      setFieldErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setPending(true);
    const { error } =
      "name" in result.data
        ? await authClient.signUp.email(result.data)
        : await authClient.signIn.email(result.data);

    if (error) {
      setPending(false);
      setFormError(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    router.replace(next ?? "/login");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 className="font-serif text-3xl text-ink">{copy.title}</h1>
      <p className="mt-2 text-sm text-ink-muted">{copy.subtitle}</p>

      <div className="mt-7 space-y-4">
        {isRegister && (
          <TextField
            id="name"
            label="Full name"
            autoComplete="name"
            error={fieldErrors.name?.[0]}
          />
        )}
        <TextField
          id="email"
          type="email"
          label="Email"
          autoComplete="email"
          error={fieldErrors.email?.[0]}
        />
        <TextField
          id="password"
          type="password"
          label="Password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          error={fieldErrors.password?.[0]}
        />
      </div>

      <p role="alert" className="mt-4 min-h-5 text-sm text-danger">
        {formError}
      </p>

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? copy.pending : copy.submit}
      </Button>

      <p className="mt-6 text-center text-sm text-ink-muted">
        {copy.switchPrompt}{" "}
        <Link
          href={switchHref}
          className="font-medium text-accent transition-colors hover:text-accent-hover"
        >
          {copy.switchLabel}
        </Link>
      </p>
    </form>
  );
}
