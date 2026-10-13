import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { SiteShell } from "@/components/site-shell";

const NotFoundPage = () => {
  const [searchParams] = useSearchParams();
  const isError = searchParams.get("reason");

  return (
    <SiteShell>
      <section className="animate-rise flex flex-1 flex-col justify-center py-16">
        <p className="font-mono text-sm text-ink/45">
          {isError ? "error" : "404"} · link
        </p>
        <h1 className="mt-4 font-display text-6xl leading-[0.95] tracking-tight sm:text-8xl">
          {isError ? (
            <>
              Something
              <br />
              <em>snapped.</em>
            </>
          ) : (
            <>
              This link
              <br />
              <em>got lost.</em>
            </>
          )}
        </h1>
        <p className="mt-6 max-w-md text-base text-ink/60 sm:text-lg">
          {isError
            ? "We couldn't open this link right now. Please try again in a moment."
            : "This short link doesn't exist or has been removed."}
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border-2 border-ink bg-acid px-6 py-3 text-sm font-semibold shadow-[4px_4px_0_0_#121212] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#121212]"
        >
          <ArrowLeft className="size-4" />
          Shorten a link
        </Link>
      </section>
    </SiteShell>
  );
};

export default NotFoundPage;
