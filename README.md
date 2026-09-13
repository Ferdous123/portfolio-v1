# Ferdus Hossain — Portfolio

Research portfolio for Ferdus Hossain. Live at **https://ferdus.vercel.app**.

Built with Next.js 16 App Router, TypeScript, Tailwind CSS v4, framer-motion.

---

## Adding a Research CV

When the PDF is ready:

1. Drop the file into `public/cv/research.pdf`.
2. Open `src/constants/private-cvs.ts` and change the `file` field from `null` to `"/cv/research.pdf"`.
3. Push — Vercel redeploys automatically.

The `/research` page will then render the PDF via pdf.js with Download and Open-in-tab buttons.

To add a second CV (e.g. a teaching CV):

1. Add a new entry to `src/constants/private-cvs.ts`: `{ slug: "teaching", title: "Teaching CV", file: "/cv/teaching.pdf" }`.
2. Drop `public/cv/teaching.pdf`.
3. Push.

Private CV pages carry `robots: noindex`, `X-Robots-Tag: noindex`, are excluded from the sitemap, and are not linked anywhere from the main site.

---

## Content updates

All content lives in `src/constants/`. No component edits are needed for content changes.

| What to update | File |
|---|---|
| Publications | `src/constants/publications.ts` |
| Experience | `src/constants/experience.ts` |
| Projects | `src/constants/projects.ts` |
| Private CVs | `src/constants/private-cvs.ts` |
| Navigation | `src/constants/navigation.ts` |
| Site metadata | `src/constants/site.ts` |

---

## Development

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

---

## Attribution

Site scaffold based on [AlAminNahid/portfolio-v1](https://github.com/AlAminNahid/portfolio-v1).
