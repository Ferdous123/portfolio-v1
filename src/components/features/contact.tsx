"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";

const FALLBACK_EMAIL = "ferdus.h.r362@gmail.com";

type FormStatus = "idle" | "pending" | "success" | "error";
type ErrorCode = string | null;

function statusMessage(status: FormStatus, code: ErrorCode): string | null {
  if (status === "success") return "Message sent — I will get back to you soon.";
  if (status === "error") {
    if (code === "unconfigured")
      return `The form isn't available right now. Please email ${FALLBACK_EMAIL}.`;
    if (code === "rate_limit") return "Too many submissions. Please try again later.";
    if (code === "bot" || code === "toosoon") return "Submission rejected. Please try again.";
    if (code === "invalid_name") return "Please enter your name (max 100 characters).";
    if (code === "invalid_email") return "Please enter a valid email address.";
    if (code === "invalid_message") return "Message must be 10–5000 characters.";
    if (code === "too_many_links") return "Please reduce the number of links in your message.";
    return "Something went wrong. Please try again or email directly.";
  }
  return null;
}

export default function Contact() {
  const searchParams = useSearchParams();
  const sent = searchParams.get("sent");
  const errorParam = searchParams.get("error");

  // Derive initial status from URL params (no-JS redirect result)
  const [status, setStatus] = useState<FormStatus>(
    sent === "1" ? "success" : errorParam ? "error" : "idle"
  );
  const [errorCode, setErrorCode] = useState<ErrorCode>(errorParam ?? null);

  // Render timestamp — filled client-side to enable time-trap
  const [renderTs] = useState<string>(() => String(Date.now()));

  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "pending") return;
    setStatus("pending");

    const form = e.currentTarget;
    const data = new FormData(form);
    const body = {
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
      _ts: renderTs,
      _hp: data.get("_hp") ?? "",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.ok) {
        setStatus("success");
        formRef.current?.reset();
      } else {
        setStatus("error");
        setErrorCode(json.code ?? null);
      }
    } catch {
      setStatus("error");
      setErrorCode(null);
    }
  }

  const msg = statusMessage(status, errorCode);
  const isUnconfigured = errorCode === "unconfigured";

  return (
    <section
      id="contact"
      className="w-full px-6 lg:px-[8%] py-24 scroll-mt-20 border-t border-border"
    >
      <Reveal className="max-w-3xl mx-auto">
        <p className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-2">
          Contact
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-fg tracking-tight leading-tight mb-4">
          Get in touch
        </h2>
        <p className="text-base text-fg-muted leading-relaxed mb-10">
          Open to research collaborations, visiting student opportunities, and discussions about decision-making under uncertainty or trustworthy ML.
        </p>

        {/* Status banner — aria-live so screen readers announce updates */}
        <div aria-live="polite" aria-atomic="true" className="mb-6">
          {msg && (
            <p
              className={`text-sm font-mono px-4 py-3 rounded-lg border ${
                status === "success"
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {msg}
            </p>
          )}
        </div>

        {/* Form — no-JS: native POST; with JS: fetch */}
        {!isUnconfigured && status !== "success" && (
          <form
            ref={formRef}
            method="post"
            action="/api/contact"
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
          >
            {/* Honeypot — hidden from humans, filled by bots */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
              <label htmlFor="contact-hp">Leave this blank</label>
              <input id="contact-hp" name="_hp" type="text" autoComplete="off" tabIndex={-1} />
            </div>

            {/* Render timestamp — time-trap */}
            <input type="hidden" name="_ts" value={renderTs} />

            <div>
              <label htmlFor="contact-name" className="block text-xs font-mono tracking-widest uppercase text-fg-muted mb-2">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                maxLength={100}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-fg text-sm placeholder:text-fg-subtle focus:outline-none focus:border-accent/60 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-xs font-mono tracking-widest uppercase text-fg-muted mb-2">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                maxLength={200}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-fg text-sm placeholder:text-fg-subtle focus:outline-none focus:border-accent/60 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-mono tracking-widest uppercase text-fg-muted mb-2">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                minLength={10}
                maxLength={5000}
                rows={6}
                placeholder="What would you like to discuss?"
                className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-fg text-sm placeholder:text-fg-subtle focus:outline-none focus:border-accent/60 transition-colors resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={status === "pending"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-fg text-fg-inverted text-sm font-semibold hover:opacity-80 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "pending" ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </Reveal>
    </section>
  );
}
