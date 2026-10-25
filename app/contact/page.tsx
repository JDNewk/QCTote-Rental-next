"use client";

import { useState } from "react";
import { siteConfig } from "@/config/siteConfig";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");
    setSubmitError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to send your message.");
      }

      setSubmitMessage(
        "Your message was sent. QC Tote Rental will respond as soon as possible."
      );
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to send your message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass =
    "w-full rounded-lg border border-slate-400 bg-white px-4 py-3 text-base text-slate-950 placeholder:text-slate-500 shadow-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-400/50";

  return (
    <main className="bg-slate-50">
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-12 text-center md:py-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-400">
            QC Tote Rental
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Questions about tote rentals, delivery areas, or scheduling? Send us a message and we will respond as soon as possible.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-12">
          <div className="rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-lime-400">
              Get In Touch
            </p>
            <h2 className="mt-2 text-2xl font-black">We're here to help.</h2>
            <p className="mt-4 leading-7 text-slate-300">
              Have questions about renting totes, delivery zones, or scheduling? Reach out and we will respond as soon as possible.
            </p>

            <div className="mt-7 space-y-4">
              <a
                href={siteConfig.phoneHref}
                className="block rounded-xl border border-slate-700 bg-slate-900 p-4 font-semibold text-white transition hover:border-lime-400 hover:text-lime-400"
              >
                📞 {siteConfig.phone}
              </a>
              <a
                href={siteConfig.emailHref}
                className="block break-all rounded-xl border border-slate-700 bg-slate-900 p-4 font-semibold text-white transition hover:border-lime-400 hover:text-lime-400"
              >
                ✉️ {siteConfig.email}
              </a>
            </div>

            <p className="mt-6 text-sm leading-6 text-slate-400">
              Prefer texting? Send us a message and we will reply as soon as possible.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h2 className="mb-6 text-2xl font-bold text-slate-950">
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-2 block font-semibold text-slate-900">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block font-semibold text-slate-900">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block font-semibold text-slate-900">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className={fieldClass}
                />
              </div>

              {submitMessage && (
                <div className="rounded-lg border border-lime-300 bg-lime-50 p-4 text-sm font-medium text-slate-900" role="status">
                  {submitMessage}
                </div>
              )}

              {submitError && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-800" role="alert">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-lime-400 px-6 py-3.5 text-base font-bold text-slate-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
              >
                {isSubmitting ? "Sending Message..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
