"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { claimOwnershipAction } from "@/app/actions/owner";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

export default function ClaimOwnerForm({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!enabled) {
    return (
      <p role="status" className="mt-6 rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">
        Owner setup is switched off. Open your <code>.env.local</code> file, set{" "}
        <code>OWNER_SETUP_CODE</code> to a secret phrase (12+ characters), restart the website and
        come back to this page.
      </p>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") ?? "");

    setError("");
    startTransition(async () => {
      const result = await claimOwnershipAction(code);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.replace("/admin");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6">
      <TextField id="code" type="password" label="Secret setup phrase" autoComplete="off" />
      <p role="alert" className="mt-3 min-h-5 text-sm text-danger">
        {error}
      </p>
      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? "Checking…" : "Become the owner"}
      </Button>
    </form>
  );
}
