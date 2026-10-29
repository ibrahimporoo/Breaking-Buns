import type { Metadata } from "next";
import AuthForm from "@/components/modules/AuthForm";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { redirectIfSignedIn } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create account" };

type RegisterPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const next = safeRedirectPath((await searchParams).next);
  await redirectIfSignedIn(next);

  return <AuthForm mode="register" next={next} />;
}
