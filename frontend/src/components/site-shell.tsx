import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Scissors } from "lucide-react";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-dots flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-ink text-acid">
            <Scissors className="size-4" />
          </span>
          snip<span className="text-ink/40">.</span>
        </Link>
        <span className="rounded-full border border-ink/15 bg-paper px-3 py-1 text-xs text-ink/60">
          Free · No sign-up
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 sm:px-8">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-5xl px-5 py-8 text-xs text-ink/50 sm:px-8">
        © {new Date().getFullYear()} snip. Long links, cut short.
      </footer>
    </div>
  );
}
