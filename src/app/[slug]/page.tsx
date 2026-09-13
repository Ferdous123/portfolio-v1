import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { privateCVs } from "@/constants/private-cvs";
import CVViewer from "@/components/features/CVViewer";

export const dynamicParams = false;

export function generateStaticParams() {
  return privateCVs.map((cv) => ({ slug: cv.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cv = privateCVs.find((c) => c.slug === slug);
  if (!cv) return {};
  return {
    title: `${cv.title} — Ferdus Hossain`,
    robots: { index: false, follow: false },
  };
}

export default async function CVPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cv = privateCVs.find((c) => c.slug === slug);
  if (!cv) notFound();

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <header className="px-6 py-5 border-b border-border flex items-center justify-between">
        <a
          href="/"
          className="text-xs font-mono tracking-widest uppercase text-fg-muted hover:text-accent transition-colors"
        >
          ← ferdus.vercel.app
        </a>
        <p className="text-xs font-mono tracking-widest uppercase text-fg-subtle">
          {cv.title}
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <CVViewer cv={cv} />
      </main>
    </div>
  );
}
