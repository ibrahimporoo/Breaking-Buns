"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { addStaffAction, removeStaffAction } from "@/app/actions/owner";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

export type TeamMember = { id: string; name: string; email: string; role: string };

export default function TeamManager({
  members,
  currentUserId,
}: {
  members: readonly TeamMember[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("staffEmail") ?? "");

    setError("");
    startTransition(async () => {
      const result = await addStaffAction(email);
      if (result.ok) form.reset();
      else setError(result.error);
      router.refresh();
    });
  };

  const remove = (member: TeamMember) => {
    if (!window.confirm(`Remove dashboard access for ${member.name}?`)) return;

    setError("");
    startTransition(async () => {
      const result = await removeStaffAction(member.id);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  };

  return (
    <div className="max-w-3xl space-y-8">
      <form onSubmit={add} noValidate className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <TextField id="staffEmail" type="email" label="Add a team member by email" placeholder="cook@example.com" />
          </div>
          <Button type="submit" disabled={isPending}>
            Give access
          </Button>
        </div>
        <p className="text-sm text-ink-muted">
          They must create an account on the website first. Team members can see orders and edit
          the menu; only owners can change settings and the team.
        </p>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </form>

      <ul className="space-y-3">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-ink">
                <span className="font-medium">{member.name}</span>
                <Badge tone={member.role === "owner" ? "accent" : "neutral"}>
                  {member.role === "owner" ? "Owner" : "Team"}
                </Badge>
              </p>
              <p className="mt-0.5 break-all text-sm text-ink-muted">{member.email}</p>
            </div>
            {member.role !== "owner" && member.id !== currentUserId && (
              <Button size="sm" variant="outline" disabled={isPending} onClick={() => remove(member)}>
                Remove access
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
