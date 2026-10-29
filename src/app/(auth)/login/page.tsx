import type { Metadata } from "next";
import AuthForm from "@/components/modules/AuthForm";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { redirectIfSignedIn } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in" };

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const next = safeRedirectPath((await searchParams).next);
  await redirectIfSignedIn(next);

  return <AuthForm mode="login" next={next} />;
}
