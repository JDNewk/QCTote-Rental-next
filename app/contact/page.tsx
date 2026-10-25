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
      if (!response.ok) throw new Error(result.error || "Unable to send your message.");
      setSubmitMessage("Your message was sent. QC Tote Rental will respond as soon as possible.");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to send your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-10 text-center text-3xl font-bold">Contact Us</h1>

      <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <p className="text-base leading-relaxed text-gray-600">
            Have questions about renting totes, delivery zones, or scheduling?
            Reach out through the form and we will respond as soon as possible.
          </p>

          <div className="space-y-3 text-lg font-medium text-gray-700">
            <p>📞 {siteConfig.phone}</p>
            <p>
              ✉️ <a href="mailto:info@qctoterentals.com" className="text-slate-900 underline decoration-lime-400 decoration-2 underline-offset-4 hover:text-lime-600">info@qctoterentals.com</a>
            </p>
          </div>

          <p className="text-sm text-gray-500">
            Prefer texting? Send us a message anytime and we will reply as soon as possible.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 shadow-sm">
          <h2 className="mb-6 text-center text-xl font-semibold">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block font-medium text-gray-700">Name</label>
              <input id="name" type="text" name="name" value={form.name} onChange={handleChange} required autoComplete="name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block font-medium text-gray-700">Email</label>
              <input id="email" type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" />
            </div>
            <div>
              <label htmlFor="message" className="mb-1 block font-medium text-gray-700">Message</label>
              <textarea id="message" name="message" value={form.message} onChange={handleChange} required rows={5} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" />
            </div>

            {submitMessage && <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800" role="status">{submitMessage}</div>}
            {submitError && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{submitError}</div>}

            <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-lime-400 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-lime-200">
              {isSubmitting ? "Sending Message..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
