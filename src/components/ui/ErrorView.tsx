"use client";

export default function ErrorView({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-mono tracking-widest text-fg-muted uppercase mb-4">
        Error
      </p>
      <h2 className="text-3xl font-bold text-fg mb-4">
        Something went wrong
      </h2>
      <p className="text-fg-muted mb-8 max-w-sm">
        An unexpected error occurred. You can try again or come back later.
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-6 py-3 rounded-full bg-surface-inverted text-fg-inverted text-sm font-semibold hover:opacity-90 transition"
      >
        Try again
      </button>
    </div>
  );
}
