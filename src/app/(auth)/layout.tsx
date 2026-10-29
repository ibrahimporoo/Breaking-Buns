import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <Link
        href="/"
        className="font-serif text-3xl tracking-tight text-ink transition-colors hover:text-accent"
      >
        {siteConfig.name}
      </Link>
      <div className="mt-8 w-full max-w-md rounded-3xl border border-line bg-surface/70 p-7 backdrop-blur-md sm:p-9">
        {children}
      </div>
    </main>
  );
}
