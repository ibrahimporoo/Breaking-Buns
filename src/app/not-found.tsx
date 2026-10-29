import Link from "next/link";
import Container from "@/components/ui/Container";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center py-24">
      <Container>
        <div className="mx-auto max-w-lg text-center">
          <p className="font-serif text-6xl text-accent">404</p>
          <h1 className="mt-4 font-serif text-3xl text-ink">This page is off the menu</h1>
          <p className="mt-3 text-ink-muted">The page you are looking for does not exist or has moved.</p>
          <Link
            href="/menu"
            className="mt-8 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-accent transition hover:bg-accent-hover"
          >
            See the menu
          </Link>
        </div>
      </Container>
    </main>
  );
}
