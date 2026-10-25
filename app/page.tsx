"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="relative w-full bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-gray-900">
            QC Tote Rental
          </h1>
          <p className="mt-6 text-lg max-w-2xl mx-auto text-gray-600">
            Durable, stackable moving totes delivered to your door in the Quad Cities.
            No cardboard. No tape. No hassle.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/reserve"
              className="px-8 py-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Reserve Totes
            </Link>

            <Link
              href="/pricing"
              className="px-8 py-4 rounded-lg bg-gray-200 text-gray-900 font-semibold hover:bg-gray-300 transition"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-100 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Rent Moving Totes?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <h3 className="text-xl font-semibold mb-4">Eco‑Friendly</h3>
              <p className="text-gray-600">
                Reusable totes reduce waste and eliminate the need for cardboard boxes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <h3 className="text-xl font-semibold mb-4">Stronger & Safer</h3>
              <p className="text-gray-600">
                Protect your belongings with durable, stackable containers that won’t collapse.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <h3 className="text-xl font-semibold mb-4">Delivered to You</h3>
              <p className="text-gray-600">
                We drop off totes at your home and pick them up when you’re done.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20 text-center text-white">
        <h2 className="text-3xl font-bold mb-6">Ready to Make Moving Easier?</h2>
        <p className="max-w-2xl mx-auto text-lg mb-10">
          Reserve your totes today and experience a cleaner, faster, stress‑free move.
        </p>

        <Link
          href="/reserve"
          className="px-10 py-4 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
        >
          Reserve Now
        </Link>
      </section>
    </main>
  );
}
