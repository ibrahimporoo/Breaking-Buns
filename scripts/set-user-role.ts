import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, pool } from "@/db";
import { user } from "@/db/schema";
import { ROLES } from "@/lib/auth/roles";

const argsSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  role: z.enum(ROLES),
});

async function main() {
  const [email, role = "owner"] = process.argv.slice(2);
  const parsed = argsSchema.safeParse({ email, role });

  if (!parsed.success) {
    console.error(z.prettifyError(parsed.error));
    console.error("Usage: npm run user:role -- <email> [customer|staff|owner]");
    process.exitCode = 1;
    return;
  }

  const [updated] = await db
    .update(user)
    .set({ role: parsed.data.role })
    .where(eq(user.email, parsed.data.email))
    .returning({ email: user.email, role: user.role });

  if (!updated) {
    console.error(
      `No account found for ${parsed.data.email}. Register at /register first.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(`${updated.email} is now ${updated.role}.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
