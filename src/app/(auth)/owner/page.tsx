import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ClaimOwnerForm from "@/components/modules/ClaimOwnerForm";
import SignOutButton from "@/components/admin/SignOutButton";
import { countOwners } from "@/db/queries/team";
import { isStaff } from "@/lib/auth/roles";
import { getSession } from "@/lib/auth/session";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Owner access",
  robots: { index: false, follow: false },
};

export default async function OwnerPage() {
  const session = await getSession();

  if (!session) redirect("/login?next=/owner");
  if (isStaff(session.user.role)) redirect("/admin");

  const hasOwner = (await countOwners()) > 0;

  if (!hasOwner) {
    return (
      <>
        <h1 className="font-serif text-3xl text-ink">Set up your restaurant</h1>
        <p className="mt-2 text-sm text-ink-muted">
          You are signed in as <span className="text-ink">{session.user.email}</span>. Type the
          secret setup phrase from your <code className="text-ink">.env.local</code> file
          (<code className="text-ink">OWNER_SETUP_CODE</code>) to become the owner. You only do
          this once.
        </p>
        <ClaimOwnerForm enabled={Boolean(env.OWNER_SETUP_CODE)} />
      </>
    );
  }

  return (
    <>
      <h1 className="font-serif text-3xl text-ink">No dashboard access</h1>
      <p className="mt-2 text-sm text-ink-muted">
        This account ({session.user.email}) is a customer account. Ask the restaurant owner to add
        you to the team, or sign in with the owner account.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <SignOutButton />
        <Link href="/" className="text-sm text-accent transition-colors hover:text-accent-hover">
          Back to the website
        </Link>
      </div>
    </>
  );
}
