export interface PrivateCV {
  slug: string;
  title: string;
  /** Path under /public/cv/. Null = not yet uploaded. */
  file: string | null;
}

/**
 * Private CV pages.
 *
 * To add a CV:
 *   1. Drop the PDF in `public/cv/<filename>.pdf`.
 *   2. Add an entry here with `file: "/cv/<filename>.pdf"`.
 *
 * Routes are statically generated. Only slugs listed here exist — all
 * others return 404. Pages carry noindex metadata and X-Robots-Tag: noindex
 * headers. They are not linked anywhere from the main site.
 */
export const privateCVs: PrivateCV[] = [
  {
    slug: "research",
    title: "Research CV",
    file: "/cv/research-7q4m2k.pdf",
  },
];
