"use client";

import { type PrivateCV } from "@/constants/private-cvs";
import { useState, useEffect, useRef } from "react";

interface Props {
  cv: PrivateCV;
}

export default function CVViewer({ cv }: Props) {
  if (!cv.file) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 rounded-2xl border border-border flex items-center justify-center mb-6">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-fg-muted"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-fg tracking-tight mb-3">
          {cv.title}
        </h1>
        <p className="text-fg-muted text-base max-w-sm">
          CV will be available here soon.
        </p>
      </div>
    );
  }

  return <PDFViewer file={cv.file} title={cv.title} />;
}

function PDFViewer({ file, title }: { file: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadPDF() {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        // Use bundled worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const loadingTask = pdfjsLib.getDocument({ url: file });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const numPages = pdf.numPages;
        setPages(numPages);
        setLoading(false);

        // Render each page
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const containerWidth = containerRef.current?.clientWidth ?? 800;
          const viewport = page.getViewport({ scale: 1 });
          const scale = Math.min((containerWidth - 32) / viewport.width, 2);
          const scaledViewport = page.getViewport({ scale });

          const canvas = canvasRefs.current[pageNum - 1];
          if (!canvas) continue;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (page as any).render({ canvasContext: ctx, viewport: scaledViewport }).promise;
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load PDF. Try the download link below.");
          setLoading(false);
        }
      }
    }

    loadPDF();
    return () => { cancelled = true; };
  }, [file]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-8">
        <a
          href={file}
          download
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border-strong text-sm font-medium text-fg-secondary hover:border-accent hover:text-accent transition-colors"
        >
          Download PDF ↓
        </a>
        <a
          href={file}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border-strong text-sm font-medium text-fg-secondary hover:border-accent hover:text-accent transition-colors"
        >
          Open in new tab ↗
        </a>
      </div>

      <h1 className="text-xl font-bold text-fg mb-6">{title}</h1>

      {loading && (
        <div className="flex items-center justify-center py-20 text-fg-muted text-sm">
          Loading PDF…
        </div>
      )}
      {error && (
        <div className="py-8 text-center text-danger text-sm">{error}</div>
      )}

      <div ref={containerRef} className="space-y-4">
        {Array.from({ length: pages }, (_, i) => (
          <canvas
            key={i}
            ref={(el) => { canvasRefs.current[i] = el; }}
            className="w-full rounded-lg border border-border shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}
