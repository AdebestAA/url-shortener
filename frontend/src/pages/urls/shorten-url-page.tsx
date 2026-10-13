import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Link2, Loader2 } from "lucide-react";

import { SiteShell } from "@/components/site-shell";
import { ResultTicket } from "@/components/url-components/result-ticket";
import useCreateShortUrl from "@/hooks/urls/useCreateShortUrl";
import {
  shortenUrlSchema,
  type ShortenUrlFormValues,
} from "@/validations/shorten-url-validation";

const STEPS = [
  { n: "01", title: "Paste", text: "Drop in any long, messy link." },
  { n: "02", title: "Snip", text: "Get a short link in a second." },
  { n: "03", title: "Share", text: "Copy it anywhere, it just works." },
];

export default function ShortenUrlPage() {
  const { mutate: createShortUrl, isPending, data } = useCreateShortUrl();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShortenUrlFormValues>({
    resolver: zodResolver(shortenUrlSchema),
    defaultValues: { url: "" },
  });

  const param = data?.success ? data.param : null;
  const shortUrl = param ? `${window.location.origin}/${param}` : "";

  function onSubmit(values: ShortenUrlFormValues) {
    createShortUrl({ url: values.url.trim() });
  }

  return (
    <SiteShell>
      <section className="animate-rise pt-8 pb-10 sm:pt-16 sm:pb-12">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper">
          <span className="size-1.5 rounded-full bg-acid" />
          URL shortener
        </p>
        <h1 className="font-display text-6xl leading-[0.95] tracking-tight sm:text-8xl">
          Long links,
          <br />
          <span className="relative isolate inline-block">
            <em>cut short.</em>
            <span className="absolute inset-x-0 bottom-[0.1em] -z-10 h-[0.32em] -rotate-1 bg-acid" />
          </span>
        </h1>
        <p className="mt-6 max-w-md text-base text-ink/60 sm:text-lg">
          Paste any link and get a tidy short one, ready to share anywhere.
        </p>
      </section>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="animate-rise [animation-delay:80ms]"
      >
        <label htmlFor="url" className="sr-only">
          Long URL
        </label>
        <div
          className={`flex flex-col gap-2 rounded-3xl border-2 bg-white p-2 shadow-[6px_6px_0_0_#121212] transition focus-within:shadow-[3px_3px_0_0_#121212] sm:flex-row sm:items-center sm:rounded-full ${
            errors.url ? "border-red-600" : "border-ink"
          }`}
        >
          <div className="flex flex-1 items-center gap-3 px-4">
            <Link2 className="size-5 shrink-0 text-ink/40" />
            <input
              id="url"
              {...register("url")}
              type="url"
              autoComplete="off"
              placeholder="https://example.com/a/very/long/link"
              aria-invalid={!!errors.url}
              className="h-12 w-full bg-transparent text-base outline-none placeholder:text-ink/35"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-7 text-sm font-semibold text-paper transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Shortening...
              </>
            ) : (
              <>
                Shorten
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
        {errors.url && (
          <p className="mt-3 px-2 text-sm text-red-600">{errors.url.message}</p>
        )}
      </form>

      {param && <ResultTicket shortUrl={shortUrl} longUrl={data?.long_url ?? ""} />}

      <section className="animate-rise mt-16 mb-4 grid gap-px overflow-hidden rounded-3xl border-2 border-ink bg-ink [animation-delay:160ms] sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n} className="bg-paper p-6">
            <span className="font-mono text-xs text-ink/45">{step.n}</span>
            <h2 className="mt-6 font-display text-3xl">{step.title}</h2>
            <p className="mt-1 text-sm text-ink/60">{step.text}</p>
          </div>
        ))}
      </section>
    </SiteShell>
  );
}
