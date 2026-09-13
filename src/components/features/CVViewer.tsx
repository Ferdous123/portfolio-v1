"use client";

import { type PrivateCV } from "@/constants/private-cvs";
import { useState, useEffect, useRef, useCallback } from "react";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PDFDocumentProxy = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PDFPageProxy = any;

function PDFViewer({ file, title }: { file: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const renderingRef = useRef(false);

  const [pages, setPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Render all pages at cssWidth × min(DPR,3) × 1.5 backing store
  const renderPages = useCallback(async () => {
    if (!pdfRef.current || renderingRef.current) return;
    renderingRef.current = true;
    const pdf = pdfRef.current;
    const numPages = pdf.numPages;
    const containerWidth = containerRef.current?.clientWidth ?? 800;
    const dpr = Math.min(window.devicePixelRatio ?? 1, 3);
    const backingScale = dpr * 1.5;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page: PDFPageProxy = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const cssScale = containerWidth / viewport.width;
      const renderScale = cssScale * backingScale;
      const renderViewport = page.getViewport({ scale: renderScale });

      const canvas = canvasRefs.current[pageNum - 1];
      if (!canvas) continue;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;
      // CSS display size = container width (auto height)
      canvas.style.width = "100%";
      canvas.style.height = "auto";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (page as any).render({ canvasContext: ctx, viewport: renderViewport }).promise;
    }
    renderingRef.current = false;
  }, []);

  // Load the PDF once
  useEffect(() => {
    let cancelled = false;

    async function loadPDF() {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        // Worker is copied to /public to avoid bundler path issues
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjsLib.getDocument({ url: file });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        pdfRef.current = pdf;
        setPages(pdf.numPages);
        setLoading(false);

        // Defer rendering to next tick so canvasRefs are populated
        setTimeout(() => { if (!cancelled) renderPages(); }, 50);
      } catch {
        if (!cancelled) {
          setError("Failed to load PDF. Use the download link below.");
          setLoading(false);
        }
      }
    }

    loadPDF();
    return () => { cancelled = true; };
  }, [file, renderPages]);

  // Re-render on container resize (debounced 200ms)
  useEffect(() => {
    if (!containerRef.current) return;
    let debounce: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(debounce);
      debounce = setTimeout(() => { renderPages(); }, 200);
    });
    ro.observe(containerRef.current);
    return () => { clearTimeout(debounce); ro.disconnect(); };
  }, [renderPages]);

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
