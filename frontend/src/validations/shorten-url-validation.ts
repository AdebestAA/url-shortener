import { z } from "zod";

export const shortenUrlSchema = z.object({
  url: z.url("Enter a valid URL, e.g. https://example.com"),
});

export type ShortenUrlFormValues = z.infer<typeof shortenUrlSchema>;
