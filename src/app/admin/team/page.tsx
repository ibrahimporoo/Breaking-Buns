import type { Metadata } from "next";
import TeamManager from "@/components/admin/TeamManager";
import { listTeam } from "@/db/queries/team";
import { requireOwner } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Team" };

export default async function AdminTeamPage() {
  const { user } = await requireOwner();
  const members = await listTeam();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">Team</h1>
        <p className="mt-2 text-ink-muted">Choose who can open the dashboard.</p>
      </header>
      <TeamManager members={members} currentUserId={user.id} />
    </div>
  );
}
