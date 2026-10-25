"use client";

import { useState } from "react";
import { siteConfig } from "@/config/siteConfig";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Message submitted!");
  };
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-center mb-10">
        Contact Us
      </h1>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

       {/* LEFT SIDE — Message & Contact Info */}
<div className="space-y-6">
  <p className="text-gray-600 text-base leading-relaxed">
    Have questions about renting totes, delivery zones, or scheduling?
    Reach out — we’re here to help and typically respond within the hour.
  </p>

  <div className="space-y-2 text-gray-700 text-lg font-medium">
    <p>📞 {siteConfig.phone}</p>
    <p>✉️ {siteConfig.email}</p>
  </div>

  <p className="text-gray-500 text-sm">
    Prefer texting? Send us a message anytime — we’re quick to reply.
  </p>
</div>


        {/* RIGHT SIDE — Form */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
