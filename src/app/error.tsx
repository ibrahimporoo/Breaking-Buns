"use client";

import Container from "@/components/ui/Container";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center py-24">
      <Container>
        <div className="mx-auto max-w-lg text-center">
          <h1 className="font-serif text-3xl text-ink">Something went wrong</h1>
          <p className="mt-3 text-ink-muted">
            We could not load this page. Please try again. If it keeps happening, call us.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-accent transition hover:bg-accent-hover"
          >
            Try again
          </button>
        </div>
      </Container>
    </main>
  );
}
