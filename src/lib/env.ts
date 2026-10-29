import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((value) => value?.trim() || undefined);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z
    .string()
    .regex(/^postgres(ql)?:\/\//, "must be a PostgreSQL connection string"),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32, "must be at least 32 characters"),
  EMAIL_FROM: z.string().min(3).default("Breaking Buns <onboarding@resend.dev>"),
  RESEND_API_KEY: optionalString,
  OWNER_EMAIL: optionalString,
  OWNER_SETUP_CODE: optionalString.refine(
    (value) => value === undefined || value.length >= 12,
    "must be at least 12 characters",
  ),
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  DB_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(parsed.error)}\nSee .env.example.`,
  );
}

export const env = parsed.data;
