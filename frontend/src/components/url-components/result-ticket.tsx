import { useState } from "react";
import { ArrowUpRight, Check, Copy, Scissors } from "lucide-react";
import toast from "react-hot-toast";

type ResultTicketProps = {
  shortUrl: string;
  longUrl: string;
};

const labelClassName =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/45";

export function ResultTicket({ shortUrl, longUrl }: ResultTicketProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy, please copy it manually");
    }
  }

  return (
    <div className="animate-rise mt-10 overflow-hidden rounded-3xl border-2 border-ink bg-white">
      <div className="px-6 pt-5 pb-6">
        <p className={labelClassName}>Original</p>
        <a
          href={longUrl}
          target="_blank"
          rel="noreferrer"
          title={longUrl}
          className="mt-1 block truncate font-mono text-sm text-ink/60 hover:text-ink"
        >
          {longUrl}
        </a>
      </div>

      <div className="relative flex h-6 items-center">
        <span className="absolute -left-3.5 size-6 rounded-full border-2 border-ink bg-paper" />
        <div className="mx-6 flex-1 border-t-2 border-dashed border-ink/20" />
        <Scissors className="absolute left-8 size-4 bg-white text-ink/50" />
        <span className="absolute -right-3.5 size-6 rounded-full border-2 border-ink bg-paper" />
      </div>

      <div className="flex flex-col gap-5 px-6 pt-5 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className={labelClassName}>Your short link</p>
          <a
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block truncate font-mono text-2xl font-semibold tracking-tight hover:underline sm:text-3xl"
          >
            {shortUrl.replace(/^https?:\/\//, "")}
          </a>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-ink px-6 text-sm font-semibold transition sm:flex-none ${
              copied ? "bg-ink text-acid" : "bg-acid text-ink hover:-translate-y-0.5"
            }`}
          >
            {copied ? (
              <>
                <Check className="size-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copy link
              </>
            )}
          </button>
          <a
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open short link"
            className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink transition hover:bg-ink hover:text-paper"
          >
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
