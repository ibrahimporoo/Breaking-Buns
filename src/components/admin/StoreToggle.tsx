"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setAcceptingOrdersAction } from "@/app/actions/settings";
import Toggle from "@/components/ui/Toggle";

export default function StoreToggle({ initialOpen }: { initialOpen: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(initialOpen);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const change = (next: boolean) => {
    setOpen(next);
    setError("");

    startTransition(async () => {
      const result = await setAcceptingOrdersAction(next);

      if (!result.ok) {
        setOpen(!next);
        setError(result.error);
        return;
      }

      router.refresh();
    });
  };

  return (
    <div
      className={`rounded-2xl border p-5 ${open ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"}`}
    >
      <Toggle
        id="accepting-orders"
        label={open ? "Online ordering is ON" : "Online ordering is OFF"}
        description={
          open
            ? "Customers can place orders right now. Switch off when the kitchen is too busy or closed."
            : "Customers see your closed message and cannot check out."
        }
        checked={open}
        onChange={change}
        disabled={isPending}
      />
      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
